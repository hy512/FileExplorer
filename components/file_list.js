(function (window, document) {
    "use strict";
    var page = window._page = {};

    // 操作的 DOM 节点
    var domNodes = {
        rootDiv: document.body.querySelectorAll(".mui-content")[0],
        path: document.createElement("div"),
        list: document.createElement("ul")
    };


    // 属性定义
    // 当前路径
    var path = "";
    var error = false;
    Object.defineProperties(page, {
        path: {
            enumerable: true,
            configurable: false,
            set: function (p) {
                path = p;
                domNodes.path.innerText = path;
            },
            get: function () {
                return path;
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

    // 私有方法定义
    function createListItem() {
        var listItem = document.createElement("li");
        listItem.setAttribute("class", "mui-table-view-cell mui-media");
        listItem.innerHTML = '<a href="javascript:;">' +
            '<div class="mui-media-object mui-pull-left">' +
            '<span class="fa fa-file fa-lg"></span>' +
            '</div>' +
            '<div class="mui-media-object mui-pull-right">' +
            '<span class="fa fa-circle"></span>' +
            '</div>' +
            '<div class="mui-media-body">' +
            'File' +
            '<div class="mui-row">' +
            '<div class="mui-col-xs-4" style="padding-left: 10px;">2018-01-01</div>' +
            '<div class="mui-col-xs-4" style="padding-left: 10px;">12M</div>' +
            '</div>' +
            // "<p class='mui-ellipsis'></p>" +
            "</div>" +
            "</a>";
        return listItem;
    }

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

})(window, document);
