import toast from 'solid-toast'

import { baseUrl } from '~/utils/request'
import { ItemWeapon } from '~/components/daily-store/ItemWeapon'

import BackgroundImage from '~/assets/images/background/daily-store.jpg'

import { cn } from '~/lib/utils'
import type { InGameStoreFrontResponse } from '@valorant-bot/shared'

async function fetchData(
  qq: string,
  alias: string,
): Promise<InGameStoreFrontResponse> {
  const response = await fetch(`${baseUrl}/in-game/store-front`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ qq: atob(qq), alias }),
  })

  return response.json()
}

export default function DailyStore() {
  const [disabled, setDisabled] = createSignal(false)

  const [searchParams] = useSearchParams()
  const [response] = createResource(searchParams, ({ qq, alias }) =>
    fetchData(qq!, alias || 'default'),
  )

  createEffect(() => {
    if (response()?.success === false) {
      toast.error(response()?.message || '未知的错误，请联系开发者', {
        position: 'top-left',
      })
    }
  })

  onMount(() => {
    try {
      const qq = searchParams?.qq
      if (!qq || !Number.isInteger(Number(atob(qq)))) {
        throw new Error('无效的 qq')
      }
    } catch {
      setDisabled(true)
      toast.error('出现错误, 请重新尝试', { position: 'top-left' })
    }
  })

  return (
    <div
      p="x y"
      w-700px
      relative
      of-hidden
      text-white
      bg="center contain #0d1611"
      class={cn([disabled() && 'op-50 pointer-events-none'])}
    >
      <img absolute top--22 op-25 left-0 src={BackgroundImage} />

      <div relative>
        <span>每日商店: </span>
        <span text="2.8">
          {response()?.data?.gameName}#{response()?.data?.tagLine}
        </span>
      </div>

      <div my grid="~ cols-2 rows-2 gap-4">
        <For each={response()?.data?.dailyStoreItems ?? []}>
          {(item) => <ItemWeapon {...item} />}
        </For>
      </div>

      <div w-full relative text="3 gray" flex="~ row-reverse">
        <span font-italic>ValorantBot 生成</span>
      </div>
    </div>
  )
}
