

function initVue() {
    return new Vue({
        el: "body > .mui-content",
        data: function () {
            return {
                path: "",
                list: [],
                picks: []
            }
        },
        mounted: function () {
            var view = plus.webview.currentWebview();
            this.path = view.path;
            var self = this;
            // 如果路径有误，使用默认路径
            if (typeof this.path !== "string" || !this.path.trim() || this.path.indexOf("/") !== 0) {
                plus.io.requestFileSystem(plus.io.PUBLIC_DOCUMENTS, function (fs) {
                    var entry = fs.root;
                    var file = self._file = new MFile(entry.fullPath);
                    // 判断是否存在目录再操作
                    file.exists(function (error, exists) {
                        if (error) {
                            self.onError(error);
                            return;
                        }
                        if (exists) {
                            self.intoDirectory(entry);
                            return
                        }
                        // 创建目录
                        file.mkdirs(function (error, success) {
                            if (error) {
                                self.onError(error);
                                return;
                            }
                            if (!success) {
                                mui.alert("目录不存在 !");
                                return;
                            }
                            // 从新来过
                            plus.io.resolveLocalFileSystemURL("file://" + file.getAbsolutePath(), function (entry) {
                                self.intoDirectory(entry);
                            }, this.onError);
                        });
                    });
                }, this.onError);
            } else {
                // 使用初始化参数提供的路径
                plus.io.resolveLocalFileSystemURL("file://" + self.path, function (entry) {
                    self.intoDirectory(entry);
                }, this.onError);
            }

            // 点击左上角返回按钮到上级目录
            window.addEventListener(Events.pathup, this.goOut);
            // 刷新文件列表
            window.addEventListener(Events.refresh, function () {
                plus.io.resolveLocalFileSystemURL("file://" + self.path, function (entry) {
                    self.intoDirectory(entry);
                }, function (error) {
                    self.onError(error);
                });
            });
            window.addEventListener(Events.paste, function (event) {
                self.onPaste(event.detail.type, event.detail.files);
            });
            window.addEventListener(Events.new, function (event) {
                self.showNewOption();
            });
        },
        methods: {
            // 退出目录
            goOut: function (event) {
            },

            goIn: function (event) {
                var self = this;
                plus.io.resolveLocalFileSystemURL("file://" + event.path, function (entry) {
                    self.intoDirectory(entry);
                }, this.onError);
            },

            // 选中元素
            select: function (event) {
                var picks = this.picks;
                if (event.checked) {
                    picks.push(event.path);
                } else {
                    picks = this.picks.filter(function (value) {
                        return value !== event.path;
                    });
                    this.picks = picks;
                }
                mui.fire(plus.webview.getLaunchWebview(), Events.updatepick, { picks: picks });
            },

            onError: function (e) {
                console.log([e.name, e.message, e.stack].join("\n"));
                // console.log(arguments.callee.caller.name + arguments.callee.caller);
            },

            onPaste: function (type, files) {
                if (!(files instanceof Array) || !files.length) {
                    mui.toast("操作失败! 未选中任何文件.");
                    return;
                }

                // 处理函数
                var process = null;
                var onFailure = function (error) {
                    result[1]++;
                    mui.toast([error.name, error.message, error.stack].join(", "));
                    if (result[0] + result[1] === files.length) {
                        mui.toast("操作完毕! 成功: " + result[0] + " 失败: " + result[1]);
                        self.intoDirectory(parent);
                        mui.fire(plus.webview.getLaunchWebview(), Events.updatepick, { picks: [] });

                    }
                }
                var onSuccess = function (entry) {
                    result[0]++;
                    if (result[0] + result[1] === files.length) {
                        mui.toast("操作完毕! 成功: " + result[0] + " 失败: " + result[1]);
                        self.intoDirectory(parent);
                        mui.fire(plus.webview.getLaunchWebview(), Events.updatepick, { picks: [] });

                    }
                }
                switch (type) {
                    case "copy":
                    case "cut":
                        process = function (entry) {
                            // 解析文件名
                            var name = /([^/]+)\/?$/.exec(entry.fullPath)[1];
                            if (typeof name !== "string" || !/^\S.*\S$/.test(name)) {
                                mui.toast("文件名错误: " + name);
                                result[1]++;
                                return;
                            }
                            switch (type) {
                                case "copy":
                                    entry.copyTo(parent, name, onSuccess, onFailure);
                                    break;
                                case "cut":
                                    console.log(entry.fullPath + ", " + parent.fullPath + ", " + name);
                                    entry.moveTo(parent, name, onSuccess, onFailure);
                                    break;
                            };
                        };
                        break;
                    default:
                        mui.toast("操作失败! type: " + type);
                        return;
                }
                var self = this;
                // 当前目录对象
                var parent = this.list[0].entry;
                // 成功和失败数量
                var result = [0, 0];
                // 开始复制文件
                for (var i = files.length - 1; i >= 0; i--) {
                    plus.io.resolveLocalFileSystemURL("file://" + files[i], process, onFailure);
                }
            },
            // 新建
            onNew: function (type, file) {
                var method = type !== "file" ? "getDirectory" : "getFile";
                var self = this;
                var parent = this.list[0].entry;
                var path = parent.fullPath;
                if (!/\/$/.test(path)) {
                    path = path + "/";
                }
                console.log(this.list[0].entry.fullPath + "  " + method + "  " +file);

                parent[method](file, { create: true, exclusive: true },
                    function (entry) {
                        mui.toast("创建成功 !");
                        console.log("创建成功: " +entry.fullPath);
                    }, function (error) {
                        mui.toast("创建失败 !");
                        self.onError(error);
                    });
            },
            // 显示新建表项
            showNewOption: function () {
                mui("#new-options").popover("toggle", document.body.querySelector("#new"));
            },

            inputNewName: function (event) {
                var type = event.target.getAttribute("x-new-type");
                var self = this;
                mui.prompt(" ", "", "新建", ["确认", "取消"], function (input) {
                    if (["file", "folder"].indexOf(type) < 0 || !input || typeof input.message !== "string") {
                        mui.toast("未知选项 - type: " + type + ", input: " + JSON.stringify(input));
                        return;
                    }
                    var name = input.message.trim();
                    if (!name.length) {
                        mui.toast("无效的文件名 !");
                        return;
                    }
                    self.onNew(type, name);
                });
            },

            // 进入一个目录
            intoDirectory: function (entry) {
                console.log("into: " + entry.fullPath)
                if (!entry.isDirectory) return;
                // 清除选中内容
                this.picks = [];

                this.path = entry.fullPath;
                var that = this;
                this.list = [];

                // 设置当前目录信息
                var currentDir = {
                    name: ".",
                    size: "",
                    modify: "",
                    icon: "fa-folder-o",
                    path: entry.fullPath,
                    isDirectory: entry.isDirectory,
                    entry: entry
                };
                // this.list.splice(0, 1, currentDir);
                this.list.push(currentDir);
                entry.getMetadata(function (meta) {
                    var dir = that.list[0];
                    dir.modify = meta.modificationTime.toISOString();
                    that.list.splice(0, 1, dir);
                }, that.onError, false);

                // 获取父目录信息
                entry.getParent(function (entry) {
                    var dir = {
                        name: "..",
                        size: "",
                        modify: "",
                        icon: "fa-folder-o",
                        path: entry.fullPath,
                        isDirectory: entry.isDirectory,
                        entry: entry
                    };
                    that.list.splice(1, 1, dir);
                    entry.getMetadata(function (meta) {
                        var dir = that.list[1];
                        dir.modify = meta.modificationTime.toISOString();
                        that.list.splice(1, 1, dir);
                    }, that.onError);
                }, that.onError);
                // 读取目录项目
                entry.createReader()
                    .readEntries(function (children) {
                        if (!children.length) return;
                        // 读取所有文件条目
                        var fileList = children.filter(function (value, index) {
                            if (value === null || value === undefined) return false;
                            return true;
                        }).map(function (v, i) {
                            return {
                                name: v.name,
                                path: v.fullPath,
                                isDirectory: v.isDirectory,
                                icon: v.isDirectory ? "fa-folder-o" : "fa-file-o",
                                entry: v
                            };
                        }).sort(function (l, r) {
                            if (l.isDirectory !== r.isDirectory) {
                                if (l.isDirectory) return -1;
                                else return 1;
                            }
                            var lNameLen = l.name.length;
                            var rNameLen = r.name.length;
                            var limitLen = lNameLen > rNameLen ? rNameLen : lNameLen;
                            for (var i = 0; i < limitLen; i++) {
                                if (l.name[i] === r.name[i]) continue;
                                if (l.name[i] > r.name[i]) return 1;
                                return -1;
                            }
                            return lNameLen > rNameLen ? 1 : -1;
                        });
                        that.list = that.list.slice(0, 2).concat(fileList);
                        // 读取所有条目详情信息
                        fileList.forEach(function (value, index) {
                            if (!value || !value.entry) return;
                            value.entry.getMetadata(function (meta) {
                                value.modify = meta.modificationTime.toISOString();
                                if (!value.isDirectory) value.size = meta.size;
                                that.list.splice(index + 2, 1, value);
                            }, that.onError);
                        });
                    }, that.onError);
            }
        },
        components: {
            "list-item": ListItem
        }
    });
}