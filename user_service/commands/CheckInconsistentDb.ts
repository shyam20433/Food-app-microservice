import { BaseCommand } from '@adonisjs/core/build/standalone'
import { UserRepository } from 'App/Repositories/UserRepository'
import { AddressRepository } from 'App/Repositories/AddressRepository'
import { RefreshTokenRepository } from 'App/Repositories/RefreshTokenRepository'
import User from 'App/Models/User'
import Address from 'App/Models/Address'
import RefreshToken from 'App/Models/RefreshToken'
import { UserStatus, RefreshTokenStatus } from 'App/Constants/Status'
import { Roles } from 'App/Constants/Roles'
import { DateTime } from 'luxon'

export default class CheckInconsistentDb extends BaseCommand {
  public static commandName = 'check:inconsistent-db'
  public static description =
    'Query & verify inconsistent / edge-case database records against Repositories & Models'

  public static settings = {
    loadApp: true,
    stayAlive: false,
  }

  public async run() {
    this.logger.info('Running Inconsistent Database Records & Repository Verification Suite...\n')

    const userRepo = new UserRepository()
    const addressRepo = new AddressRepository()
    const refreshTokenRepo = new RefreshTokenRepository()

    let totalChecks = 0
    let passedChecks = 0
    let failedChecks = 0

    const verifyCheck = (checkTitle: string, isSuccess: boolean, detail: string) => {
      totalChecks++
      if (isSuccess) {
        this.logger.success(`✅ [PASS] ${checkTitle} -> ${detail}`)
        passedChecks++
      } else {
        this.logger.error(`❌ [FAIL] ${checkTitle} -> ${detail}`)
        failedChecks++
      }
    }

    // Check A: Soft-DELETED user exclusion in findByEmail
    const deletedUserByEmail = await userRepo.findByEmail('inconsistent.deleted@example.com')
    verifyCheck(
      'UserRepo.findByEmail() Soft-Delete Filter',
      deletedUserByEmail === null,
      deletedUserByEmail
        ? 'Failed: Soft-deleted user was returned'
        : 'Returned null as expected for DELETED user'
    )

    // Check B: Query DELETED user directly via Model
    const deletedUserRaw = await User.findBy('email', 'inconsistent.deleted@example.com')
    verifyCheck(
      'User Model Direct Query for Soft-Deleted User',
      deletedUserRaw !== null && deletedUserRaw.status === UserStatus.DELETED,
      deletedUserRaw ? `Found soft-deleted user ID: ${deletedUserRaw.id}` : 'User missing'
    )

    // Check C: Soft-DELETED user exclusion in findById
    if (deletedUserRaw) {
      const deletedUserById = await userRepo.findById(deletedUserRaw.id)
      verifyCheck(
        'UserRepo.findById() Soft-Delete Filter',
        deletedUserById === null,
        deletedUserById
          ? 'Failed: Soft-deleted user returned by findById'
          : 'Returned null as expected'
      )
    }

    // Check D: Query DISABLED user via UserRepository.findAll({ status: UserStatus.DISABLED })
    const disabledUsers = await userRepo.findAll({ status: UserStatus.DISABLED })
    const hasDisabledUser = disabledUsers.some(
      (u) => u.email === 'inconsistent.disabled@example.com'
    )
    verifyCheck(
      'UserRepo.findAll({ status: "DISABLED" }) Filter',
      hasDisabledUser,
      `Found ${disabledUsers.length} disabled user(s) in repository query`
    )

    // Check E: Special / Unicode / HTML Special Characters in User Name
    const specialUser = await User.findBy('email', 'inconsistent.special@example.com')
    const specialNameValid =
      specialUser !== null &&
      specialUser.name.includes('<script>') &&
      specialUser.name.includes('😊')
    verifyCheck(
      'Unicode & HTML Special Characters Integrity in User Name',
      specialNameValid,
      specialUser ? `Retrieved name: "${specialUser.name}"` : 'User not found'
    )

    // Check F: Max Boundary Length Email (255 chars) & Max Phone (15 chars)
    const maxDomain = '@inconsistent-max-boundary-length-domain-testing-purposes-for-adonis.com'
    const prefixLen = 255 - maxDomain.length
    const expectedMaxEmail = 'u'.repeat(prefixLen) + maxDomain
    const maxUser = await User.findBy('email', expectedMaxEmail)
    const maxUserValid =
      maxUser !== null && maxUser.email.length === 255 && maxUser.phoneNumber === '+12345678901234'
    verifyCheck(
      'Max Boundary Length Email (255 chars) & Phone Number (15 chars)',
      maxUserValid,
      maxUser
        ? `Found user with email length ${maxUser.email.length} and phone length ${maxUser.phoneNumber.length}`
        : 'User not found'
    )

    // Check G: User with Multiple Conflicting Roles
    const multiRoleUser = await User.query()
      .where('email', 'inconsistent.multirole@example.com')
      .preload('roles')
      .first()
    const roleNames = multiRoleUser ? multiRoleUser.roles.map((r) => r.name) : []
    const hasAllConflictingRoles = [
      Roles.CUSTOMER,
      Roles.ADMIN,
      Roles.RESTAURANT_OWNER,
      Roles.DELIVERY_PARTNER,
    ].every((r) => roleNames.includes(r))
    verifyCheck(
      'User with Multiple Conflicting Roles Preloading',
      hasAllConflictingRoles,
      `User assigned roles: [${roleNames.join(', ')}]`
    )

    // Check H: User with 0 Assigned Roles
    const noRoleUser = await User.query()
      .where('email', 'inconsistent.norole@example.com')
      .preload('roles')
      .first()
    const isZeroRoles = noRoleUser !== null && noRoleUser.roles.length === 0
    verifyCheck(
      'User with Zero Roles Preloading',
      isZeroRoles,
      noRoleUser ? `User has ${noRoleUser.roles.length} roles` : 'User not found'
    )

    // Check I: AddressRepo.findByUserId() Soft-Deleted Address Exclusion
    if (specialUser) {
      const activeAddresses = await addressRepo.findByUserId(specialUser.id)
      const hasDeletedAddr = activeAddresses.some((a) => a.houseNo === 'DELETED_999')
      verifyCheck(
        'AddressRepo.findByUserId() Soft-Deleted Address Exclusion',
        !hasDeletedAddr,
        `Retrieved ${activeAddresses.length} active address(es), soft-deleted address excluded`
      )
    }

    // Check J: Address with NULL Optional Fields
    const nullFieldsAddr = await Address.findBy('label', 'NULL_FIELDS_TEST')
    const isNullFieldsValid =
      nullFieldsAddr !== null && nullFieldsAddr.houseNo === null && nullFieldsAddr.street === null
    verifyCheck(
      'Address Record with NULL Optional Fields',
      isNullFieldsValid,
      nullFieldsAddr
        ? `Label: "${nullFieldsAddr.label}", houseNo: ${nullFieldsAddr.houseNo}, street: ${nullFieldsAddr.street}`
        : 'Address not found'
    )

    // Check K: Expired Hashed Refresh Token Retrieval
    const expiredToken = await refreshTokenRepo.findByRawToken(
      'inconsistent_expired_token_sample_12345'
    )
    const isExpiredValid =
      expiredToken !== null &&
      expiredToken.status === RefreshTokenStatus.EXPIRED &&
      expiredToken.expiresAt < DateTime.now()
    verifyCheck(
      'Expired Hashed Refresh Token Identification & Expiration Logic',
      isExpiredValid,
      expiredToken
        ? `Token status: ${expiredToken.status}, expired at: ${expiredToken.expiresAt.toISO()}`
        : 'Token not found'
    )

    // Check L: Revoked Refresh Token Status
    const revokedToken = await refreshTokenRepo.findByRawToken(
      'inconsistent_revoked_token_sample_67890'
    )
    const isRevokedValid =
      revokedToken !== null && revokedToken.status === RefreshTokenStatus.REVOKED
    verifyCheck(
      'Revoked Hashed Refresh Token Identification',
      isRevokedValid,
      revokedToken ? `Token status: ${revokedToken.status}` : 'Token not found'
    )

    // Check M: Active Refresh Token Assigned to Soft-DELETED User
    if (deletedUserRaw) {
      const deletedUserToken = await RefreshToken.query()
        .where('user_id', deletedUserRaw.id)
        .first()
      const isOrphanedTokenValid =
        deletedUserToken !== null && deletedUserToken.status === RefreshTokenStatus.ACTIVE
      verifyCheck(
        'Orphaned Active Refresh Token on Soft-DELETED User',
        isOrphanedTokenValid,
        deletedUserToken
          ? `Token ID: ${deletedUserToken.id} active for soft-deleted user`
          : 'Token not found'
      )
    }

    this.logger.info('\n-------------------------------------------------------------')
    this.logger.info(
      `Inconsistent DB Test Summary: Total: ${totalChecks} | Passed: ${passedChecks} | Failed: ${failedChecks}`
    )
    this.logger.info('-------------------------------------------------------------\n')
  }
}
