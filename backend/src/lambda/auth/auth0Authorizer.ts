import { CustomAuthorizerEvent, CustomAuthorizerHandler, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')
const cert = `-----BEGIN CERTIFICATE-----
MIIDBzCCAe+gAwIBAgIJG1I8s8TIicg4MA0GCSqGSIb3DQEBCwUAMCExHzAdBgNV
BAMTFm5nb21pbmh0dTIzNy5hdXRoMC5jb20wHhcNMTcwMzE2MTczMTA5WhcNMzAx
MTIzMTczMTA5WjAhMR8wHQYDVQQDExZuZ29taW5odHUyMzcuYXV0aDAuY29tMIIB
IjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyQykfHbTTO0pHd5GA37OjOWQ
aMA/3X5AvfYzTIcU5m5QcYx0D5ly4pfRcuvxx1pQDWqi6kdXtiGtm66SNTUSDP4r
F7Cd77vpb3+PxNiUrWKP4lFADO1qwp3y3IlvSnn5yOcad0lq+WKgC+uzNr77xOzf
E9VOtcgIdSu3EOb52mEi6NaYdbnVy0Pkn9Dxo0ksNu9tci9C4+RaHF8pu+TJlGKp
4z7gcC/fTMhfgSk+RP0i2R2bzUIO3jhTWv+26/lrNpm4bZYLjx684AvWLZEpVuNK
ffqJrOJBX5UoUWHyPg318gTr0pf+z4ktcZuyunuNm7LogIwGCsk/G/EcOAsrKwID
AQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBRrW2wzmfp7+CI/9Dhq
2qNE3uHDZjAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBAINULrIj
GY+M00iGE5/jXDvSJmT9SAqk2iwovT1vneIDzHBiBcz4D2lrqCUmx2AnjhIz4d5X
DAmwyRaDZjmIkr3spOQW1V7691i+YmPwilrLqNrjyCnhUCBL4al1o7wguhlrPre2
6C94hOy9SZNndqtftW9FkGnFKuVKo7ZlciowDN0TmM9/zi10JaoalQIa0FwYeOjQ
ZrzW4wnhpeNWBpR8PkkI/Zu09CPkV5o/UkgC2cCrsrfCBQspc9kI9pMZWP9Cy90o
zM3SGZkqbYb9uKLi4NBYUyO5SdafXd+wUYouFhaWWYslVMj8aGoMIE0IoED+OkY/
L7CzUeVRifoKDP4=
-----END CERTIFICATE-----`

export const handler: CustomAuthorizerHandler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

function verifyToken(authHeader: string): JwtPayload {
  const token = getToken(authHeader)
  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
