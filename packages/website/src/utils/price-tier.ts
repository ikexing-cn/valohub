export type PriceTier = 'select' | 'deluxe' | 'premium' | 'ultra' | 'exclusive'

const priceTierIcons = Object.fromEntries(
  Object.entries(
    import.meta.glob('~/assets/images/price-tiers/*-edition-icon.webp', {
      as: 'url',
      eager: true,
    }),
  ).map(([key, value]) => [
    key.match(/(\w+)-edition-icon/g)![0].replace('-edition-icon', ''),
    value,
  ]),
) as Record<PriceTier, string>

export function getPriceTierIcon(priceTier: PriceTier): string {
  return priceTierIcons[priceTier]
}

export function getPriceTierColor(priceTier: PriceTier): [string, string] {
  switch (priceTier) {
    case 'select':
      return ['#02a418', '#0a83b7']
    case 'deluxe':
      return ['#009c82', '#007f6c']
    case 'premium':
      return ['#d4568b', '#a24772']
    case 'exclusive':
      return ['#f79763', '#bd7753']
    case 'ultra':
      return ['#fbd872', '#c0a75c']
  }
}
