"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runRestaurantServiceTests = void 0;
const JwtService_1 = require("../../app/Services/JwtService");
const RestaurantService_1 = require("../../app/Services/RestaurantService");
const Roles_1 = require("../../app/Constants/Roles");
const CustomExceptions_1 = require("../../app/Exceptions/CustomExceptions");
function runRestaurantServiceTests() {
    const owner1Token = JwtService_1.JwtService.generateToken({
        id: 'owner-uuid-1111-1111-1111-111111111111',
        email: 'owner1@example.com',
        roles: [Roles_1.Roles.RESTAURANT_OWNER],
    });
    const owner2Token = JwtService_1.JwtService.generateToken({
        id: 'owner-uuid-2222-2222-2222-222222222222',
        email: 'owner2@example.com',
        roles: [Roles_1.Roles.RESTAURANT_OWNER],
    });
    const customerToken = JwtService_1.JwtService.generateToken({
        id: 'customer-uuid-3333-3333-3333-333333333333',
        email: 'customer@example.com',
        roles: [Roles_1.Roles.CUSTOMER],
    });
    const adminToken = JwtService_1.JwtService.generateToken({
        id: 'admin-uuid-4444-4444-4444-444444444444',
        email: 'admin@example.com',
        roles: [Roles_1.Roles.ADMIN],
    });
    const decodedOwner1 = JwtService_1.JwtService.verifyAccessToken(owner1Token);
    if (decodedOwner1.id !== 'owner-uuid-1111-1111-1111-111111111111') {
        throw new Error('JWT verification failed for owner 1');
    }
    if (!decodedOwner1.roles?.includes(Roles_1.Roles.RESTAURANT_OWNER)) {
        throw new Error('JWT verification missing RESTAURANT_OWNER role');
    }
    JwtService_1.JwtService.verifyAccessToken(owner2Token);
    JwtService_1.JwtService.verifyAccessToken(customerToken);
    JwtService_1.JwtService.verifyAccessToken(adminToken);
    const restaurantService = new RestaurantService_1.RestaurantService();
    const mockRestaurantOwner1 = {
        id: 'rest-1',
        ownerId: 'owner-uuid-1111-1111-1111-111111111111',
        name: 'Owner 1 Bistro',
    };
    try {
        ;
        restaurantService.ensureOwnershipOrAdmin(mockRestaurantOwner1.ownerId, 'owner-uuid-1111-1111-1111-111111111111', [Roles_1.Roles.RESTAURANT_OWNER]);
    }
    catch (err) {
        throw new Error('Owner 1 should be allowed to manage own restaurant');
    }
    let accessDenied = false;
    try {
        ;
        restaurantService.ensureOwnershipOrAdmin(mockRestaurantOwner1.ownerId, 'owner-uuid-2222-2222-2222-222222222222', [Roles_1.Roles.RESTAURANT_OWNER]);
    }
    catch (err) {
        if (err instanceof CustomExceptions_1.RestaurantAccessDeniedException) {
            accessDenied = true;
        }
    }
    if (!accessDenied) {
        throw new Error('Owner 2 should be denied access to Owner 1 restaurant');
    }
    try {
        ;
        restaurantService.ensureOwnershipOrAdmin(mockRestaurantOwner1.ownerId, 'admin-uuid-4444-4444-4444-444444444444', [Roles_1.Roles.ADMIN]);
    }
    catch (err) {
        throw new Error('Admin should be allowed to manage any restaurant globally');
    }
    let customerDenied = false;
    try {
        ;
        restaurantService.ensureOwnershipOrAdmin(mockRestaurantOwner1.ownerId, 'customer-uuid-3333-3333-3333-333333333333', [Roles_1.Roles.CUSTOMER]);
    }
    catch (err) {
        if (err instanceof CustomExceptions_1.RestaurantAccessDeniedException) {
            customerDenied = true;
        }
    }
    if (!customerDenied) {
        throw new Error('Customer should be denied management access');
    }
    console.log('✅ All Restaurant Microservice business rule tests passed successfully!');
    return true;
}
exports.runRestaurantServiceTests = runRestaurantServiceTests;
runRestaurantServiceTests();
//# sourceMappingURL=restaurant.spec.js.map