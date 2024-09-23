<template>
  <div class="terminal p-5 rounded-lg font-mono">
    <div
      class="terminal-header bg-zinc-700 text-white p-2 rounded-t-lg flex items-center"
    >
      <div>
        <span class="text-red-500 text-5xl leading-[0px] align-[-.8rem] -mt-2"
          >&bull;</span
        >
        <span
          class="text-yellow-500 text-5xl leading-[0px] align-[-.8rem] -mt-2 ml-1"
          >&bull;</span
        >
        <span
          class="text-green-500 text-5xl leading-[0px] align-[-.8rem] -mt-2 ml-1"
          >&bull;</span
        >
      </div>
      <span class="ml-8 align-baseline">terminal --- logger -  </span>
      <span
        :class="`ml-8 align-baseline text-${
          props.isRuning ? 'green' : 'blue'
        }-500`"
        >{{ props.isRuning ? "正在运行中!!!" : "运行结束..." }}</span
      >
    </div>
    <div id="output" class="pl-4 pt-2 bg-gray-900 max-h-[500px] overflow-auto">
      <p class="text-gray-500">该终端无法操作,仅用于输出日志!</p>
      <OutputItem
        v-for="item in props.data"
        :msg="item.args[0]"
        :type="item.type"
        :time="item.date"
      ></OutputItem>
    </div>
  </div>
</template>

<script setup lang="ts">
import OutputItem from "../TerminalLog/OutputItem.vue";
import { clickBtn } from "./TerminalLog.ts";

const props = defineProps<{
  data: Array<{
    args: string[];
    type: string;
    level: number;
    date: string;
  }>;
  isRuning: boolean;
}>();
</script>

<style lang="css"></style>
