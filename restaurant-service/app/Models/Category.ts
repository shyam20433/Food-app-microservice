import { DateTime } from 'luxon'
import {
  column,
  beforeCreate,
  BaseModel,
  belongsTo,
  BelongsTo,
  hasMany,
  HasMany,
} from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
import Restaurant from 'App/Models/Restaurant'
import MenuItem from 'App/Models/MenuItem'
import { CategoryStatus } from 'App/Constants/Status'

export default class Category extends BaseModel {
  public static table = 'categories'

  @column({ isPrimary: true })
  public id: string

  @column({ columnName: 'restaurant_id' })
  public restaurantId: string

  @column()
  public name: string

  @column()
  public description: string | null

  @column()
  public status: CategoryStatus

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Restaurant, {
    foreignKey: 'restaurantId',
  })
  public restaurant: BelongsTo<typeof Restaurant>

  @hasMany(() => MenuItem, {
    foreignKey: 'categoryId',
  })
  public menuItems: HasMany<typeof MenuItem>

  @beforeCreate()
  public static assignUuid(category: Category) {
    if (!category.id) {
      category.id = uuidv4()
    }
  }
}
