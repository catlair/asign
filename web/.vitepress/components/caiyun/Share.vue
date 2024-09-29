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

    const data = reactive([] as Record<string, any>[]);
    const isRuning = ref(false);

    // function clickBtn() {
    //   isRuning.value = true;
    //   const evtSource = new EventSource(
    //     "http://localhost:3000/task/shake?auth=cGM6MTk5NDI1NDY0MDQ6REFGQmViVk98MXxSQ1N8MTcyNjEwNjk0NDE3NXxINDM3MEFmS0VxLndnVWhCNE1EdW82eENCNGtucE51ODlvb0o3Yl8yajVPR0dLMG05aFNCVUl2bGRYa2RmR3M4blV3ZC5kWXlkMHlBRHRkZ3htSUI1eHhOUTJHZGFERVFhazF1Y0JzXzNRS1Z4RTAzd1ZfVHdXc2ZVR2RhTndaTGpfRkQyNlpNZmM1amcxRE5rLlRGMFNESGdaQ3Q2UjExQXMzdlVxSTRHelkt" +
    //       `&config=${btoa(JSON.stringify(formValue.value))}`
    //   );

    //   evtSource.onmessage = (event) => {
    //     console.log("eventSource message", event);
    //     try {
    //       data.push(JSON.parse(event.data));
    //     } catch (error) {
    //       console.log("eventSource data error", error);
    //     }
    //   };

    //   evtSource.addEventListener("end", () => {
    //     console.log("eventSource end");
    //     close();
    //   });

    //   evtSource.onerror = (err) => {
    //     console.log("onerror", err);
    //     close();
    //   };

    //   function close() {
    //     evtSource.close();
    //     isRuning.value = false;
    //   }
    // }

    async function clickBtn() {
      const response = await fetch("http://127.0.0.1:3000/task/redpack", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          auth: "bW9iaWxlOjE5MTQyNDkyNzE2OkoxcEI0NWNSfDF8UkNTfDE3Mjg1NzE4Mzg1NTZ8TExmUU5DYUgxOGp6cVVkemVYdGZ0RVZnV1R5THF2N0NRcDBrNUMucWV5d2NXdGEycmlKOVZVOEtKalpIaEpkRlZFdWVaSlBFalJKeGJqWkI4bWRZZ1RqRjBqV3R0ZWFBZEV4SFVyekZmWHVmTGlVbkoyVHVPdk5PSWJHd2xZMnpIV1V0ejJ6VTVLYUY2Y1dBdGdiUklERkpNdENVaElLZndjM1h4dFg0NzdBLQ==",
          config: formValue.value,
        }),
      });

      const reader = response.body
        ?.pipeThrough(new TextDecoderStream())
        .getReader();
      if (!reader) return;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        console.log("value", value);
        // 分割换行符，再获取 data
        const lines = value.split("\n\n");
        lines.forEach((line) => {
          if (!line.startsWith("data:")) return;
          try {
            data.push(JSON.parse(line.split("data:")[1]));
          } catch (error) {
            console.log("error", error);
          }
        });
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
