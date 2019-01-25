


function initVue() {
    return new Vue({
        el: "#app",
        components: {
            "x-editor": {
                template: "#x-editor",
                beforeMount: function () {
                    var webview = plus.webview.currentWebview();
                    // 获取 uri 等信息
                    this.uri = webview.uri;
                    this.title = /[^/]+$/.exec(uri)[0];
                    this.content = webview.content;
                    this.scheme = /^[^:]+/.exec(this.uri)[0];
                    // 如果没有传递内容过来，就执行读取任务
                    if (!this.content) {
                        var self = this;
                        switch (this.scheme) {
                            case "file":
                                this.readFile(this.uri, function (error, content) {
                                    if (error) {
                                        self.onError(error);
                                        return;
                                    }
                                    self.content = content;
                                });
                                break;
                            case "http":
                                break;
                            default:
                                mui.toast("不支持的资源协议类型: " + this.scheme);
                                break;
                        }
                    }
                },
                data: function () {
                    return {
                        title: "",
                        uri: "",
                        content: "",
                        scheme: "",
                        renew: false,
                    };
                },
                methods: {
                    // 出错的情况
                    onError: function (error) {
                        mui.toast([error.name, error.message, error.stack].join(", "));
                    },
                    // 读取 file 协议内容
                    // uri: string - 资源位置
                    // callback: (error, content)=>void - 回调
                    readFile: function (uri, callback) {
                        if (!uri) {
                            callback(new Error("uri 不能为空 !"), null);
                            return;
                        }
                        plus.io.resolveLocalFileSystemURL(this.uri, function (entry) {
                            if (!entry.isFile) {
                                callback(new Error("目标资源不是文件 !", null));
                                return;
                            }
                            entry.file(function (file) {
                                var reader = new plus.io.FileReader();
                                // 读取文件成功
                                reader.onload = function (event) {
                                    file.close();
                                    var reader = event.target;
                                    if (reader.readyState !== plus.io.FileReader.DONE) {
                                        callback(new Error("文件未读取完成 ! 状态: " + reader.readyState), null);
                                        return;
                                    }
                                    callback(null, reader.result);
                                };
                                // 读取文件失败
                                reader.onerror = function (event) {
                                    callback(new Error("文件读取失败 !" + event.target.error), null);
                                    file.close();
                                };
                                reader.readAsText(file);
                            }, function (error) {
                                callback(error, null);
                            });
                        }, function (error) {
                            callback(error, null);
                        });
                    }
                },
            }
        }
    });
}