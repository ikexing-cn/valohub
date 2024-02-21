import { useTranslation } from '@intlify/h3'
import type { H3Event } from 'h3'

import type { JwtPayload } from 'jsonwebtoken'
import jwt from 'jsonwebtoken'

const { sign, verify } = jwt

export function createToken(event: H3Event, email: string) {
  const { jwtSecret } = useRuntimeConfig(event)
  return sign({ email }, jwtSecret, { expiresIn: '7d' })
}

function verifyToken(event: H3Event, token: string) {
  const { jwtSecret } = useRuntimeConfig(event)
  return verify(token, jwtSecret)
}

export async function validateAndExtractTokenFromHeader(event: H3Event) {
  const t = await useTranslation(event)
  const response = createTypeSafeResponse(event)
  const token = getHeaders(event).authorization?.split(' ').pop()
  try {
    const result = verifyToken(event, token ?? '') as JwtPayload

    if (!result || (result.exp && result.exp < (Date.now() / 1000)))
      return response.message(401, t('global.invalidToken'))

    return result.email
  }
  catch (error) {
    return response.message(401, t('global.invalidToken'))
  }
}
