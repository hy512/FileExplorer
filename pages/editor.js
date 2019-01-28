


function initVue() {
    return new Vue({
        el: "#app",
        components: {
            "x-editor": {
                template: "#x-editor",
                beforeMount: function () {
                    var webview = plus.webview.currentWebview();
                    var self = this;
                    // 获取 uri 等信息
                    this.uri = webview.uri;
                    this.title = /[^/]+$/.exec(this.uri)[0];
                    this.content = webview.content;
                    this.scheme = /^[^:]+/.exec(this.uri)[0];
                    // 如果没有传递内容过来，就执行读取任务
                    if (!this.content) {

                        switch (this.scheme) {
                            case "file":
                                this.readFile(this.uri, function (error, content) {
                                    if (error) {
                                        self.onError(error);
                                        return;
                                    }
                                    // console.log(content)
                                    self.content = content;
                                    // console.log(self.content);
                                });
                                break;
                            case "http":
                                break;
                            default:
                                mui.toast("不支持的资源协议类型: " + this.scheme);
                                break;
                        }
                    }

                    // 监听修改信息
                    window.addEventListener(Events.renewal, function (event) {
                        var detail = event.detail;
                        // console.log(JSON.stringify(detail));
                        // console.log(detail.uri !== self.uri)
                        // console.log(detail.content === self.content)
                        if (!detail) return;
                        // 与当前管理的不是同一个文件
                        if (detail.uri !== self.uri) return;
                        // 没有更新内容
                        if (detail.content === self.content) return;
                        self.content = detail.content;
                        if (!self.renew) self.renew = true;
                        // console.log(self.content + ", " + self._content === detail.content)
                    });
                },
                data: function () {
                    return {
                        title: "",
                        uri: "",
                        _content: "",
                        scheme: "",
                        renew: false,
                    };
                },
                computed: {
                    content: {
                        get: function () {
                            // console.log("get " + this._content)
                            return this._content;
                        },
                        set: function (v) {
                            // console.log ("set " + v)
                            v = v || "";
                            mui.fire(plus.webview.getWebviewById("markdown-editor"),
                                Events.open,
                                { content: this._content = v, uri: this.uri });
                        }
                    }
                },
                methods: {
                    // 出错的情况
                    onError: function (error) {
                        var errorMsg = [error.name, error.message, error.stack].join(", ");
                        // console.log(errorMsg);
                        mui.toast(errorMsg);
                    },

                    onSave: function (event) {
                        var self = this;
                        this.writeFile(this.uri, this._content, function(error, length) {
                            if (error) {
                                self.onError(error);
                                return;
                            }
                            mui.toast("写入成功 ! 长度: " + length);
                            self.renew = false;
                        });
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
                                // 读取文件操作完成
                                reader.onloadend = function (event) {
                                    file.close();
                                    var reader = event.target;
                                    // 判断是否错误
                                    if (reader.error) {
                                        callback(new Error("文件读取错误 ! 代码: " + reader.error), null);
                                        return;
                                    }
                                    // 判断是否读取完成
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
                    },

                    // 写入内容到指定文件
                    // uri: stirng - 文件 uri
                    // data: string - 写入的字符串数据
                    // callback: (error, length)=>void - 回调，写入的字节数量和错误信息
                    writeFile: function (uri, data,callback) {
                        if (!uri || typeof data !== "string") {
                            callback(new Error("写入内容不能为空 !"), null);
                            return;
                        }
                        plus.io.resolveLocalFileSystemURL(this.uri, function (entry) {
                            if (!entry.isFile) {
                                callback(new Error("目标资源不是文件 !", null));
                                return;
                            }
                            entry.createWriter(function (writer) {
                                writer.onwriteend = function (event) {
                                    var writer = event.target;
                                    // 是否出错
                                    if (writer.error) {
                                        callback(new Error("文件写入错误 ! 代码: " + writer.error), null);
                                        return;
                                    }
                                    // 是否写入完成
                                    if (writer.readyState !== plus.io.FileWriter.DONE) {
                                        callback("文件未写入完成 ! 状态: " + writer.readyState, null);
                                        return;
                                    }
                                    callback(null, writer.length);
                                };
                                // 开始写入
                                writer.write(data);
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
