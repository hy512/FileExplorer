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
            preview: false,
        }
    },
    
    mounted() {
        // 获取 mui 传递过来的数据
        mui && mui.plusReady(() => {
            window.addEventListener(Events.open, event => {
                if (!event.detail)return;
                this.content = event.detail.content;
            });
        });
        
    },
    
    methods: {
        input(text) {
           this.text = text;
        //    console.log(JSON.stringify(text))
        },
        onPreview() {
            let preview = !this.preview;
            if (preview) this.$refs.preview.contentDocument.body.innerHTML = convert.makeHtml(this.text);
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
