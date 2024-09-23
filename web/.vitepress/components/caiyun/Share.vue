<template>
  <n-form ref="formRef" inline :label-width="80" :model="formValue">
    <n-form-item label="摇一摇次数" path="config.num">
      <n-input-number
        v-model:value="formValue.num"
        placeholder="输入摇一摇次数"
        :min="1"
        :max="60"
      />
    </n-form-item>
    <n-form-item label="间隔时间" path="config.delay">
      <n-input-number
        v-model:value="formValue.delay"
        placeholder="输入每次间隔时间（秒）"
        :min="1"
        :max="60"
      />
    </n-form-item>
    <n-form-item>
      <n-button attr-type="button" @click="clickBtn"> 摇一摇 </n-button>
    </n-form-item>
    <n-form-item>
      <n-button attr-type="button" @click="clickBtn"> 保存 </n-button>
    </n-form-item>
  </n-form>

  <TermianlLog :data="data" :isRuning="isRuning" />
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from "vue";

import type { FormInst } from "naive-ui";
import { useMessage } from "naive-ui";

export default defineComponent({
  setup() {
    const formRef = ref<FormInst | null>(null);
    const message = useMessage();
    const formValue = ref({
      num: 15,
      delay: 2,
    });

    const data = reactive([]);
    const isRuning = ref(false);

    function clickBtn() {
      isRuning.value = true;
      const evtSource = new EventSource(
        "http://localhost:3000/task/shake?auth=cGM6MTk5NDI1NDY0MDQ6REFGQmViVk98MXxSQ1N8MTcyNjEwNjk0NDE3NXxINDM3MEFmS0VxLndnVWhCNE1EdW82eENCNGtucE51ODlvb0o3Yl8yajVPR0dLMG05aFNCVUl2bGRYa2RmR3M4blV3ZC5kWXlkMHlBRHRkZ3htSUI1eHhOUTJHZGFERVFhazF1Y0JzXzNRS1Z4RTAzd1ZfVHdXc2ZVR2RhTndaTGpfRkQyNlpNZmM1amcxRE5rLlRGMFNESGdaQ3Q2UjExQXMzdlVxSTRHelkt" +
          `&config=${btoa(JSON.stringify(formValue.value))}`
      );

      evtSource.onmessage = (event) => {
        console.log("eventSource message", event);
        try {
          data.push(JSON.parse(event.data));
        } catch (error) {
          console.log("eventSource data error", error);
        }
      };

      evtSource.addEventListener("end", () => {
        console.log("eventSource end");
        close();
      });

      evtSource.onerror = (err) => {
        console.log("onerror", err);
        close();
      };

      function close() {
        evtSource.close();
        isRuning.value = false;
      }
    }

    return {
      formRef,
      clickBtn,
      formValue,
      data,
      isRuning,
    };
  },
});
</script>
