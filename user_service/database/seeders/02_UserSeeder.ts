import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'
import { UserStatus } from 'App/Constants/Status'

export default class UserSeeder extends BaseSeeder {
  public async run() {
    const usersData = [
      {
        name: 'Alice Johnson',
        email: 'alice.johnson@example.com',
        phoneNumber: '+15550100001',
        password: 'Password123!',
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
        status: UserStatus.ENABLED,
      },
      {
        name: 'Bob Smith',
        email: 'bob.smith@example.com',
        phoneNumber: '+15550100002',
        password: 'Password123!',
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
        status: UserStatus.ENABLED,
      },
      {
        name: 'Charlie Brown',
        email: 'charlie.brown@example.com',
        phoneNumber: '+15550100003',
        password: 'Password123!',
        profileImage: null,
        status: UserStatus.ENABLED,
      },
      {
        name: 'Diana Prince',
        email: 'diana.prince@example.com',
        phoneNumber: '+15550100004',
        password: 'Password123!',
        profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
        status: UserStatus.ENABLED,
      },
      {
        name: 'Evan Wright',
        email: 'evan.wright@example.com',
        phoneNumber: '+15550100005',
        password: 'Password123!',
        profileImage: null,
        status: UserStatus.ENABLED,
      },
      {
        name: 'Fiona Gallagher',
        email: 'fiona.gallagher@example.com',
        phoneNumber: '+15550100006',
        password: 'Password123!',
        profileImage: null,
        status: UserStatus.ENABLED,
      },
      {
        name: 'George Clark',
        email: 'george.clark@example.com',
        phoneNumber: '+15550100007',
        password: 'Password123!',
        profileImage: null,
        status: UserStatus.ENABLED,
      },
      {
        name: 'Hannah Abbott',
        email: 'hannah.abbott@example.com',
        phoneNumber: '+15550100008',
        password: 'Password123!',
        profileImage: null,
        status: UserStatus.ENABLED,
      },
      {
        name: 'Ian Malcolm',
        email: 'ian.malcolm@example.com',
        phoneNumber: '+15550100009',
        password: 'Password123!',
        profileImage: null,
        status: UserStatus.ENABLED,
      },
      {
        name: 'Julia Roberts',
        email: 'julia.roberts@example.com',
        phoneNumber: '+15550100010',
        password: 'Password123!',
        profileImage: null,
        status: UserStatus.ENABLED,
      },
      {
        name: 'Kevin Bacon',
        email: 'kevin.bacon@example.com',
        phoneNumber: '+15550100011',
        password: 'Password123!',
        profileImage: null,
        status: UserStatus.ENABLED,
      },
      {
        name: 'Laura Croft',
        email: 'laura.croft@example.com',
        phoneNumber: '+15550100012',
        password: 'Password123!',
        profileImage: null,
        status: UserStatus.ENABLED,
      },
      {
        name: 'Michael Scott',
        email: 'michael.scott@example.com',
        phoneNumber: '+15550100013',
        password: 'Password123!',
        profileImage: null,
        status: UserStatus.ENABLED,
      },
      {
        name: 'Nina Williams',
        email: 'nina.williams@example.com',
        phoneNumber: '+15550100014',
        password: 'Password123!',
        profileImage: null,
        status: UserStatus.ENABLED,
      },
      {
        name: 'Oscar Martinez',
        email: 'oscar.martinez@example.com',
        phoneNumber: '+15550100015',
        password: 'Password123!',
        profileImage: null,
        status: UserStatus.ENABLED,
      },
      {
        name: 'Pamela Beesly',
        email: 'pamela.beesly@example.com',
        phoneNumber: '+15550100016',
        password: 'Password123!',
        profileImage: null,
        status: UserStatus.ENABLED,
      },
      {
        name: 'Quentin Tarantino',
        email: 'quentin.tarantino@example.com',
        phoneNumber: '+15550100017',
        password: 'Password123!',
        profileImage: null,
        status: UserStatus.ENABLED,
      },
      {
        name: 'Rachel Green',
        email: 'rachel.green@example.com',
        phoneNumber: '+15550100018',
        password: 'Password123!',
        profileImage: null,
        status: UserStatus.ENABLED,
      },
      {
        name: 'Steve Rogers',
        email: 'steve.rogers@example.com',
        phoneNumber: '+15550100019',
        password: 'Password123!',
        profileImage: null,
        status: UserStatus.ENABLED,
      },
      {
        name: 'Tony Stark',
        email: 'tony.stark@example.com',
        phoneNumber: '+15550100020',
        password: 'Password123!',
        profileImage: null,
        status: UserStatus.ENABLED,
      },
    ]

    for (const userData of usersData) {
      await User.firstOrCreate({ email: userData.email }, userData)
    }
  }
}
