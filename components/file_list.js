

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
                            self.error(error);
                            return;
                        }
                        if (exists) {
                            self.intoDirectory(entry);
                            return
                        }
                        // 创建目录
                        file.mkdirs(function (error, success) {
                            if (error) {
                                self.error(error);
                                return;
                            }
                            if (!success) {
                                mui.alert("目录不存在 !");
                                return;
                            }
                            // 从新来过
                            plus.io.resolveLocalFileSystemURL("file://" + file.getAbsolutePath(), function (entry) {
                                self.intoDirectory(entry);
                            }, this.error);
                        });
                    });
                }, this.error);
            } else {
                // 使用初始化参数提供的路径
                plus.io.resolveLocalFileSystemURL("file://" + self.path, function (entry) {
                    self.intoDirectory(entry);
                }, this.error);
            }

            // 点击左上角返回按钮到上级目录
            window.addEventListener(Events.pathup, this.goOut);
        },
        methods: {
            // 退出目录
            goOut: function (event) {
            },
            goIn: function (event) {
                var self = this;
                plus.io.resolveLocalFileSystemURL("file://" + event.path, function (entry) {
                    self.intoDirectory(entry);
                }, this.error);
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
            error: function (e) {
                console.log([e.name, e.message, e.stack].join("\n"));
                // console.log(arguments.callee.caller.name + arguments.callee.caller);
            },
            // 进入一个目录
            intoDirectory: function (entry) {
                console.log("into: " + entry.fullPath)
                if (!entry.isDirectory) return;
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
                }, that.error, false);

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
                    }, that.error);
                }, that.error);
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
                            }, that.error);
                        });
                    }, that.error);
            }
        },
        components: {
            "list-item": ListItem
        }
    });
}