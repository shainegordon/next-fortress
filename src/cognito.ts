import { AsyncMiddleware, Fallback } from './types'
import { NextRequest } from 'next/server'
import { handleFallback } from './handle-fallback'
import { decodeProtectedHeader, importJWK, JWK, jwtVerify } from 'jose'

export const makeCognitoInspector = (
  fallback: Fallback,
  cognitoRegion: string,
  cognitoUserPoolId: string
): AsyncMiddleware => {
  return async (request, event) => {
    const ok = await verifyCognitoAuthenticatedUser(
      request,
      cognitoRegion,
      cognitoUserPoolId
    )
    if (ok) return
    return handleFallback(fallback, request, event)
  }
}

const verifyCognitoAuthenticatedUser = async (
  req: NextRequest,
  region: string,
  poolId: string
): Promise<boolean> => {
  const token = Object.entries(req.cookies).find(([key]) =>
    /CognitoIdentityServiceProvider\..+\.idToken/.test(key)
  )?.[1]
  if (!token) return false

  const { keys }: { keys: JWK[] } = await fetch(
    `https://cognito-idp.${region}.amazonaws.com/${poolId}/.well-known/jwks.json`
  ).then((res) => res.json())

  const { kid } = decodeProtectedHeader(token)
  const jwk = keys.find((key) => key.kid === kid)
  if (!jwk) return false

  return jwtVerify(token, await importJWK(jwk))
    .then(() => true)
    .catch(() => false)
}
