<template>
  <p class="">
    <span class="text-gray-600">[{{ time }}]</span>
    <span :class="`text-${color}-500 mx-2`">[{{ logType }}]</span>
    <span :class="`text-${color}-300`">{{ msg }}</span>
  </p>
</template>

<script setup lang="ts">
const props = defineProps<{
  msg: string;
  type: string;
  time: string;
}>();

const types = {
  info: "INF",
  warn: "WRN",
  error: "ERR",
  debug: "DBG",
  start: "STR",
  success: "SUC",
};

const colorMap = {
  ERR: "red",
  WRN: "yellow",
  INF: "blue",
  DBG: "gray",
  STR: "purple",
  SUC: "green",
};

const logType = types[props.type];
const color = colorMap[logType];
const time = new Date(props.time).toLocaleTimeString("zh-CN");
</script>

<style scoped>
.text-red-500 {
  color: #ef4444;
}
.text-yellow-500 {
  color: #f59e0b;
}
.text-blue-500 {
  color: #3b82f6;
}
.text-gray-500 {
  color: #6b7280;
}
.text-purple-500 {
  color: #a855f7;
}
.text-green-500 {
  color: #22c55e;
}
.text-red-300 {
  color: #fecaca;
}
.text-yellow-300 {
  color: #fde68a;
}
.text-blue-300 {
  color: #93c5fd;
}
.text-gray-300 {
  color: #d1d5db;
}
.text-purple-300 {
  color: #d8b4fe;
}
.text-green-300 {
  color: #86efac;
}
</style>
