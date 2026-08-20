import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export class IdParamValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    id: schema.string({}, [rules.uuid()]),
  })

  public messages: CustomMessages = {
    'id.uuid': 'id must be a valid UUID',
    'id.required': 'id is required',
  }
}

export class RestaurantIdParamValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    restaurantId: schema.string({}, [rules.uuid()]),
  })

  public messages: CustomMessages = {
    'restaurantId.uuid': 'restaurantId must be a valid UUID',
    'restaurantId.required': 'restaurantId is required',
  }
}

export class RestaurantAndCategoryParamValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    restaurantId: schema.string({}, [rules.uuid()]),
    categoryId: schema.string({}, [rules.uuid()]),
  })

  public messages: CustomMessages = {
    'restaurantId.uuid': 'restaurantId must be a valid UUID',
    'categoryId.uuid': 'categoryId must be a valid UUID',
  }
}

export class RestaurantAndItemParamValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    restaurantId: schema.string({}, [rules.uuid()]),
    itemId: schema.string({}, [rules.uuid()]),
  })

  public messages: CustomMessages = {
    'restaurantId.uuid': 'restaurantId must be a valid UUID',
    'itemId.uuid': 'itemId must be a valid UUID',
  }
}
