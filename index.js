!(function (window, document) {
    "use strict";
    if (window._page) return;
    var page = window._page = {};

    var show = false;
    var panel = null;
    var duration = 200;
    var picks = null;
    var copies = null;
    Object.defineProperties(page, {
        // 侧栏 webview 对象
        panel: {
            enumerable: true,
            configurable: false,
            set: function (p) {
                panel = p;
            },
            get: function () {
                return panel;
            }
        },
        picks: {
            enumerable: true,
            configurable: false,
            set: function (p) {
                picks = p;
                if (!(picks instanceof Array)) return;
                // 已经没有被选中的文件
                // 隐藏选项栏, 否则显示
                var webview = plus.webview.getWebviewById("file_list");
                if (!picks.length) {
                    webview.setStyle({ bottom: "0px" });
                } else {
                    webview.setStyle({ bottom: "50px" });
                }
            },
            get: function () {
                return picks;
            }
        },
        copies: {
            enumerable: true,
            configurable: false,
            set: function (c) {
                copies = c;
                // 切换粘贴是否可用
                if (c instanceof Array && c.length > 0) {
                    document.body.querySelector("#paste").setAttribute("class", "mui-tab-item");
                } else {
                    document.body.querySelector("#paste").setAttribute("class", "mui-tab-item disabled");
                }
            },
            get: function () {
                return copies;
            }
        }
    });

    // 侧栏是否显示
    page.isShow = function () {
        return show;
    };
    // 显示侧栏
    page.showPanel = function () {
        if (this.isShow()) return;
        var panel = this.panel;
        panel.show("none", 0, function () {
            // menu设置透明遮罩防止点击
            panel.setStyle({
                mask: "rgba(0,0,0,0)",
                // left: -document.documentElement.clientWidth * 0.4+"px",
                left: "0",
                transition: {
                    duration: duration
                }
            });

            var main = plus.webview.currentWebview();
            //主窗体开始显示遮罩 
            main.setStyle({
                mask: 'rgba(0,0,0,0.4)',
                // left: '40%',
                transition: {
                    duration: duration
                }
            });
            setTimeout(function () {
                panel.setStyle({
                    mask: "none"
                });
            }, duration);
        });

        show = true;
    }
    // 隐藏侧栏
    page.hidePanel = function () {
        if (!this.isShow()) return;

        var main = plus.webview.currentWebview();
        var panel = this.panel;
        main.setStyle({
            mask: "none",
            left: "0",
            transition: {
                duration: duration
            }
        });
        panel.setStyle({
            left: -document.documentElement.clientWidth * 0.4 + "",
            mask: "rgba(0,0,0,0)",
            transition: {
                duration: duration
            }
        });
        setTimeout(function () {
            panel.hide();
        }, duration);

        show = false;
    }
    page.onPicks = function (event) {
        //获得事件参数
        page.picks = event.detail.picks;
    }
    // 删除选中内容
    page.onDelete = function () {
        var picks = page.picks;
        if (!(picks instanceof Array) || !picks.length) return;
        mui.confirm("是否删除 " + picks.length + " 项内容 ?",
            "提示",
            ["确认", "取消"],
            function (event) {
                var picks = page.picks;
                // 删除是否执行的判断
                if (!(picks instanceof Array) || !picks.length) return;
                if (event.index !== 0) return;
                // 删除统计 result[0] 成功数量 result[1] 失败数量
                var result = [0, 0];
                var onSuccess = function () {
                    result[0]++;
                    if (result[0] + result[1] === picks.length) {
                        mui.toast("执行完毕! 成功: " + result[0] + ", 失败: " + result[1]);
                        mui.fire(plus.webview.getWebviewById("file_list"), Events.refresh);
                        page.picks = [];
                    }
                }
                var onFailure = function () {
                    result[1]++;
                    if (result[0] + result[1] === picks.length) {
                        mui.toast("执行完毕! 成功: " + result[0] + ", 失败: " + result[1]);
                    }
                }
                for (var i = picks.length - 1; i >= 0; i--) {
                    plus.io.resolveLocalFileSystemURL("file://" + picks[i],
                        function (entry) {
                            if (entry.isDirectory) {
                                entry.removeRecursively(onSuccess, onFailure);
                            } else if (entry.isFile) {
                                entry.remove(onSuccess, onFailure)
                            } else {
                                mui.toast("无法识别: " + entry.fullPath);
                            }
                        },
                        function (error) {
                            mui.toast([error.name, error.message, error.stack].join(", "));
                        });
                }
            });
    }
    // 复制、剪切选中内容 
    page.onCopy = function (event) {
        var picks = page.picks;
        if (!(picks instanceof Array) || !picks.length) return;

        var targetId = event.currentTarget.getAttribute("id");
        var text = null;
        switch (targetId) {
            case "cut":
                text = "剪切";
                break;
            case "copy":
                text = "复制";
                break;
            default:
                mui.toast("无法识别操作: " + targetId);
                break;
        }

        // 复制的内容 以及操作的模式 copy 或 cut
        var copies = picks.slice(0, picks.length);
        copies.type = targetId;
        page.copies = copies;
        mui.toast(text + "完毕! " + copies.length + " 项内容.");
        mui.fire(plus.webview.getWebviewById("file_list"), Events.refresh);
    }
    // 粘贴选中项
    page.onPaste = function () {
        // 发送事件
        mui.fire(plus.webview.getWebviewById("file_list"), Events.paste, { type: page.copies.type, files: page.copies });
    }
    page.onNew = function() {
        mui.fire(plus.webview.getWebviewById("file_list"), Events.new);
    }
})(window, document);