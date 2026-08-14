import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'
import UserRole from 'App/Models/UserRole'

export default class UserRoleSeeder extends BaseSeeder {
  public async run() {
    const rolesMap: { [email: string]: string[] } = {
      'alice.johnson@example.com': ['CUSTOMER'],
      'bob.smith@example.com': ['RESTAURANT_OWNER'],
      'charlie.brown@example.com': ['DELIVERY_PARTNER'],
      'diana.prince@example.com': ['ADMIN'],
      'evan.wright@example.com': ['SUPER_ADMIN'],
      'fiona.gallagher@example.com': ['MANAGER'],
      'george.clark@example.com': ['SUPPORT_AGENT'],
      'hannah.abbott@example.com': ['AUDITOR'],
      'ian.malcolm@example.com': ['VENDOR'],
      'julia.roberts@example.com': ['COURIER'],
      'kevin.bacon@example.com': ['DISPATCHER'],
      'laura.croft@example.com': ['DATA_ANALYST'],
      'michael.scott@example.com': ['COMPLIANCE_OFFICER'],
      'nina.williams@example.com': ['CONTENT_MODERATOR'],
      'oscar.martinez@example.com': ['MARKETING_SPECIALIST'],
      'pamela.beesly@example.com': ['INVENTORY_MANAGER'],
      'quentin.tarantino@example.com': ['FINANCE_OFFICER'],
      'rachel.green@example.com': ['API_SERVICE'],
      'steve.rogers@example.com': ['SHIFT_SUPERVISOR'],
      'tony.stark@example.com': ['REGIONAL_MANAGER'],
    }

    const users = await User.all()

    for (const user of users) {
      const assignedRoles = rolesMap[user.email] || ['CUSTOMER']
      for (const roleName of assignedRoles) {
        await UserRole.firstOrCreate(
          { userId: user.id, roleName: roleName },
          { userId: user.id, roleName: roleName }
        )
      }
    }
  }
}
