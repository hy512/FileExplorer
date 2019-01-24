<template>
  <div
    class="textAreaRoot"
    @resize="layoutResize"
  >
    <div
      ref="line"
      class="textAreaLine"
    ></div>
    <textarea
      @input.prevent="textInput"
      ref="text"
      class="textAreaText"
      autocomplete="on"
      wrap="hard"
      :value="text"
    >
    </textarea>
  </div>
</template>

<script>
export default {
  name: "TextArea",
  props: ["text"],
  mounted() {
    this.resizeTextAreaHeight();
    this.insertLineNumber();
  },
  data() {
    return {
      lineNumber: 0
    };
  },
  methods: {
    resizeTextAreaHeight() {
      // 设置高度
      let text = this.$refs.text;
      text.setAttribute("style", "height: " + text.scrollHeight + "px");
    },
    layoutResize() {
this.resizeTextAreaHeight();
      this.insertLineNumber();
    },
    textInput(event) {
      this.layoutResize()
      this.$emit("xinput", event.target.value);
    },
    insertLineNumber() {
      let text = this.$refs.text,
        line = this.$refs.line;
      while (line.offsetHeight + 16 <= text.offsetHeight) {
        line.innerHTML += ++this.lineNumber + "<br />";
      }
      // 减少行数，由于无法确定减少内容后 textarea 的内容高度，无法完成
      //   while (line.offsetHeight - 16 >= text.offsetHeight) {
      //     line.innerHTML = line.innerHTML.replace(/\d+\<br ?\/\>$/, "");
      //   }
    }
  }
}
</script>

<style scoped>
.textAreaRoot {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  justify-content: stretch;
  align-items: flex-start;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  overflow-x: hidden;
}
.textAreaRoot > * {
  /* display: flex; */
  line-height: 16px;
  box-sizing: border-box;

  flex-shrink: 0;
}
.textAreaLine {
  user-select: none;
  max-width: 36px;
  padding: 0 5px;
  color: deeppink;
  text-align: right;
  font-size: 12px;
  border-right: 1px solid aquamarine;
}
.textAreaText {
  flex: 1;
  border: none;
  margin: 0;
  justify-self: stretch;
  padding: 0 5px;
  resize: none;
}
</style>
