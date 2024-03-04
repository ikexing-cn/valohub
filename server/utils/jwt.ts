import jwt from 'jsonwebtoken'
import type { JwtPayload } from 'jsonwebtoken'

const { sign, verify } = jwt

export function createToken(email: string) {
  const { jwtSecret } = useRuntimeConfig(useEvent())
  return sign({ email }, jwtSecret, { expiresIn: '7d' })
}

function verifyToken(token: string) {
  const { jwtSecret } = useRuntimeConfig(useEvent())
  return verify(token, jwtSecret)
}

export async function validateAndExtractTokenFromHeader() {
  const token = getHeaders(useEvent()).authorization?.split(' ').pop() ?? ''
  try {
    const result = verifyToken(token) as JwtPayload

    if (!result || (result.exp && result.exp < (Date.now() / 1000))) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid token, please relogin',
      })
    }

    return result.email
  }
  catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid token, please relogin',
    })
  }
}
