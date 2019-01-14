!(function (window, document) {
    "use strict";
    if (window._page) return;
    var page = window._page = {};

    var show = false;
    var panel = null;
    var duration = 200;
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
        var picks = event.detail.picks;
        if (!(picks instanceof Array)) return;
        // 已经没有被选中的文件
        // 隐藏选项栏, 否则显示
        var webview = plus.webview.getWebviewById("file_list");
        if (!picks.length) {
            webview.setStyle({ bottom: "0px" });
        } else {
            webview.setStyle({ bottom: "50px" });
        }
    }
})(window, document);