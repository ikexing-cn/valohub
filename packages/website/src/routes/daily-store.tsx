import BackgroundImage from '~/assets/images/daily-store/background.jpg'

import { ItemWeapon } from '~/components/daily-store/ItemWeapon'

export default function DailyStore() {
  const items = [
    {
      cost: 3550,
      costType: 'VP',
      uuid: '3710f62c-4e0c-65fd-848d-8da25d2fb833',
    },
    {
      cost: 2475,
      costType: 'VP',
      uuid: 'b3d3ff38-4202-20d8-2f41-c783477e5636',
    },
    {
      cost: 1775,
      costType: 'VP',
      uuid: '81658642-4f78-cbb4-9e40-b8856a904bc7',
    },
    {
      cost: 1275,
      costType: 'VP',
      uuid: '436f42cc-49c5-b535-4fdf-c0bd48695919',
    },
  ]

  return (
    <div
      p="x y"
      relative
      w-700px
      of-hidden
      text-gray-4
      bg="center contain #0d1611"
    >
      <img absolute top--22 left-0 op-25 src={BackgroundImage} />
      <span>每日商店: ikx#0103</span>

      <div my grid="~ cols-2 rows-2 gap-4">
        <ItemWeapon
          priceTier="exclusive"
          uuid={items[0].uuid}
          price={items[0].cost}
        />
        <ItemWeapon
          priceTier="ultra"
          uuid={items[1].uuid}
          price={items[1].cost}
        />
        <ItemWeapon
          priceTier="premium"
          uuid={items[2].uuid}
          price={items[2].cost}
        />
        <ItemWeapon
          priceTier="select"
          uuid={items[3].uuid}
          price={items[3].cost}
        />
      </div>
    </div>
  )
}
