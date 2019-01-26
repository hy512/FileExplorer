// 依赖

function initEditor() {
    var template = `
    <div id="editorRoot">
        <div style="display:flex; flex-direction: row; justify-content: flex-end;position: fixed;
            right: 0; top: 0;
            z-index: 9999;">
            <button @touchstart.prevent="onPreview" @click="onPreview">{{preview? "返回":"预览"}}</button>
        </div>
        <iframe id="editorPreview" ref="preview" v-show="preview"></iframe>
        <div v-show="!preview">
            <text-area @xinput="input" :text="text" />
        <!-- <textarea ref="editor"></textarea> -->
        </div>
    </div>
    `;
    var style = `
    #editorRoot {
        overflow: hidden;
    }
    #editorRoot, #editorPreview {
      height: 100vh;
      width: 100vw;
    }
    #editorPreview {
        overflow: hidden;
        box-sizing: border-box;
        clear: both;
    }
    `;
    window.document.head.innerHTML += '<style type="text/css">' + style + "</style>";

    return {
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
                    console.log()
                    mui.alert(JSON.stringify(event.detail), "title", "确定", ()=>{});
                    if (!event.detail)  return;
                    this.text = event.detail.text;
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
                if (preview)  {
                    let body = this.$refs.preview.contentDocument.body;
                    body.innerHTML = convert.makeHtml(this.text);
                    body.setAttribute("style", "overflow-wrap: break-word;")
                }
                this.preview = preview;
            }
        },
    
        components:{
            "text-area": initTextArea()
        }
    }
};