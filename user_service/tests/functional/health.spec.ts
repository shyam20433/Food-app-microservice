import { ApiResponse } from 'App/Response/ApiResponse'
import { Hash } from 'App/Security/Hash'

export function runFunctionalUnitTests() {
  const rawToken = 'test_refresh_token_12345'
  const hash = Hash.hashToken(rawToken)
  if (hash.length !== 64) {
    throw new Error('Hash length should be 64 characters hex')
  }
  if (!Hash.compareToken(rawToken, hash)) {
    throw new Error('Token hash comparison failed')
  }

  const mockCtx: any = {
    response: {
      status: (code: number) => ({
        send: (body: any) => ({ code, body }),
      }),
    },
  }
  const res = ApiResponse.success(mockCtx, { id: 1 }, 'Success message') as any
  if (!res.body.success || res.body.message !== 'Success message') {
    throw new Error('Response formatting failed')
  }

  return true
}
