
var Events = {};
Object.defineProperties(Events, {
    new: {
        enumerable: true,
        configurable: false,
        writable: false,
        value: "new"
    },
    open: {
        enumerable: true,
        configurable: false,
        writable: false,
        value: "open" // { uri: string, as?: "text" } | { content: string, as?: "text" | "markdown" } uri - 资源的 uri; as - 打开为, 如果缺失显示选项; content - 直接作为内容的字符串
    },
    renewal: {
        enumerable: true,
        configurable: false,
        writable: false,
        value: "renewal", // { uri: string, content: string } // 更新的目标和内容
    },
    fileOptions: {
        enumerable: true,
        configurable: false,
        writable: false,
        value: "openOptions" // { uri: string } 打开类型选项
    },
    paste: {
        enumerable: true,
        configurable: false,
        writable: false,
        value: "paste" // { type: "cut" | "copy", files: Array<string> }  包含操作类型和操作文件的路径数组
    },
    refresh: {
        enumerable: true,
        configurable: false,
        writable: false,
        value: "refresh" // null
    },
    pathchange: {
        enumerable: true,
        configurable: false,
        writable: false,
        value: "pathchange"
    },
    pathup: {
        enumerable: true,
        configurable: false,
        writable: false,
        value: "pathup"
    },
    updatepick: {
        enumerable: true,
        configurable: false,
        writable: false,
        value: "updatepick" // { picks: Array<string> }  包含选中文件路径的数组
    }
});
