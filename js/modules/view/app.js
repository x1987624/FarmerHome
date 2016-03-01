/**
 * 演示程序当前的 “注册/登录” 等操作，是基于 “本地存储” 完成的
 * 当您要参考这个演示程序进行相关 app 的开发时，
 * 请注意将相关方法调整成 “基于服务端Service” 的实现。
 **/
define(function(require, exports, module) {
	/**
	 * 用户登录
	 **/
	exports.login = function(loginInfo, callback) {
		callback = callback || mui.noop;
		loginInfo = loginInfo || {};
		loginInfo.account = loginInfo.account || '';
		loginInfo.password = loginInfo.password || '';
		if (loginInfo.account.length < 5) {
			return callback('账号最短为 5 个字符');
		}
		if (loginInfo.password.length < 6) {
			return callback('密码最短为 6 个字符');
		}
		var users = JSON.parse(localStorage.getItem('$users') || '[]');
		var authed = users.some(function(user) {
			return loginInfo.account == user.account && loginInfo.password == user.password;
		});
		if (authed) {
			return owner.createState(loginInfo.account, callback);
		} else {
			return callback('用户名或密码错误');
		}
	};

	exports.createState = function(name, callback) {
		var state = owner.getState();
		state.account = name;
		state.token = "token123456789";
		owner.setState(state);
		return callback();
	};

	/**
	 * 新用户注册
	 **/
	exports.reg = function(regInfo, callback) {
		localStorage.clear();
		callback = callback || mui.noop;
		regInfo = regInfo || {};
		regInfo.account = regInfo.account || '';
		regInfo.password = regInfo.password || '';
		regInfo.code = regInfo.code || '';
		if (regInfo.password.length < 6) {
			return callback('密码最短需要 6 个字符');
		}

		mui.ajax('http://****/usermsg.ashx?action=user_register', {
			data: {
				"password": regInfo.password,
				"telephone": regInfo.telephone,
				"code": regInfo.code,
			},
			dataType: 'json', //服务器返回json格式数据
			type: 'post', //HTTP请求类型
			success: function(data) {
				if (data.status == 1) {
					//注册成功直接登录
					var state = getState();
					state.account = regInfo.account;
					owner.setState(state);
					//本地存储信息
					var users = JSON.parse(localStorage.getItem('$users') || '[]');
					users.push(regInfo);
					localStorage.setItem('$users', JSON.stringify(users));

					mui.toast(data.msg);
					plus.nativeUI.toast('注册成功！');
					plus.webview.getWebviewById("reg").close();
					return callback();
				} else {
					console.log(data.status);
					mui.toast(data.msg);
					return callback(data.msg);
				}
			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				console.log(type);
				console.log(errorThrown);
				plus.nativeUI.toast(err);
			}
		});

		return callback();
	};

	/**
	 * 获取当前状态
	 **/
	exports.getState = function() {
		var stateText = localStorage.getItem('$state') || "{}";
		return JSON.parse(stateText);
	};

	/**
	 * 设置当前状态
	 **/
	exports.setState = function(state) {
		state = state || {};
		localStorage.setItem('$state', JSON.stringify(state));
		//var settings = owner.getSettings();
		//settings.gestures = '';
		//owner.setSettings(settings);
	};

	var checkEmail = function(email) {
		email = email || '';
		return (email.length > 3 && email.indexOf('@') > -1);
	};

	/**
	 * 找回密码
	 **/
	exports.forgetPassword = function(email, callback) {
		callback = callback || mui.noop;
		if (!checkEmail(email)) {
			return callback('邮箱地址不合法');
		}
		return callback(null, '新的随机密码已经发送到您的邮箱，请查收邮件。');
	};

	/**
	 * 获取应用本地配置
	 **/
	exports.setSettings = function(settings) {
		settings = settings || {};
		localStorage.setItem('$settings', JSON.stringify(settings));
	}

	/**
	 * 设置应用本地配置
	 **/
	exports.getSettings = function() {
		var settingsText = localStorage.getItem('$settings') || "{}";
		return JSON.parse(settingsText);
	}

	/*
	 * 进入主页
	 * */
	exports.toMain = function() {
		mui.fire(mainPage, 'show', null);
		setTimeout(function() {
			mui.openWindow({
				id: 'main',
				show: {
					aniShow: 'pop-in'
				},
				waiting: {
					autoShow: false
				}
			});
		}, 0);
	};

	/*
	 * 微信登录
	 * */
	exports.wxLogin = function(b) {
		mui.sendRequest(mui.constMap.ROOT_PATH + "/user/signin", {
			unionid: b.unionid,
			userinfo: b
		}, function(j) {
			if (!j.status.succeed) {
				window.localStorage.removeItem("user");
				window.localStorage.removeItem("login");
				var h = auths.weixin;
				if (h) {
					h.logout(function() {
						console.log('注销"' + h.description + '"成功')
					}, function(c) {
						console.log('注销"' + h.description + '"失败：' + erros.message)
					})
				}
				mui.alert(j.status.error_desc);
				return
			}
			j.data.expire = mui.now();
			j.data.expire += 15 * 60 * 1000;
			window.localStorage.setItem("user", JSON.stringify(j.data));
			window.localStorage.setItem("login", JSON.stringify(b));
			mui.toast("登陆成功");
			var g = plus.webview.getWebviewById("cart.html"),
				i = plus.webview.getWebviewById("home.html");
			mui.fire(g, "refresh", {
				action: "login"
			});
			mui.fire(i, "refresh", {
				action: "login"
			});
			var a = plus.webview.currentWebview();
			if (a.id == "login.html") {
				mui.back()
			}
		})
	}

});