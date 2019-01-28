<template>
    <div id="root">
        <div style="display:flex; flex-direction: row; justify-content: flex-end;position: fixed;
            right: 0; top: 0;
            z-index: 9999;">
            <button @touchstart.prevent="onPreview" @click="onPreview">{{preview? "返回":"预览"}}</button>
        </div>
        <iframe id="preview" ref="preview" v-show="preview">

        </iframe>
        <div v-show="!preview">
            <text-area @xinput="input" :text="text" />
        <!-- <textarea ref="editor"></textarea> -->
        </div>
    </div>
</template>

<script>

import showdown from 'showdown'
import TextArea from './TextArea'
import mui from 'mui'

const convert = new showdown.Converter({
    ghCodeBlocks: true,
    openLinksInNewWindow: true,
    parseImgDimensions: true,
    prefixHeaderId: true,
    requireSpaceBeforeHeadingText:true,
    simplifiedAutoLink: true,
    strikethrough: true,
    table: true,
    tasklists: true
});
convert.setFlavor("github");

export default {
    name: "Editor",
    
    data: function () {
        return {
            text:"",
            uri: "",
            preview: false,
            plusReady: false,
        }
    },
    
    mounted() {
        // 获取 mui 传递过来的数据
        window.addEventListener(Events.open, event => {
            if (!event.detail)  return;
            this.text = event.detail.content;
            this.uri = event.detail.uri;
        });
        // 标识 plus 对象可用
        mui && mui.plusReady(()=> {
            this.plusReady = true;
        });
    },
    
    methods: {
        // 修改了内容
        input(text) {
            this.text = text;
            // 传递最新文件内容消息
            if (this.plusReady)
                mui.fire(plus.webview.getWebviewById("editor"), 
                    Events.renewal, 
                    { uri: this.uri, content: this.text });
        },
        onPreview() {
            let preview = !this.preview;
            if (preview)  {
                let body = this.$refs.preview.contentDocument.body;
                body.innerHTML = convert.makeHtml(this.text);
                body.setAttribute("style", "overflow-wrap: break-word;")
            }
            this.preview = preview;
        }
    },

    components:{
        "text-area": TextArea
    }
}
</script>

<style scoped>
#root {
    overflow: hidden;
}
#root, #preview {
  height: 100vh;
  width: 100vw;
}
#preview {
    overflow: hidden;
    box-sizing: border-box;
    clear: both;
}
</style>
