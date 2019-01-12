

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
                    self.intoDirectory(fs.root);
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
                console.log(event.path);
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
                console.log(entry.fullPath)
                console.log(entry.getMetadata)
                // 获取当前目录信息
                entry.getMetadata(function (meta) {
                    console.log(entry.modificationTime.toISOString())

                    that.list.splice(0, 1, {
                        modify: meta.modificationTime.toISOString(),
                        icon: "fa-folder-o",
                        size: "",
                        name: ".",
                        path: entry.fullPath,
                        isDirectory: true
                    });
                }, that.error, false);
                // 获取父目录信息
                entry.getParent(function (entry) {
                    that.list.splice(1, 1, {
                        icon: "fa-folder-o",
                        size: "",
                        name: "..",
                        path: entry.fullPath,
                        isDirectory: true
                    });
                    // entry.getMetadata(function (meta) {
                    //     var dir = that.list[1];
                    //     dir.modify = meta.modificationTime.toISOString();
                    //     that.list.splice(1, 1, dir);
                    // }, that.error);
                }, that.error);
                // 读取目录项目
                entry.createReader()
                    .readEntries(function (children) {
                        // 读取所有文件条目
                        that.list = that.list.slice(0, 2)
                            .concat(children.map(function (v, i) {
                                return {
                                    name: v.name,
                                    path: v.fullPath,
                                    isDirectory: v.isDirectory
                                };
                            }));
                        // 读取所有条目详情信息
                        /*
                        children.forEach(function (v, i) {
                            v.getMetadata(function (meta) {
                                var index = v + 2;
                                that.list.splice(index, 1, {
                                    modify: meta.modificationTime.toISOString(),
                                    icon: "fa-folder-o",
                                    size: "",
                                    name: that.list[index].name,
                                    path: that.list[index].name,
                                    isDirectory: that.list[index].isDirectory
                                });
                            }, that.error);
                        });
                        */
                    }, that.error);
            }
        },
        components: {
            "list-item": ListItem
        }
    });
}