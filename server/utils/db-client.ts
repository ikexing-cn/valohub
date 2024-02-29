import { PrismaClient } from '@prisma/client'

let _prisma: PrismaClient
export function useDbClient() {
  if (!_prisma)
    _prisma = new PrismaClient() 

  return _prisma
}
