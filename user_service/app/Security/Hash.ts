import crypto from 'crypto'

export class Hash {
  public static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex')
  }

  public static compareToken(token: string, hashedToken: string): boolean {
    const hash = this.hashToken(token)
    return hash === hashedToken
  }
}
