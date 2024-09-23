<script lang="ts" setup>
import DefaultTheme from "vitepress/theme";
import { useData } from "vitepress";
import * as NaiveUI from "naive-ui";

import { setupToggle } from "./script/toggle";

setupToggle();

const { darkTheme, zhCN, dateZhCN } = NaiveUI;
const { NConfigProvider, NMessageProvider, NDialogProvider } = NaiveUI;
const { Layout } = DefaultTheme;
const { isDark } = useData();
</script>

<template>
  <n-config-provider
    :theme="isDark ? darkTheme : null"
    :locale="zhCN"
    :date-locale="dateZhCN"
  >
    <n-message-provider>
      <n-dialog-provider>
        <Layout />
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(
    120deg,
    #bd34fe,
    #41d1ff
  );
}
</style>
