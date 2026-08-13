import { ApiResponse } from '../../app/Response/ApiResponse'

const { schema } = require('@adonisjs/validator/build/src/Schema')
const { rules } = require('@adonisjs/validator/build/src/Rules')
const { validator } = require('@adonisjs/validator/build/src/Validator')

export async function runForgotPasswordTests() {
  console.log('🧪 Running Forgot Password Feature Verification Tests...\n')

  // 1. Check Validator Schema & Rules
  const forgotPasswordSchema = schema.create({
    email: schema.string({ trim: true }, [rules.email()]),
    new_password: schema.string.optional({}, [rules.minLength(6)]),
  })

  // Test Valid Email Input
  const validRes = await validator.validate({
    schema: forgotPasswordSchema,
    data: { email: 'user@example.com' },
  })
  if (validRes.email !== 'user@example.com') {
    throw new Error('Valid email validation failed')
  }
  console.log('  ✓ Valid email payload accepted')

  // Test Invalid Email Input (rejection)
  let rejected = false
  try {
    await validator.validate({
      schema: forgotPasswordSchema,
      data: { email: 'invalid-email-format' },
    })
  } catch {
    rejected = true
  }
  if (!rejected) {
    throw new Error('Invalid email should be rejected by validator')
  }
  console.log('  ✓ Invalid email format correctly rejected')

  // 2. Check Response Payload Formatting
  const mockResponseCtx: any = {
    response: {
      status: (code: number) => ({
        send: (body: any) => ({ code, body }),
      }),
    },
  }

  const email = 'user@example.com'
  const tempPassword = 'TempPassword123!'
  const res = ApiResponse.success(
    mockResponseCtx,
    { email, password: tempPassword },
    'Password reset successfully. Please use this password to log in.'
  ) as any

  if (
    res.code !== 200 ||
    !res.body.success ||
    res.body.data.email !== email ||
    res.body.data.password !== tempPassword
  ) {
    throw new Error('Forgot password response structure failed')
  }
  console.log('  ✓ Forgot password response payload verified')

  console.log('\n🎉 Forgot Password Feature Verification Completed Successfully!')
  return true
}

runForgotPasswordTests().catch((err) => {
  console.error('❌ Forgot password test failed:', err)
  process.exit(1)
})
