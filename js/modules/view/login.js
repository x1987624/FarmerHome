define(function(require, exports, module) {
	var app = require("./app");

	mui.init({
		statusBarBackground: '#f7f7f7'
	});
	mui.plusReady(function() {
		plus.screen.lockOrientation("portrait-primary");
		var settings = app.getSettings();
		var state = app.getState();
		var mainPage = mui.preload({
			"id": 'main',
			"url": 'main.html'
		});
		//检查 "登录状态/锁屏状态" 开始
		if (settings.autoLogin && state.token && settings.gestures) {
			mui.openWindow({
				url: 'unlock.html',
				id: 'unlock',
				show: {
					aniShow: 'pop-in'
				},
				waiting: {
					autoShow: false
				}
			});
		} else if (settings.autoLogin && state.token) {
			app.toMain();
		} else {
			//第三方登录
			var auths = {};
			var oauthArea = document.querySelector('#weixin');
			plus.oauth.getServices(function(services) {
				for (var i in services) {
					var service = services[i];
					auths[service.id] = service;

					console.log("已获取" + service.id + "登陆服务")
				}
			}, function(e) {

				plus.nativeUI.toast("获取登录认证失败：" + e.message);
			});
		}
		// close splash
		setTimeout(function() {
			//关闭 splash
			plus.navigator.closeSplashscreen();
		}, 600);
		//检查 "登录状态/锁屏状态" 结束
		var loginButton = document.getElementById('login');
		var accountBox = document.getElementById('account');
		var passwordBox = document.getElementById('password');
		var autoLoginButton = document.getElementById("autoLogin");
		var regButton = document.getElementById('reg');
		var forgetButton = document.getElementById('forgetPassword');
		var wxLoginButton = document.getElementById("weixin");
		loginButton.addEventListener('tap', function(event) {
			var loginInfo = {
				account: accountBox.value,
				password: passwordBox.value
			};
			app.login(loginInfo, function(err) {
				if (err) {
					plus.nativeUI.toast(err);
					return;
				}
				toMain();
			});
		});
		mui.enterfocus('#login-form input', function() {
			mui.trigger(loginButton, 'tap');
		});
		autoLoginButton.classList[settings.autoLogin ? 'add' : 'remove']('mui-active')
		autoLoginButton.addEventListener('toggle', function(event) {
			setTimeout(function() {
				var isActive = event.detail.isActive;
				settings.autoLogin = isActive;
				app.setSettings(settings);
			}, 50);
		}, false);
		regButton.addEventListener('tap', function(event) {
			mui.openWindow({
				url: 'reg.html',
				id: 'reg',
				show: {
					aniShow: 'pop-in'
				},
				styles: {
					popGesture: 'hide'
				},
				waiting: {
					autoShow: false
				}
			});
		}, false);
		forgetButton.addEventListener('tap', function(event) {
			mui.openWindow({
				url: 'forget_password.html',
				id: 'forget_password',
				show: {
					aniShow: 'pop-in'
				},
				styles: {
					popGesture: 'hide'
				},
				waiting: {
					autoShow: false
				}
			});
		}, false);
		//微信登录
		wxLoginButton.addEventListener('tap', function(event) {
			var b = auths.weixin;
			if (b) {
				b.login(function() {
					console.log("登录认证成功：");
					console.log(JSON.stringify(b.authResult));
					console.log("----- 获取用户信息 -----");
					b.getUserInfo(function() {
						console.log("获取用户信息成功：");
						console.log(JSON.stringify(b.userInfo));
						app.wxLogin(b.userInfo)
					}, function(b) {
						console.log("获取用户信息失败：");
						console.log("[" + b.code + "]：" + b.message);
						mui.alert("获取用户信息失败！")
					})

				}, function(a) {
					console.log("登录认证失败：");
					console.log("[" + a.code + "]：" + a.message);
					if (a.code != -2 && a.code != -100) {
						mui.alert("微信登陆失败，错误代码：" + a.code)
					}
				})
			} else {
				console.log("无效的登录认证通道！");
				mui.toast("无效的登录认证通道！")
			}
		});

		//
		window.addEventListener('resize', function() {
			oauthArea.style.display = document.body.clientHeight > 400 ? 'block' : 'none';
		}, false);
		//
		var backButtonPress = 0;
		mui.back = function(event) {
			backButtonPress++;
			if (backButtonPress > 1) {
				plus.runtime.quit();
			} else {
				plus.nativeUI.toast('再按一次退出应用');
			}
			setTimeout(function() {
				backButtonPress = 0;
			}, 1000);
			return false;
		};
	});
})