import { JSDOM } from 'jsdom'

import type { Endpoints } from '@tqman/valoffi-api-client'
import { OffiApiClient } from '@tqman/valoffi-api-client'
import { type TWeapon, isEmptyArray } from '@valorant-bot/shared'
import type { StorageType } from '@valorant-bot/server-database'

const languages = {
  'en-US': 'en-US',
  'zh-TW': 'zh-TW',
  'zh-CN': 'zh-CN',
  'ja-JP': 'ja-JP',
}

async function getWeaponPrices(
  weapons: {
    uuid: string
    weapon_type: string
    weapon_skins: TWeapon[]
  }[],
) {
  const records = new Map<
    string,
    {
      uuid: string
      cost: number
      category: string
      collection: string
    }[]
  >()

  await Promise.all(
    weapons.map(
      async ({ weapon_type: weaponType, weapon_skins: weaponSkins, uuid }) => {
        const res = await fetch(
          `https://valorant.fandom.com/wiki/${weaponType}`,
        )
        const html = await res.text()

        const dom = new JSDOM(html)
        const document = dom.window.document

        const table = document.querySelector(
          'table.sortable',
        )!

        table.querySelectorAll('tr').forEach((row) => {
          const cells = Array.from(row.querySelectorAll('td'))
          if (isEmptyArray(cells))
            return

          const content = cells.map(cell => cell?.textContent?.trim() ?? '')
          let collection: string, cost: number

          if (
            content?.[0].includes(
              'For each weapon with upgrade levels and/or variants',
            )
          )
            return

          const parseToNumber = (price: string) => {
            if (!price)
              return 0

            return Number.parseInt(price.replaceAll(',', ''))
          }

          if (weaponType.toLowerCase() === 'melee') {
            if (/^(?:\d+,?)+$/.test(content[2])) {
              collection = content[1]
              cost = parseToNumber(content[2])
            }
            else {
              collection = content[2]
              cost = parseToNumber(content[3])
            }
          }
          else {
            collection = content[2]
            cost = parseToNumber(content[4])
            if (cost === 0 || Number.isNaN(cost) || !cost)
              cost = parseToNumber(content[3])
          }

          const wepaonSkinUUID = weaponSkins.find((skin) => {
            const skinName = skin.displayName.toLowerCase()

            const matches = skinName.includes(collection.toLowerCase())

            const regex = /Level\s?1:\s?([\s\w]+)Level/
            if (!matches && regex.test(collection)) {
              const extractSkinName = regex.exec(collection)
              return skinName.includes(
                extractSkinName?.[1]?.trim()?.toLowerCase() ?? '',
              )
            }

            return matches
          })?.uuid ?? ''

          records.has(uuid) || records.set(uuid, [])
          records.get(uuid)!.push({
            collection,
            uuid: wepaonSkinUUID,
            category: weaponType,
            cost: Number.isNaN(cost) ? 0 : cost,
          })
        })
      },
    ),
  )

  return Object.fromEntries(records)
}

export default defineEventHandler(async () => {
  const prisma = usePrisma()
  const api = new OffiApiClient({ parseResponseData: true })

  await prisma.$transaction(
    async (client) => {
      await client.storage.deleteMany({})

      async function fetchDataAndStore(type: Endpoints, dataType: StorageType, language: string) {
        const { data } = await api.fetch(type, { language })
        return { language, type: dataType, content: data }
      }

      const dataTypes = {
        weapons: 'WEAPON',
        buddies: 'BUDDIE',
        playercards: 'PLAYER_CARD',
        playertitles: 'PLAYER_TITLE',
      } as Record<Endpoints, StorageType>

      const toStorages = await Promise.all(
        Object.keys(languages).flatMap(language =>
          Object.entries(dataTypes).map(([type, dataType]) => fetchDataAndStore(type as Endpoints, dataType, language)),
        ),
      )
      await client.storage.createMany({ data: toStorages })

      const { data: version } = await api.fetch('version')
      await client.storage.create({
        data: {
          type: 'VERSION',
          content: version,
        },
      })

      const { data: contenttiers } = await api.fetch('contenttiers')
      await client.storage.create({ data: { type: 'CONTENT_TIER', content: contenttiers } })

      const weapons: {
        uuid: string
        weapon_type: string
        weapon_skins: TWeapon[]
      }[] = await client.$queryRaw`
        SELECT
            uuid,
            weapon_type,
            jsonb_agg(first_level) AS weapon_skins
        FROM (
            SELECT
                content_item ->> 'uuid' AS uuid,
                content_item ->> 'displayName' AS weapon_type,
                (jsonb_array_elements(content_item -> 'skins') -> 'levels') -> 0 AS first_level
            FROM
                "Storage",
                jsonb_array_elements(content) AS content_item
            WHERE
                type = 'WEAPON'
                AND language = 'en-US'
        ) AS subquery
        GROUP BY uuid, weapon_type;
      `

      const weaponPrices = await getWeaponPrices(weapons)
      await client.storage.create({
        data: { content: weaponPrices, type: 'WEAPON_PRICE' },
      })
    },
    { timeout: 2 * 60 * 1000 },
  )

  return useResponse()('ok')
})
