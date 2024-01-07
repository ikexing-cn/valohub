import {
  type PriceTier,
  getPriceTierColor,
  getPriceTierIcon,
} from '~/utils/price-tier'

import VP from '~/assets/images/icons/vp.webp'
import Logo from '~/assets/images/icons/V_Logomark_Off-White.png'

type ItemWeaponProps = {
  uuid: string
  price: number
  priceTier: PriceTier
}

export function ItemWeapon(props: ItemWeaponProps) {
  const icon = createMemo(() => getPriceTierIcon(props.priceTier))
  const colors = createMemo(() => getPriceTierColor(props.priceTier))

  const [weaponInfo, setWeaponInfo] = createSignal<any>({})

  fetch(
    `https://valorant-api.com/v1/weapons/skinlevels/${props.uuid}?language=zh-TW`,
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
        text="white 3"
        flex="~ items-center justify-center"
      >
        <img src={VP} w-3 />
        <span mr-1>&nbsp;{props.price}</span>
        <img src={icon()} w-3 />
      </div>

      <div text="2.5 white" absolute top-2 right-2>
        <span>
          {(weaponInfo()?.data?.displayName as string)
            ?.split(' ')
            ?.reverse()
            ?.join(' | ')}
        </span>
      </div>

      <div mt relative>
        <img src={weaponInfo()?.data?.displayIcon} h-15 />
      </div>
    </div>
  )
}
