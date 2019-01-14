var ListItem = {
    props: ["icon", "name", "size", "modify", "path", "isDirectory", "pickMode"],
    data: function () {
        return {
            checked: false
        };
    },
    mounted: function () {
        var self = this;

        var itemMg = new Hammer(this.$refs.a, {});
        var multiSelectMg = new Hammer(this.$refs.multiSelect, {});

        var clickItem = new Hammer.Tap();
        var clickSelect = new Hammer.Tap();
        clickItem.requireFailure(clickSelect);

        itemMg.add(clickItem);
        multiSelectMg.add(clickSelect);
        // 添加长按和点击事件
        itemMg.on("press", function () {
        });
        itemMg.on("tap", function () {
            if (self.pickMode) {
                var checked = !self.checked;
                self.checked = checked;
                self.$emit("xselect", { checked: checked, path: self.path });
                return;
            }
            self.$emit("tap", { path: self.path });
        });
        multiSelectMg.on("tap", function () {
            var checked = !self.checked;
            self.checked = checked;
            self.$emit("xselect", { checked: checked, path: self.path });
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