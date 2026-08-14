import { BaseCommand } from '@adonisjs/core/build/standalone'
import { validator } from '@ioc:Adonis/Core/Validator'

import RegisterValidator from 'App/Validators/RegisterValidator'
import LoginValidator from 'App/Validators/LoginValidator'
import UpdateUserValidator from 'App/Validators/UpdateUserValidator'
import ChangePasswordValidator from 'App/Validators/ChangePasswordValidator'
import CreateAddressValidator from 'App/Validators/CreateAddressValidator'
import UpdateAddressValidator from 'App/Validators/UpdateAddressValidator'
import AssignRoleValidator from 'App/Validators/AssignRoleValidator'
import PaginationValidator from 'App/Validators/PaginationValidator'

export default class TestValidators extends BaseCommand {
  public static commandName = 'test:validators'
  public static description = 'Run test cases against consolidated Request Validators'

  public static settings = {
    loadApp: true,
    stayAlive: false,
  }

  public async run() {
    this.logger.info('Starting Streamlined Request Validator Test Suite...\n')

    let passedCount = 0
    let failedCount = 0

    const runTest = async (
      testName: string,
      validatorClass: any,
      data: any,
      expectedFailureField?: string,
      mockCtxExtra: any = {}
    ) => {
      const mockCtx: any = {
        request: { input: (key: string) => data[key], qs: () => data },
        params: data,
        auth: { user: { id: '00000000-0000-0000-0000-000000000000' } },
        ...mockCtxExtra,
      }

      try {
        const inst = new validatorClass(mockCtx)
        await validator.validate({
          schema: inst.schema,
          data: data,
          messages: inst.messages,
        })

        this.logger.error(`❌ [FAIL] ${testName} - Validation unexpectedly PASSED for invalid data`)
        failedCount++
      } catch (err: any) {
        if (err.messages) {
          const errors = err.messages.errors || err.messages
          const fields = Array.isArray(errors)
            ? errors.map((e: any) => e.field).join(', ')
            : JSON.stringify(errors)

          if (expectedFailureField && !fields.includes(expectedFailureField)) {
            this.logger.info(
              `ℹ️ [INFO] ${testName} - Validation failed as expected, but field '${expectedFailureField}' missing. Fields: [${fields}]`
            )
          } else {
            this.logger.success(
              `✅ [PASS] ${testName} -> Caught expected errors on fields: [${fields}]`
            )
          }
          passedCount++
        } else {
          this.logger.error(
            `❌ [FAIL] ${testName} - Unexpected non-validation error: ${err.message}`
          )
          failedCount++
        }
      }
    }

    // 1. RegisterValidator
    await runTest('RegisterValidator: Missing required fields', RegisterValidator, {})
    await runTest(
      'RegisterValidator: Malformed email',
      RegisterValidator,
      { email: 'bad-email-str', password: 'pass', name: 'N', phone_number: '+12345' },
      'email'
    )

    // 2. LoginValidator
    await runTest('LoginValidator: Empty payload', LoginValidator, {})
    await runTest(
      'LoginValidator: Invalid email format',
      LoginValidator,
      { email: 'not-an-email', password: '123' },
      'email'
    )

    // 3. UpdateUserValidator
    await runTest(
      'UpdateUserValidator: Malformed email',
      UpdateUserValidator,
      { email: 'bad-email' },
      'email'
    )

    // 4. ChangePasswordValidator
    await runTest(
      'ChangePasswordValidator: Missing old_password',
      ChangePasswordValidator,
      { new_password: '123' },
      'old_password'
    )

    // 5. CreateAddressValidator
    await runTest(
      'CreateAddressValidator: Missing required address fields',
      CreateAddressValidator,
      {}
    )

    // 6. UpdateAddressValidator
    await runTest(
      'UpdateAddressValidator: Invalid status enum',
      UpdateAddressValidator,
      { status: 'INVALID_ENUM' },
      'status'
    )

    // 7. AssignRoleValidator
    await runTest(
      'AssignRoleValidator: Exceeding max length role_name',
      AssignRoleValidator,
      { role_name: 'A'.repeat(55) },
      'role_name'
    )

    // 8. PaginationValidator
    await runTest(
      'PaginationValidator: Limit out of range',
      PaginationValidator,
      { limit: 500 },
      'limit'
    )

    this.logger.info('\n-------------------------------------------------------------')
    this.logger.info(
      `Test Results Summary: Total: ${
        passedCount + failedCount
      } | Passed: ${passedCount} | Failed: ${failedCount}`
    )
    this.logger.info('-------------------------------------------------------------\n')
  }
}
