export default function DailyStore() {
  const priceTierIcons = Object.fromEntries(
    Object.entries(
      import.meta.glob('~/assets/images/price-tiers/*-edition-icon.webp', {
        eager: true,
        as: 'url',
      }),
    ).map(([key, value]) => [
      key.match(/(\w+)-edition-icon/g)![0].replace('-edition-icon', ''),
      value,
    ]),
  ) as Record<'select' | 'deluxe' | 'premium' | 'ultra' | 'exclusive', string>

  return (
    <div p="x y">
      <span>ikx#0103</span>
      <img src={priceTierIcons.deluxe} width="16" />
    </div>
  )
}
