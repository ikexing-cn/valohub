import {
  type PriceTier,
  getPriceTierColor,
  getPriceTierIcon,
} from '~/utils/price-tier'

import VP from '~/assets/images/icons/vp.webp'
import Logo from '~/assets/images/icons/white_icon.png'

type ItemWeaponProps = {
  uuid: string
  price: number
}

export function ItemWeapon({ price, uuid }: ItemWeaponProps) {
  const priceTier = createMemo<PriceTier>(() => {
    if (price === 875) {
      return 'select'
    } else if (price === 1275) {
      return 'deluxe'
    } else if (price === 1775) {
      return 'premium'
    } else if ([2475, 2975].includes(price)) {
      return 'ultra'
    } else {
      return 'exclusive'
    }
  })

  const icon = createMemo(() => getPriceTierIcon(priceTier()))
  const colors = createMemo(() => getPriceTierColor(priceTier()))

  const [weaponInfo, setWeaponInfo] = createSignal<any>({})

  fetch(
    `https://valorant-api.com/v1/weapons/skinlevels/${uuid}?language=zh-TW`,
  ).then(async (item) => {
    const info = await item.json()
    setWeaponInfo(info)
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
        <span mr-2>&nbsp;{price}</span>
      </div>

      <div text="3.5" absolute top-2 right-2 flex>
        <span>
          {(weaponInfo()?.data?.displayName as string)
            ?.split(' ')
            ?.reverse()
            ?.join(' | ')}
        </span>
        <img src={icon()} w-6 ml />
      </div>

      <div mt relative>
        <img src={weaponInfo()?.data?.displayIcon} h-15 />
      </div>
    </div>
  )
}
