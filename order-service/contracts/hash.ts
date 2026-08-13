declare module '@ioc:Adonis/Core/Hash' {
  interface HashersList {
    argon2: HashDriverContract
    bcrypt: HashDriverContract
  }
}
