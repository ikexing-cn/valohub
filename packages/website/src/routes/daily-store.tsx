import { baseUrl } from '~/utils/request'
import { ItemWeapon } from '~/components/daily-store/ItemWeapon'

import BackgroundImage from '~/assets/images/daily-store/background.jpg'

import type { InGameStoreFrontResponse } from '@valorant-bot/shared'

async function fetchData(qq: string): Promise<InGameStoreFrontResponse> {
  if (!Number.parseInt(qq))
    return {
      data: [] as any,
      message: 'Invalid qq',
      success: false,
    }

  const response = await fetch(`${baseUrl}/in-game/store-front`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ qq }),
  })

  return response.json()
}

export default function DailyStore() {
  const [searchParams] = useSearchParams()
  const [items] = createResource(searchParams.qq, fetchData)

  return (
    <div
      p="x y"
      w-700px
      relative
      of-hidden
      text-white
      bg="center contain #0d1611"
    >
      <img absolute top--22 op-25 left-0 src={BackgroundImage} />

      <div relative>
        <span>每日商店: </span>
        <span text="2.8">ikx#0103</span>
      </div>

      <div my grid="~ cols-2 rows-2 gap-4">
        <For each={items()?.data.items}>
          {(item) => {
            return <ItemWeapon uuid={item.uuid} price={item.cost} />
          }}
        </For>
      </div>

      <div w-full relative text="3 gray" flex="~ row-reverse">
        <span font-italic>ValorantBot 生成</span>
      </div>
    </div>
  )
}
