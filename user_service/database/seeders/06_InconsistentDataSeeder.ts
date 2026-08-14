import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'
import Address from 'App/Models/Address'
import RefreshToken from 'App/Models/RefreshToken'
import UserRole from 'App/Models/UserRole'
import { UserStatus, AddressStatus, RefreshTokenStatus } from 'App/Constants/Status'
import { Roles } from 'App/Constants/Roles'
import { Hash } from 'App/Security/Hash'
import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'

export default class InconsistentDataSeeder extends BaseSeeder {
  public async run() {
    const disabledUser = await User.firstOrCreate(
      { email: 'inconsistent.disabled@example.com' },
      {
        name: 'Disabled User Test',
        email: 'inconsistent.disabled@example.com',
        phoneNumber: '+15559990001',
        password: 'Password123!',
        status: UserStatus.DISABLED,
      }
    )

    const deletedUser = await User.firstOrCreate(
      { email: 'inconsistent.deleted@example.com' },
      {
        name: 'Deleted User Test',
        email: 'inconsistent.deleted@example.com',
        phoneNumber: '+15559990002',
        password: 'Password123!',
        status: UserStatus.DELETED,
      }
    )

    const specialCharsUser = await User.firstOrCreate(
      { email: 'inconsistent.special@example.com' },
      {
        name: "John \"Danger\" O'Connor <script>alert('xss')</script> 😊",
        email: 'inconsistent.special@example.com',
        phoneNumber: '+15559990003',
        password: 'Password123!',
        profileImage: null,
        status: UserStatus.ENABLED,
      }
    )

    const maxEmailDomain =
      '@inconsistent-max-boundary-length-domain-testing-purposes-for-adonis.com'
    const prefixLength = 255 - maxEmailDomain.length
    const maxEmail = 'u'.repeat(prefixLength) + maxEmailDomain
    await User.firstOrCreate(
      { email: maxEmail },
      {
        name: 'Max Length Boundary User',
        email: maxEmail,
        phoneNumber: '+12345678901234',
        password: 'Password123!',
        status: UserStatus.ENABLED,
      }
    )

    await User.firstOrCreate(
      { email: 'inconsistent.norole@example.com' },
      {
        name: 'User With No Roles',
        email: 'inconsistent.norole@example.com',
        phoneNumber: '+15559990005',
        password: 'Password123!',
        status: UserStatus.ENABLED,
      }
    )

    const multiRoleUser = await User.firstOrCreate(
      { email: 'inconsistent.multirole@example.com' },
      {
        name: 'User With Conflicting Roles',
        email: 'inconsistent.multirole@example.com',
        phoneNumber: '+15559990006',
        password: 'Password123!',
        status: UserStatus.ENABLED,
      }
    )

    const rolesToAssign = [
      Roles.CUSTOMER,
      Roles.ADMIN,
      Roles.RESTAURANT_OWNER,
      Roles.DELIVERY_PARTNER,
    ]
    for (const rName of rolesToAssign) {
      await UserRole.firstOrCreate(
        { userId: multiRoleUser.id, roleName: rName },
        { userId: multiRoleUser.id, roleName: rName }
      )
    }

    await UserRole.firstOrCreate(
      { userId: deletedUser.id, roleName: Roles.CUSTOMER },
      { userId: deletedUser.id, roleName: Roles.CUSTOMER }
    )

    await UserRole.firstOrCreate(
      { userId: disabledUser.id, roleName: Roles.MANAGER },
      { userId: disabledUser.id, roleName: Roles.MANAGER }
    )

    await Address.firstOrCreate(
      { userId: specialCharsUser.id, houseNo: 'DELETED_999' },
      {
        userId: specialCharsUser.id,
        label: 'OLD_HOME',
        houseNo: 'DELETED_999',
        street: 'Former Street 123',
        area: 'Ghost Area',
        city: 'Old City',
        state: 'XX',
        pincode: '00000',
        isDefault: false,
        status: AddressStatus.DELETED,
      }
    )

    await Address.firstOrCreate(
      { userId: deletedUser.id, houseNo: 'DEL_USER_ADDR' },
      {
        userId: deletedUser.id,
        label: 'HOME',
        houseNo: 'DEL_USER_ADDR',
        street: 'Orphaned St',
        area: 'Abandoned Area',
        city: 'Metropolis',
        state: 'NY',
        pincode: '10001',
        isDefault: true,
        status: AddressStatus.ENABLED,
      }
    )

    await Address.firstOrCreate(
      { userId: specialCharsUser.id, label: 'NULL_FIELDS_TEST' },
      {
        userId: specialCharsUser.id,
        label: 'NULL_FIELDS_TEST',
        houseNo: null,
        street: null,
        area: null,
        city: null,
        state: null,
        pincode: null,
        isDefault: false,
        status: AddressStatus.ENABLED,
      }
    )

    await Address.firstOrCreate(
      { userId: specialCharsUser.id, houseNo: 'DEF_ADDR_1' },
      {
        userId: specialCharsUser.id,
        label: 'DEF1',
        houseNo: 'DEF_ADDR_1',
        street: 'First Default St',
        area: 'Area 1',
        city: 'City A',
        state: 'CA',
        pincode: '90001',
        isDefault: true,
        status: AddressStatus.ENABLED,
      }
    )

    await Address.firstOrCreate(
      { userId: specialCharsUser.id, houseNo: 'DEF_ADDR_2' },
      {
        userId: specialCharsUser.id,
        label: 'DEF2',
        houseNo: 'DEF_ADDR_2',
        street: 'Second Default St',
        area: 'Area 2',
        city: 'City B',
        state: 'CA',
        pincode: '90002',
        isDefault: true,
        status: AddressStatus.ENABLED,
      }
    )

    const expRaw = 'inconsistent_expired_token_sample_12345'
    await RefreshToken.firstOrCreate(
      { tokenHash: Hash.hashToken(expRaw) },
      {
        userId: specialCharsUser.id,
        tokenHash: Hash.hashToken(expRaw),
        expiresAt: DateTime.now().minus({ days: 30 }),
        status: RefreshTokenStatus.EXPIRED,
      }
    )

    const revRaw = 'inconsistent_revoked_token_sample_67890'
    await RefreshToken.firstOrCreate(
      { tokenHash: Hash.hashToken(revRaw) },
      {
        userId: specialCharsUser.id,
        tokenHash: Hash.hashToken(revRaw),
        expiresAt: DateTime.now().plus({ days: 7 }),
        status: RefreshTokenStatus.REVOKED,
      }
    )

    const delRaw = `deleted_user_token_${uuidv4()}`
    await RefreshToken.firstOrCreate(
      { tokenHash: Hash.hashToken(delRaw) },
      {
        userId: deletedUser.id,
        tokenHash: Hash.hashToken(delRaw),
        expiresAt: DateTime.now().plus({ days: 7 }),
        status: RefreshTokenStatus.ACTIVE,
      }
    )

    const disRaw = `disabled_user_token_${uuidv4()}`
    await RefreshToken.firstOrCreate(
      { tokenHash: Hash.hashToken(disRaw) },
      {
        userId: disabledUser.id,
        tokenHash: Hash.hashToken(disRaw),
        expiresAt: DateTime.now().plus({ days: 7 }),
        status: RefreshTokenStatus.ACTIVE,
      }
    )
  }
}
