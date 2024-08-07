import { createSignal, Show } from 'solid-js'
import Coder from './Coder.jsx'

export function QuarkUrl() {
  const [url, setUrl] = createSignal('')

  function getQuery() {
    try {
      const { searchParams } = new URL(url())
      const getStr = (str: string) => encodeURIComponent(searchParams.get(str) || '')
      return {
        kps: getStr('kps'),
        sign: getStr('sign'),
        vcode: getStr('vcode'),
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      <label class='form-control w-full max-w-xs'>
        <div class='label'>
          <span class='label-text'>输入你复制的 URL</span>
        </div>
        <input
          type='text'
          placeholder='https://drive-m.quark.cn/1/clouddrive/capacity/growth/info?xxxxx'
          class='input input-bordered input-primary w-full max-w-xs'
          onBlur={(e) => setUrl(() => e.currentTarget.value)}
        />
      </label>
      <Show when={getQuery()}>
        <Coder code={JSON.stringify(getQuery(), null, 2)}></Coder>
      </Show>
      <Show when={!getQuery() && url()}>
        <p class='text-sm text-red-400'>请输入 正确的 URL</p>
      </Show>
    </>
  )
}
