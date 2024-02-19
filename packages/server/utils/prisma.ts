import { PrismaClient } from '@valorant-bot/server-database'

let _prisma: PrismaClient
export function useDBClient() {
  if (!_prisma)
    _prisma = new PrismaClient()

  return _prisma
}
