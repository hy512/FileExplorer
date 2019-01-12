

function initVue() {
    return new Vue({
        el: "body > .mui-content",
        data: function () {
            return {
                path: "",
                list: [
                    { name: ".", size: "", modify: "", icon: "fa-folder-o", path: ".", isDirectory: true },
                    { name: "..", size: "", modify: "", icon: "fa-folder-o", path: "..", isDirectory: true }
                ]
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
                            // 从新来过
                            plus.io.resolveLocalFileSystemURL("file://" + file.getAbsolutePath(), function (entry) {
                                self.intoDirectory(entry);
                            }, this.error);
                        });
                    });
                }, this.error);
            } else {
                // 使用初始化参数提供的路径
                plus.io.resolveLocalFileSystemURL("file://" + path, function (entry) {
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

                console.log(event.checked + ", " + event.path);
            },
            error: function (e) {
                console.log([e.name, e.message, e.stack].join("\n"));
            },
            // 进入一个目录
            intoDirectory: function (entry) {
                if (!entry.isDirectory) return;
                this.path = entry.fullPath;
                var that = this;
                console.log("into: " + entry.fullPath)

                // 设置当前目录信息
                var currentDir = this.list[0];
                currentDir.isDirectory = entry.isDirectory;
                currentDir.path = entry.fullPath;
                this.list.splice(0, 1, currentDir);
                entry.getMetadata(function (meta) {
                    var dir = that.list[0];
                    dir.modify = meta.modificationTime.toISOString();
                    that.list.splice(0, 1, dir);
                }, that.error, false);

                // 获取父目录信息
                entry.getParent(function (entry) {
                    var dir = that.list[1];
                    dir.path = entry.fullPath;
                    dir.isDirectory = entry.isDirectory;
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
                        that.list = that.list.slice(0, 2)
                            .concat(children.map(function (v, i) {
                                return {
                                    name: v.name,
                                    path: v.fullPath,
                                    isDirectory: v.isDirectory
                                };
                            }));
                        // console.log(JSON.stringify(that.list));
                        // 读取所有条目详情信息
                        children.forEach(function (v, i) {
                            v.getMetadata(function (meta) {
                                // console.log(JSON.stringify(that.list));
                                var index = i + 2;
                                var dir = that.list[index];
                                // console.log(JSON.stringify(dir))
                                dir.modify = meta.modificationTime.toISOString();
                                that.list.splice(index, 1, dir);
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