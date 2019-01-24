function initVue() {
    return new Vue({
        el: "body > .mui-content",
        data: function () {
            return {
                uri: "",
                as: ""
            }
        },
        beforeMount: function () {
            var self = this;
            // 获取传入参数
            window.addEventListener(Events.open, function (event) {
                if (!event.detail) return;
                self.uri = event.detail.uri || "";
                self.as = event.detail.as || "";
            });
        },

        components: {
            "x-options": {
                template: "#x-options",
                props: ["as", "uri"],
                data: function () {
                    return {
                        options: {}
                    }
                },
                beforeMount: function () {
                    switch (this.as) {
                        default:
                            this.options = {
                                markdown: "打开为 markdown"
                            };
                            break;
                    }
                },
                methods: {
                    openMarkdown: function () {
                        mui.fire(plus.webview.currentWebview(), Events.open, { uri: this.uri, as: "markdown" });
                    }
                }
            }
        }
    });
}