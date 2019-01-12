
var MFile = (function () {
    "use strict";

    // 对 plus.io 文件操作的一点便利包装
    function File(parent, child) {
        switch (arguments.length) {
            case 1:
                // 保留的路径不带最后一级路径分隔符
                if (/\/$/.test(parent)) parent = parent.substring(0, parent.length - 1);
                this._fullPath = parent;
                break;
        }
    }


    // 判断文件是否存在
    // callback: (error: Error, exists: boolean) => void;
    File.prototype.exists = function (callback) {
        plus.io.resolveLocalFileSystemURL("file://" + this._fullPath, function (entry) {
            callback(null, true);
        }, function (e) {
            callback(null, false);
        });
    };

    // 创建目录
    // callback: (error: Error, success: boolean)
    File.prototype.mkdir = function (callback) {
        var self = this;
        this.exists(function (error, exists) {
            // 错误处理
            if (error) {
                if (!(error instanceof Error)) error = new Error(error);
                callback(error);
                return;
            }
            // 如果存在
            if (exists) {
                callback(new Error(self.RESOURCE_EXIStS));
                return;
            }
            // 判断父级路径是否存在, 并创建目录
            var last = self._fullPath.lastIndexOf("/");
            plus.io.resolveLocalFileSystemURL("file://" + self._fullPath.substring(0, last),
                function (entry) {
                    // 父级路径不为目录
                    if (!entry.isDirectory) {
                        callback(null, false);
                        return;
                    }
                    // 创建目录
                    var last = self._fullPath.lastIndexOf("/");
                    entry.getDirectory(self._fullPath.substring(last + 1, self._fullPath.length),
                        { create: true, exclusive: true },
                        function (entry) {
                            callback(null, true);
                        }, function (error) {
                            // 出现错误, 创建失败
                            callback(error, false);
                        });
                },
                function (error) {
                    // 错误处理
                    if (error) {
                        if (!(error instanceof Error)) error = new Error(error);
                        callback(error);
                        return;
                    }
                });
        });
    }

    // 创建目录，包括不存在的上级目录
    // callback: (error: Error, success: boolean)
    File.prototype.mkdirs = function (callback) {
        var self = this;
        this.exists(function (error, exists) {
            // 错误处理
            if (error) {
                callback(error);
                return;
            }
            // 如果存在
            if (exists) {
                callback(new Error(self.RESOURCE_EXIStS));
                return;
            }
            // 调用上级的创建
            self.getParentFile().mkdirs(function (error) {
                // 发生了其它的错误
                if (!(error instanceof Error) ||
                    error.message !== self.RESOURCE_EXIStS) {
                    if (!(error instanceof Error)) error = new Error(error);
                    callback(error);
                    return;
                }
                // 上级目录存在
                else if (error.message === self.RESOURCE_EXIStS) {
                    // 创建目录
                    self.mkdir(function (error, success) {
                        callback(error, success);
                    });
                }
                // 其它错误
                else {
                    callback(new Error("未知错误 !"));
                }
            });

        });
    };
    
    // 得到对象的绝对路径
    // returns: string
    File.prototype.getAbsolutePath = function () {
        return this._fullPath;
    };

    // 得到父文件目录
    // returns: File
    File.prototype.getParentFile = function () {
        var last = this._fullPath.lastIndexOf("/");
        return new File(this._fullPath.substring(0, last));
    };

    File.prototype.RESOURCE_EXIStS = "资源已存在 !";

    return File;
})();