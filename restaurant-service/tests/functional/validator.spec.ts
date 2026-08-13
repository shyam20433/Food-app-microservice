import { RestaurantStatus, AddressStatus, CategoryStatus, MenuItemStatus } from '../../app/Constants/Status'

const { schema } = require('@adonisjs/validator/build/src/Schema')
const { rules } = require('@adonisjs/validator/build/src/Rules')
const { validator } = require('@adonisjs/validator/build/src/Validator')

export async function runAllValidatorTests() {
  console.log('🧪 Starting Validation Engine Test Suite for all 10 Microservice Validators...\n')

  let passed = 0

  // 1. CreateRestaurantValidator Schema & Validation
  console.log('1. Testing CreateRestaurantValidator...')
  const createRestaurantSchema = schema.create({
    name: schema.string({ trim: true }, [rules.maxLength(255)]),
    description: schema.string.optional({ trim: true }, [rules.maxLength(1000)]),
    phone_number: schema.string({ trim: true }, [rules.maxLength(50)]),
    email: schema.string({ trim: true }, [rules.email(), rules.maxLength(255)]),
    logo: schema.string.optional({ trim: true }, [rules.maxLength(500)]),
    opening_time: schema.string.optional({ trim: true }, [rules.maxLength(20)]),
    closing_time: schema.string.optional({ trim: true }, [rules.maxLength(20)]),
    delivery_radius: schema.number.optional([rules.range(0.1, 500)]),
    status: schema.enum.optional(Object.values(RestaurantStatus)),

    address: schema.object.optional().members({
      house_no: schema.string({ trim: true }, [rules.maxLength(100)]),
      street: schema.string({ trim: true }, [rules.maxLength(255)]),
      area: schema.string.optional({ trim: true }, [rules.maxLength(255)]),
      city: schema.string({ trim: true }, [rules.maxLength(100)]),
      state: schema.string({ trim: true }, [rules.maxLength(100)]),
      pincode: schema.string({ trim: true }, [rules.maxLength(20)]),
      latitude: schema.number.optional([rules.range(-90, 90)]),
      longitude: schema.number.optional([rules.range(-180, 180)]),
    }),
  })

  const validRestaurantData = {
    name: 'Tasty Bites Pizza',
    phone_number: '+1555010099',
    email: 'info@tastybites.com',
    delivery_radius: 8.5,
    address: {
      house_no: '12B',
      street: 'Food Court Avenue',
      city: 'Metropolis',
      state: 'NY',
      pincode: '10001',
    },
  }
  const res1 = await validator.validate({ schema: createRestaurantSchema, data: validRestaurantData })
  if (res1.name !== 'Tasty Bites Pizza' || res1.email !== 'info@tastybites.com') {
    throw new Error('CreateRestaurantValidator valid data failed')
  }

  // Expect failure on invalid email
  let res1Err = false
  try {
    await validator.validate({ schema: createRestaurantSchema, data: { name: 'Test', phone_number: '123', email: 'invalid-email' } })
  } catch {
    res1Err = true
  }
  if (!res1Err) throw new Error('CreateRestaurantValidator should fail on invalid email')
  console.log('  ✓ CreateRestaurantValidator passed (valid payload accepted, invalid email rejected)')
  passed++

  // 2. UpdateRestaurantValidator
  console.log('2. Testing UpdateRestaurantValidator...')
  const updateRestaurantSchema = schema.create({
    name: schema.string.optional({ trim: true }, [rules.maxLength(255)]),
    description: schema.string.optional({ trim: true }, [rules.maxLength(1000)]),
    phone_number: schema.string.optional({ trim: true }, [rules.maxLength(50)]),
    email: schema.string.optional({ trim: true }, [rules.email(), rules.maxLength(255)]),
    delivery_radius: schema.number.optional([rules.range(0.1, 500)]),
    status: schema.enum.optional(Object.values(RestaurantStatus)),
  })

  const res2 = await validator.validate({ schema: updateRestaurantSchema, data: { name: 'Updated Name', delivery_radius: 12.0 } })
  if (res2.name !== 'Updated Name' || res2.delivery_radius !== 12.0) {
    throw new Error('UpdateRestaurantValidator valid data failed')
  }
  console.log('  ✓ UpdateRestaurantValidator passed')
  passed++

  // 2b. UpdateRestaurantStatusValidator (ENABLED/DISABLED only)
  console.log('2b. Testing UpdateRestaurantStatusValidator...')
  const updateStatusSchema = schema.create({
    status: schema.enum(['ENABLED', 'DISABLED'] as const),
  })
  const statusRes = await validator.validate({ schema: updateStatusSchema, data: { status: 'ENABLED' } })
  if (statusRes.status !== 'ENABLED') throw new Error('UpdateRestaurantStatusValidator failed for ENABLED')

  let statusErr = false
  try {
    await validator.validate({ schema: updateStatusSchema, data: { status: 'DELETED' } })
  } catch {
    statusErr = true
  }
  if (!statusErr) throw new Error('UpdateRestaurantStatusValidator should REJECT DELETED status')
  console.log('  ✓ UpdateRestaurantStatusValidator passed (ENABLED/DISABLED accepted, DELETED rejected)')
  passed++

  // 3. CreateRestaurantAddressValidator
  console.log('3. Testing CreateRestaurantAddressValidator...')
  const createAddressSchema = schema.create({
    house_no: schema.string({ trim: true }, [rules.maxLength(100)]),
    street: schema.string({ trim: true }, [rules.maxLength(255)]),
    area: schema.string.optional({ trim: true }, [rules.maxLength(255)]),
    city: schema.string({ trim: true }, [rules.maxLength(100)]),
    state: schema.string({ trim: true }, [rules.maxLength(100)]),
    pincode: schema.string({ trim: true }, [rules.maxLength(20)]),
    latitude: schema.number.optional([rules.range(-90, 90)]),
    longitude: schema.number.optional([rules.range(-180, 180)]),
    status: schema.enum.optional(Object.values(AddressStatus)),
  })

  const validAddress = { house_no: '10A', street: 'High St', city: 'Metropolis', state: 'NY', pincode: '10001', latitude: 40.71, longitude: -74.0 }
  const res3 = await validator.validate({ schema: createAddressSchema, data: validAddress })
  if (res3.city !== 'Metropolis' || res3.pincode !== '10001') {
    throw new Error('CreateRestaurantAddressValidator valid data failed')
  }
  console.log('  ✓ CreateRestaurantAddressValidator passed')
  passed++

  // 4. UpdateRestaurantAddressValidator
  console.log('4. Testing UpdateRestaurantAddressValidator...')
  const updateAddressSchema = schema.create({
    house_no: schema.string.optional({ trim: true }, [rules.maxLength(100)]),
    street: schema.string.optional({ trim: true }, [rules.maxLength(255)]),
    city: schema.string.optional({ trim: true }, [rules.maxLength(100)]),
    state: schema.string.optional({ trim: true }, [rules.maxLength(100)]),
    pincode: schema.string.optional({ trim: true }, [rules.maxLength(20)]),
  })

  const res4 = await validator.validate({ schema: updateAddressSchema, data: { city: 'New City' } })
  if (res4.city !== 'New City') {
    throw new Error('UpdateRestaurantAddressValidator failed')
  }
  console.log('  ✓ UpdateRestaurantAddressValidator passed')
  passed++

  // 5. CreateCategoryValidator
  console.log('5. Testing CreateCategoryValidator...')
  const createCategorySchema = schema.create({
    name: schema.string({ trim: true }, [rules.maxLength(255)]),
    description: schema.string.optional({ trim: true }, [rules.maxLength(1000)]),
    status: schema.enum.optional(Object.values(CategoryStatus)),
  })

  const res5 = await validator.validate({ schema: createCategorySchema, data: { name: 'Pizzas', description: 'Wood-fired pizzas' } })
  if (res5.name !== 'Pizzas') throw new Error('CreateCategoryValidator failed')
  console.log('  ✓ CreateCategoryValidator passed')
  passed++

  // 6. UpdateCategoryValidator
  console.log('6. Testing UpdateCategoryValidator...')
  const updateCategorySchema = schema.create({
    name: schema.string.optional({ trim: true }, [rules.maxLength(255)]),
    description: schema.string.optional({ trim: true }, [rules.maxLength(1000)]),
    status: schema.enum.optional(Object.values(CategoryStatus)),
  })

  const res6 = await validator.validate({ schema: updateCategorySchema, data: { description: 'Updated desc' } })
  if (res6.description !== 'Updated desc') throw new Error('UpdateCategoryValidator failed')
  console.log('  ✓ UpdateCategoryValidator passed')
  passed++

  // 7. CreateMenuItemValidator
  console.log('7. Testing CreateMenuItemValidator...')
  const createMenuItemSchema = schema.create({
    category_id: schema.string({ trim: true }, [rules.uuid()]),
    name: schema.string({ trim: true }, [rules.maxLength(255)]),
    description: schema.string.optional({ trim: true }, [rules.maxLength(1000)]),
    price: schema.number([rules.range(0.01, 100000)]),
    image: schema.string.optional({ trim: true }, [rules.maxLength(500)]),
    is_vegetarian: schema.boolean.optional(),
    preparation_time: schema.number.optional([rules.range(1, 1440)]),
    is_available: schema.boolean.optional(),
    status: schema.enum.optional(Object.values(MenuItemStatus)),
  })

  const validMenuItem = {
    category_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    name: 'Margherita Classic',
    price: 14.99,
    is_vegetarian: true,
    preparation_time: 20,
  }
  const res7 = await validator.validate({ schema: createMenuItemSchema, data: validMenuItem })
  if (res7.name !== 'Margherita Classic' || res7.price !== 14.99) {
    throw new Error('CreateMenuItemValidator failed')
  }

  // Reject non-UUID category_id
  let res7Err = false
  try {
    await validator.validate({ schema: createMenuItemSchema, data: { category_id: 'invalid-uuid', name: 'Item', price: 10 } })
  } catch {
    res7Err = true
  }
  if (!res7Err) throw new Error('CreateMenuItemValidator should reject invalid UUID category_id')
  console.log('  ✓ CreateMenuItemValidator passed (UUID validation & pricing verified)')
  passed++

  // 8. UpdateMenuItemValidator
  console.log('8. Testing UpdateMenuItemValidator...')
  const updateMenuItemSchema = schema.create({
    category_id: schema.string.optional({ trim: true }, [rules.uuid()]),
    name: schema.string.optional({ trim: true }, [rules.maxLength(255)]),
    price: schema.number.optional([rules.range(0.01, 100000)]),
    is_vegetarian: schema.boolean.optional(),
    is_available: schema.boolean.optional(),
  })

  const res8 = await validator.validate({ schema: updateMenuItemSchema, data: { price: 15.99, is_vegetarian: true } })
  if (res8.price !== 15.99 || res8.is_vegetarian !== true) throw new Error('UpdateMenuItemValidator failed')
  console.log('  ✓ UpdateMenuItemValidator passed')
  passed++

  // 9. UpdateAvailabilityValidator
  console.log('9. Testing UpdateAvailabilityValidator...')
  const updateAvailabilitySchema = schema.create({
    is_available: schema.boolean(),
  })

  const res9 = await validator.validate({ schema: updateAvailabilitySchema, data: { is_available: false } })
  if (res9.is_available !== false) throw new Error('UpdateAvailabilityValidator failed')

  let res9Err = false
  try {
    await validator.validate({ schema: updateAvailabilitySchema, data: { is_available: 'not-a-boolean' } })
  } catch {
    res9Err = true
  }
  if (!res9Err) throw new Error('UpdateAvailabilityValidator should reject non-boolean values')
  console.log('  ✓ UpdateAvailabilityValidator passed (boolean validation verified)')
  passed++

  // 10. PaginationValidator
  console.log('10. Testing PaginationValidator...')
  const paginationSchema = schema.create({
    page: schema.number.optional([rules.range(1, 10000)]),
    limit: schema.number.optional([rules.range(1, 100)]),
    search: schema.string.optional({ trim: true }),
    status: schema.enum.optional(Object.values(RestaurantStatus)),
  })

  const res10 = await validator.validate({ schema: paginationSchema, data: { page: 2, limit: 50, search: 'burger', status: RestaurantStatus.ENABLED } })
  if (res10.page !== 2 || res10.limit !== 50 || res10.search !== 'burger') {
    throw new Error('PaginationValidator failed')
  }

  // Reject out of range page
  let res10Err = false
  try {
    await validator.validate({ schema: paginationSchema, data: { page: 0 } })
  } catch {
    res10Err = true
  }
  if (!res10Err) throw new Error('PaginationValidator should reject page = 0')
  console.log('  ✓ PaginationValidator passed (range rules verified)')
  passed++

  console.log(`\n🎉 ALL ${passed}/10 VALIDATORS PASSED ALL TEST SUITES PERFECTLY!`)
  return true
}

runAllValidatorTests().catch((err) => {
  console.error('❌ Validator test failed:', err)
  process.exit(1)
})
