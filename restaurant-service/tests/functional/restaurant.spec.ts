import { JwtService } from '../../app/Services/JwtService'
import { RestaurantService } from '../../app/Services/RestaurantService'
import { Roles } from '../../app/Constants/Roles'
import { RestaurantAccessDeniedException } from '../../app/Exceptions/CustomExceptions'

export function runRestaurantServiceTests() {
  // 1. Test JWT Verification
  const owner1Token = JwtService.generateToken({
    id: 'owner-uuid-1111-1111-1111-111111111111',
    email: 'owner1@example.com',
    roles: [Roles.RESTAURANT_OWNER],
  })

  const owner2Token = JwtService.generateToken({
    id: 'owner-uuid-2222-2222-2222-222222222222',
    email: 'owner2@example.com',
    roles: [Roles.RESTAURANT_OWNER],
  })

  const customerToken = JwtService.generateToken({
    id: 'customer-uuid-3333-3333-3333-333333333333',
    email: 'customer@example.com',
    roles: [Roles.CUSTOMER],
  })

  const adminToken = JwtService.generateToken({
    id: 'admin-uuid-4444-4444-4444-444444444444',
    email: 'admin@example.com',
    roles: [Roles.ADMIN],
  })

  const decodedOwner1 = JwtService.verifyAccessToken(owner1Token)
  if (decodedOwner1.id !== 'owner-uuid-1111-1111-1111-111111111111') {
    throw new Error('JWT verification failed for owner 1')
  }
  if (!decodedOwner1.roles?.includes(Roles.RESTAURANT_OWNER)) {
    throw new Error('JWT verification missing RESTAURANT_OWNER role')
  }

  // Ensure other tokens verify correctly
  JwtService.verifyAccessToken(owner2Token)
  JwtService.verifyAccessToken(customerToken)
  JwtService.verifyAccessToken(adminToken)

  // 2. Test Authorization & Domain Rules
  const restaurantService = new RestaurantService()

  const mockRestaurantOwner1 = {
    id: 'rest-1',
    ownerId: 'owner-uuid-1111-1111-1111-111111111111',
    name: 'Owner 1 Bistro',
  }

  // Owner 1 can manage own restaurant
  try {
    ;(restaurantService as any).ensureOwnershipOrAdmin(
      mockRestaurantOwner1.ownerId,
      'owner-uuid-1111-1111-1111-111111111111',
      [Roles.RESTAURANT_OWNER]
    )
  } catch (err) {
    throw new Error('Owner 1 should be allowed to manage own restaurant')
  }

  // Owner 2 CANNOT manage Owner 1's restaurant
  let accessDenied = false
  try {
    ;(restaurantService as any).ensureOwnershipOrAdmin(
      mockRestaurantOwner1.ownerId,
      'owner-uuid-2222-2222-2222-222222222222',
      [Roles.RESTAURANT_OWNER]
    )
  } catch (err) {
    if (err instanceof RestaurantAccessDeniedException) {
      accessDenied = true
    }
  }
  if (!accessDenied) {
    throw new Error('Owner 2 should be denied access to Owner 1 restaurant')
  }

  // Admin CAN manage any restaurant globally
  try {
    ;(restaurantService as any).ensureOwnershipOrAdmin(
      mockRestaurantOwner1.ownerId,
      'admin-uuid-4444-4444-4444-444444444444',
      [Roles.ADMIN]
    )
  } catch (err) {
    throw new Error('Admin should be allowed to manage any restaurant globally')
  }

  // Customer cannot manage restaurant
  let customerDenied = false
  try {
    ;(restaurantService as any).ensureOwnershipOrAdmin(
      mockRestaurantOwner1.ownerId,
      'customer-uuid-3333-3333-3333-333333333333',
      [Roles.CUSTOMER]
    )
  } catch (err) {
    if (err instanceof RestaurantAccessDeniedException) {
      customerDenied = true
    }
  }
  if (!customerDenied) {
    throw new Error('Customer should be denied management access')
  }

  console.log('✅ All Restaurant Microservice business rule tests passed successfully!')
  return true
}

runRestaurantServiceTests()
