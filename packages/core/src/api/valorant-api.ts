export type ValorantApiLanguage = 'en-US' | 'zh-CN' | 'zh-TW'

const baseUrl = 'https://valorant-api.com/v1'
export function createValorantApi(_language?: ValorantApiLanguage) {
  const language = _language || 'zh-TW'

  function getWeaponLevelFromUUID(uuid: string) {
    return `${baseUrl}/weapons/skinlevels/${uuid}?language=${language}`
  }

  return {
    getWeaponLevelFromUUID,
  } as const
}
