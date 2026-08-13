import Cart from 'App/Models/Cart'

declare module '@ioc:Adonis/Addons/Auth' {
  interface ProvidersList {
    user: {
      implementation: LucidProviderContract<typeof Cart>
      config: LucidProviderConfig<typeof Cart>
    }
  }

  interface GuardsList {
    web: {
      implementation: OATGuardContract<'user', 'web'>
      config: OATGuardConfig<'user'>
    }
  }
}
