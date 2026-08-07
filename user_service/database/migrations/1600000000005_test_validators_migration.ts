import Schema from '@ioc:Adonis/Lucid/Schema'
import { validator } from '@ioc:Adonis/Core/Validator'

import RegisterValidator from 'App/Validators/RegisterValidator'
import LoginValidator from 'App/Validators/LoginValidator'
import UpdateUserValidator from 'App/Validators/UpdateUserValidator'
import ChangePasswordValidator from 'App/Validators/ChangePasswordValidator'
import CreateAddressValidator from 'App/Validators/CreateAddressValidator'
import UpdateAddressValidator from 'App/Validators/UpdateAddressValidator'
import AssignRoleValidator from 'App/Validators/AssignRoleValidator'
import PaginationValidator from 'App/Validators/PaginationValidator'

export default class TestValidatorsMigration extends Schema {
  public async up() {
    console.log('\n============================================================')
    console.log(' RUNNING TEST MIGRATION: STREAMLINED VALIDATOR SUITE ')
    console.log('============================================================\n')

    let totalTests = 0
    let passedTests = 0
    let failedTests = 0

    const testCase = async (testTitle: string, ValidatorClass: any, invalidData: any) => {
      totalTests++
      const ctx: any = {
        request: { input: (k: string) => invalidData[k], qs: () => invalidData },
        params: invalidData,
        auth: { user: { id: '00000000-0000-0000-0000-000000000000' } },
      }

      try {
        const validatorInst = new ValidatorClass(ctx)
        await validator.validate({
          schema: validatorInst.schema,
          data: invalidData,
          messages: validatorInst.messages,
        })
        console.error(`❌ [FAIL] ${testTitle}: Unexpectedly passed validation!`)
        failedTests++
      } catch (err: any) {
        if (err.messages) {
          const errors = err.messages.errors || err.messages
          const fieldNames = Array.isArray(errors)
            ? errors.map((e: any) => e.field).join(', ')
            : JSON.stringify(errors)
          console.log(`✅ [PASS] ${testTitle}`)
          console.log(
            `        -> Properly caught invalid input errors on field(s): [${fieldNames}]`
          )
          passedTests++
        } else {
          console.error(`❌ [FAIL] ${testTitle}: Unexpected error -> ${err.message}`)
          failedTests++
        }
      }
    }

    await testCase('RegisterValidator: Missing required fields', RegisterValidator, {})
    await testCase('LoginValidator: Empty payload', LoginValidator, {})
    await testCase('UpdateUserValidator: Malformed email', UpdateUserValidator, {
      email: 'bad-email',
    })
    await testCase('ChangePasswordValidator: Missing old_password', ChangePasswordValidator, {
      new_password: '123',
    })
    await testCase(
      'CreateAddressValidator: Missing required address fields',
      CreateAddressValidator,
      {}
    )
    await testCase('UpdateAddressValidator: Invalid status enum', UpdateAddressValidator, {
      status: 'INVALID_ENUM',
    })
    await testCase('AssignRoleValidator: Missing role_name', AssignRoleValidator, {})
    await testCase('PaginationValidator: Limit out of range', PaginationValidator, { limit: 500 })

    console.log('\n============================================================')
    console.log(
      ` VALIDATOR TEST SUMMARY: Total: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests} `
    )
    console.log('============================================================\n')
  }

  public async down() {}
}
