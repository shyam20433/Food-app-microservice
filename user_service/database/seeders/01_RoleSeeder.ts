import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Role from 'App/Models/Role'

export default class RoleSeeder extends BaseSeeder {
  public async run() {
    await Role.fetchOrCreateMany('name', [
      { name: 'CUSTOMER', description: 'Customer user role for placing orders' },
      { name: 'RESTAURANT_OWNER', description: 'Restaurant owner role for managing operations' },
      { name: 'DELIVERY_PARTNER', description: 'Delivery partner role for delivering orders' },
      { name: 'ADMIN', description: 'Administrator role with full system access' },
      { name: 'SUPER_ADMIN', description: 'Super administrator role with global privileges' },
      { name: 'MANAGER', description: 'Branch or store manager role' },
      { name: 'SUPPORT_AGENT', description: 'Customer support representative role' },
      { name: 'AUDITOR', description: 'Financial and system auditor role' },
      { name: 'VENDOR', description: 'Third-party vendor role' },
      { name: 'COURIER', description: 'Independent logistics and courier partner' },
      { name: 'DISPATCHER', description: 'Fleet and delivery dispatcher' },
      { name: 'DATA_ANALYST', description: 'Business intelligence and analytics role' },
      { name: 'COMPLIANCE_OFFICER', description: 'Regulatory and compliance officer' },
      { name: 'CONTENT_MODERATOR', description: 'Reviews and content moderator' },
      { name: 'MARKETING_SPECIALIST', description: 'Promotions and marketing coordinator' },
      { name: 'INVENTORY_MANAGER', description: 'Warehouse and inventory manager' },
      { name: 'FINANCE_OFFICER', description: 'Billing and accounting officer' },
      { name: 'API_SERVICE', description: 'Machine-to-machine API service account' },
      { name: 'SHIFT_SUPERVISOR', description: 'Operations shift supervisor' },
      { name: 'REGIONAL_MANAGER', description: 'Regional operations manager' },
    ])
  }
}
