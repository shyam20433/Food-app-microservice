import { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class AppProvider {
  constructor(protected app: ApplicationContract) {}

  public register() {
    // Register custom bindings
  }

  public async boot() {
    // IoC container ready
  }

  public async ready() {
    // App ready
  }

  public async shutdown() {
    // Cleanup
  }
}
