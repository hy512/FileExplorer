

(function (window, document) {
    "use strict";
    var page = window._page = {};
    constructor(page);

    // 操作的 DOM 节点
    var domNodes = {
        rootDiv: document.body.querySelectorAll(".mui-content")[0],
        path: document.createElement("div"),
        list: document.createElement("ul")
    };



    // 节点设置
    // 设置路径提示
    var pathWrapper = document.createElement("div");
    pathWrapper.setAttribute("class", "mui-scroll-wrapper");
    // domNodes.rootDiv.appendChild(pathWrapper);
    domNodes.path.setAttribute("class", "mui-scroll");
    domNodes.path.innerText = " ";
    pathWrapper.appendChild(domNodes.path);
    // 初始化
    mui(pathWrapper).scroll({
        deceleration: 0.0005,
        scrollY: false,
        scrollX: true,
        indicators: false,
        bounce: false
    });

    // 设置列表组件
    domNodes.list.setAttribute("class", "mui-table-view");
    domNodes.rootDiv.appendChild(domNodes.list);
    // 添加到上一级的项目
    var listItem = createListItem();

    domNodes.list.appendChild(listItem);



    function constructor(obj) {
        // 属性定义
        // 当前路径
        var path = "";
        var error = false;
        var list = [
            { name: ".", size: "", modify: "", icon: "fa-folder-o" },
            { name: "..", size: "", modify: "", icon: "fa-folder-o" }
        ];
        Object.defineProperties(obj, {
            path: {
                enumerable: true,
                configurable: false,
                set: function (p) {
                    path = p;
                    domNodes.path.innerText = path;
                    domNodes.list.children;
                },
                get: function () {
                    return path;
                }
            },
            // 文件项目
            list: {
                configurable: false,
                enumerable: true,
                set: function (l) {
                    list = l;
                },
                get: function () {
                    return list;
                }
            },
            error: {
                enumerable: true,
                configurable: false,
                set: function (e) {
                    if (e === true) {
                        // 程序异常了
                        error = e;
                    } else {
                        error = false;
                    }
                },
                get: function () {
                    return error;
                }
            }
        });
        // 方法定义
        page.intoDirectory = function (entry) {
            if (!entry.isDirectory) return;
            page.path = entry.toLocalURL();
            var that = this;
            // 获取当前目录信息
            entry.getMetadata(function (meta) {
                var list = that.list;
                list[0] = { modify: meta.modificationTime.toISOString(), icon: "fa-folder-o", size: "", name: "." };
                that.list = list;
            }, function (e) {

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
    }
})(window, document);


function ListItem({ name, modify, size, icon }) {
    (function () {
        Object.defineProperties(this, {
            name: {
                configurable: false,
                writable: true,
                enumerable: true,
                set: function (n) {

                }
            },
            modify: {
                configurable: false,
                writable: true,
                enumerable: true,
            },
            size: {
                configurable: false,
                writable: true,
                enumerable: true,
            },
            icon: {
                configurable: false,
                writable: true,
                enumerable: true,
            },
            refs: {
                configurable: false,
                writable: false,
                enumerable: true,
                value: {
                    root: null,
                    icon: null,
                }
            }
        });
    }).apply(this);

    var node = document.createElement("li");
    root.setAttribute("class", "mui-table-view-cell mui-media");
    this.refs.root = node;
    node = document.createElement("a");
    node.setAttribute("href", "javascript:;");
    this.refs.root.appendChild(node);
    var leftContainer = document.createElement("div");
    leftContainer.setAttribute("mui-media-object mui-pull-left");
    var iconNode = document.createElement("span");
    this.refs.icon = iconNode;
    iconNode.setAttribute("class", 'fa ' + this.icon + ' fa-lg"></span>');
    node.appendChild(leftContainer);

    // 私有方法定义
    function createListItem() {
        var listItem = document.createElement("li");
        listItem.setAttribute("class", "mui-table-view-cell mui-media");
        listItem.innerHTML = '<a href="javascript:;">' +
            '<div class="mui-media-object mui-pull-left">' +
            '<span class="fa ' + icon + ' fa-lg"></span>' +
            '</div>' +
            '<div class="mui-media-object mui-pull-right">' +
            '<span class="fa fa-circle"></span>' +
            '</div>' +
            '<div class="mui-media-body">' +
            name +
            '<div class="mui-row">' +
            '<div class="mui-col-xs-4" style="padding-left: 10px;">' + modify + '</div>' +
            '<div class="mui-col-xs-4" style="padding-left: 10px;">' + size + '</div>' +
            '</div>' +
            // "<p class='mui-ellipsis'></p>" +
            "</div>" +
            "</a>";
        return listItem;
    }
}