(function (window, document) {
    "use strict";
    var page = window._page = {};
    
    // 操作的 DOM 节点
    var domNodes = {
        rootDiv: document.body.querySelectorAll(".mui-content")[0],
        path: document.createElement("div"),
        list: document.createElement("ul")
    };
    domNodes.path.setAttribute("class", "title");
    domNodes.path.innerText = " ";
    // domNodes.rootDiv.appendChild(domNodes.path);
    domNodes.list.setAttribute("class", "mui-table-view");
    domNodes.rootDiv.appendChild(domNodes.list);

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
            console.log(children.map(function(i) {
                return i.name
            }).join(", "));
            // children.sort(function(l, r) {

            // });
        }, function (e) {

        });
    }
})(window, document);
