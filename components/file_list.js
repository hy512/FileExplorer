

function initVue() {
    return new Vue({
        el: "body > .mui-content",
        data: function () {
            return {
                path: "",
                list: [
                    { name: ".", size: "", modify: "", icon: "fa-folder-o", path: "" },
                    { name: "..", size: "", modify: "", icon: "fa-folder-o", path: "" }
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
                }, function (exception) {

                });
            } else {
                // 使用初始化参数提供的路径
                plus.io.resolveLocalFileSystemURL("file://" + path, function (entry) {
                    self.intoDirectory(entry);
                }, function (exception) {

                });
            }

            // 点击左上角返回按钮到上级目录
            window.addEventListener(Events.pathup, this.goOut);
        },
        methods: {
            // 退出目录
            goOut: function (event) {
                console.log(event);
            },
            // 选中元素
            select: function () {

            },
            // 进入一个目录
            intoDirectory: function (entry) {
                if (!entry.isDirectory) return;
                this.path = entry.fullPath;
                var that = this;
                // 获取当前目录信息
                entry.getMetadata(function (meta) {
                    // var list = that.list;
                    // list[0] = { modify: meta.modificationTime.toISOString(), icon: "fa-folder-o", size: "", name: "." };
                    // that.list = list;
                    that.list.splice(0, 1, {
                        modify: meta.modificationTime.toISOString(),
                        icon: "fa-folder-o",
                        size: "",
                        name: ".",
                        path: entry.fullPath
                    });
                }, function (e) {

                });
                // 获取父目录信息
                entry.getParent(function() {

                }, function() {

                });
                // 读取所有文件条目
                entry.createReader().readEntries(function (children) {
                    // console.log(Object.prototype.toString.apply(children));
                    console.log(children.map(function (i) {
                        return i.name
                    }).join(", "));
                    // children.sort(function(l, r) {

                    // });
                }, function (e) {

                });
            }
        },
        components: {
            "list-item": ListItem
        }
    });
}