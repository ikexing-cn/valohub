import pb, { ResizeType } from '@bitpatty/imgproxy-url-builder'

import type { ResponseStoreItem } from '@valorant-bot/shared'
import type { PriceTier } from '~/utils/price-tier'
import { getPriceTierColor, getPriceTierIcon } from '~/utils/price-tier'

import VP from '~/assets/images/icons/vp.webp'
import Logo from '~/assets/images/icons/white_icon.png'

export function ItemWeapon({ cost, weaponInfo }: ResponseStoreItem) {
  const priceTier = createMemo<PriceTier>(() => {
    if (cost === 875)
      return 'select'
    else if (cost === 1275)
      return 'deluxe'
    else if (cost === 1775)
      return 'premium'
    else if ([2475, 2975].includes(cost))
      return 'ultra'
    else
      return 'exclusive'
  })

  const icon = createMemo(() => getPriceTierIcon(priceTier()))
  const colors = createMemo(() => getPriceTierColor(priceTier()))

  const proxyDisplayIcon = createMemo(() => {
    return pb()
      .resize({
        type: ResizeType.FIT,
        width: 300,
        height: 60,
      })
      .build({
        plain: false,
        path: weaponInfo.displayIcon ?? '',
        baseUrl: import.meta.env.IMG_PROXY_URL,
      })
  })

  return (
    <div
      z-100
      w-full
      h-full
      relative
      p="x-3 y-6"
      flex="~ items-center justify-center"
      style={{
        'border-left': `1px solid ${colors()[0]}`,
        'background-image': `linear-gradient(to right, ${colors()[0]}99 0%,  ${
          colors()[1]
        }50 45%, #192228FF 100%)`,
      }}
    >
      <img src={Logo} absolute w-40 op-10 />

      <div
        left-2
        bottom-2
        absolute
        float-right
        text="4"
        flex="~ items-center justify-center"
      >
        <img src={VP} width="18" />
        <span mr-2>
&nbsp;
          {cost}
        </span>
      </div>

      <div text="3.5" absolute top-2 right-2 flex>
        <span>
          {weaponInfo.displayName?.split(' ')?.reverse()?.join(' | ')}
        </span>
        <img src={icon()} w-6 ml />
      </div>

      <div mt relative>
        <img src={proxyDisplayIcon()} h-15 />
      </div>
    </div>
  )
}
