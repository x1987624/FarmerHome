define(function(require, exports, module) {
	var app = require("./app");

	mui.init();

	mui.plusReady(function() {
		var settings = app.getSettings();
		var regButton = document.getElementById('reg');
		var telephoneBox = document.getElementById('telephone');
		var txtCodeBox = document.getElementById('txtCode');
		var passwordBox = document.getElementById('password');
		var passwordConfirmBox = document.getElementById('password_confirm');
		//提交注册
		regButton.addEventListener('tap', function(event) {
			var regInfo = {
				account: telephoneBox.value,
				password: passwordBox.value,
				code: txtCodeBox.value
			};
			var passwordConfirm = passwordConfirmBox.value;
			if (passwordConfirm != regInfo.password) {
				plus.nativeUI.toast('密码两次输入不一致');
				return;
			}
			app.reg(regInfo, function(err) {
				if (err) {
					plus.nativeUI.toast(err);
					return;
				}
				plus.nativeUI.toast('注册成功');
				$.openWindow({
					url: 'login.html',
					id: 'login',
					show: {
						aniShow: 'pop-in'
					}
				});
			});
		});
		//获取验证码
		var count = 0;
		document.getElementById('get_code').addEventListener('tap', function(event) {
			GetRegverifyCode();
		});

		//倒计时
		var WaitBoxStatus = function(leftSecond) {
			document.getElementById("get_code").innerText = "重新获取(" + leftSecond + "s)";
			leftSecond -= 1;
			if (leftSecond > 0) {
				document.getElementById("get_code").disabled = true;
				document.getElementById('get_code').removeEventListener("tap", null, true);
				setTimeout("WaitBoxStatus(" + leftSecond + ")", 1000);
			} else {
				document.getElementById('get_code').addEventListener('tap', function(event) {
					GetRegverifyCode();
				});
				document.getElementById("get_code").disabled = false;
				document.getElementById("get_code").innerText = "重新获取";
			}
		}

		//获取验证码方法
		var GetRegverifyCode = function() {
			mui.ajax('http://***/index.ashx?action=get_reg_message', {
				data: {
					"mobile": telephoneBox.value,
					"ip": plus.device.uuid
				},
				dataType: 'json', //服务器返回json格式数据
				type: 'post', //HTTP请求类型
				success: function(data) {
					if (data.status == 1) {
						count = data.time * 60;
						//GetNumber();
						WaitBoxStatus(60);
					}
					mui.toast(data.msg);
				},
				error: function(xhr, type, errorThrown) {
					//异常处理；
					mui.toast("出错提示:" + type + "," + errorThrown);
				}
			});
		}

		/*function GetNumber() {
			$("#get_code").hide();
			$("#mark").text(count + "秒后获取");
			$("#mark").show();

			count--;
			if (count > 0) {
				setTimeout(GetNumber, 1000);
			} else {
				count = 0;
				$("#get_code").val("获取验证码");
				$("#get_code").show();
				$("#mark").hide();
				//$("#get_code").attr("disabled", "");
			}
		}*/

	});
});