var ListItem = {
    props: ["icon", "name", "size", "modify", "path"],
    data: function () {
        return {
            checked: false
        };
    },
    mounted: function () {
        var hammer = new hammer(this.$refs.a, {});
        var self = this;
        hammer.on("press", function () {
            var checked = !self.checked;
            self.checked = checked;
            self.$emit("press", { checked: checked, path: self.path });
        });
    },
    computed: {
        checkStyle: function() {
            if (this.checked) {
                return {color: "blue"};
            }
            return {};
        }
    },
    template: '<li class="mui-table-view-cell mui-media">' +
        '<a ref="a" href="javascript:;">' +
        '<div class="mui-media-object mui-pull-left">' +
        '<span :class="[\"fa\", icon, \"fa-lg\"]"></span>' +
        '</div>' +
        '<div class="mui-media-object mui-pull-right">' +
        '<span :style="checkStyle" class="fa fa-circle"></span>' +
        '</div>' +
        '<div class="mui-media-body">' +
        '{{name}}' +
        '<div class="mui-row">' +
        '<div class="mui-col-xs-4" style="padding-left: 10px;">{{modify}}</div>' +
        '<div class="mui-col-xs-4" style="padding-left: 10px;">{{size}}</div>' +
        '</div>' +
        // "<p class='mui-ellipsis'></p>" +
        "</div>" +
        "</a>" +
        "</li>"
};