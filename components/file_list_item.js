var ListItem = {
    props: ["icon", "name", "size", "modify", "path", "isDirectory"],
    data: function () {
        return {
            checked: false
        };
    },
    mounted: function () {
        var hammer = new Hammer(this.$refs.a, {});
        var self = this;
        // 添加长按和点击事件
        hammer.on("press", function () {
        });
        hammer.on("tap", function () {
            self.$emit("tap", { path: self.path });
        });
        var multiSelect = new Hammer(this.$refs.multiSelect, {});
        multiSelect.on("tap", function(event) {
            var checked = !self.checked;
            self.checked = checked;
            self.$emit("xselect", { checked: checked, path: self.path });
            event.preventDefault();
        });
    },
    computed: {
        checkStyle: function () {
            if (this.checked) {
                return { color: "blue" };
            }
            return {};
        }
    },
    template: '<li class="mui-table-view-cell mui-media">' +
        '<a ref="a" href="javascript:;">' +
        '<div class="mui-media-object mui-pull-left">' +
        '<span :class="[\'fa\', icon, \'fa-lg\']"></span>' +
        '</div>' +
        '<div ref="multiSelect" class="mui-media-object mui-pull-right">' +
        '<span :style="checkStyle" class="fa fa-circle"></span>' +
        '</div>' +
        '<div class="mui-media-body">' +
        '{{name}}' +
        '<div class="mui-row">' +
        '<div class="mui-col-xs-8" style="padding-left: 10px;">{{modify}}</div>' +
        '<div class="mui-col-xs-4" style="padding-left: 10px;">{{size}}</div>' +
        '</div>' +
        // "<p class='mui-ellipsis'></p>" +
        "</div>" +
        "</a>" +
        "</li>"
};