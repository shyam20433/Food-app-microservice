import { DateTime } from 'luxon'
import { column, beforeCreate, BaseModel, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
import Restaurant from 'App/Models/Restaurant'
import Category from 'App/Models/Category'
import { MenuItemStatus } from 'App/Constants/Status'

export default class MenuItem extends BaseModel {
  public static table = 'menu_items'

  @column({ isPrimary: true })
  public id: string

  @column({ columnName: 'restaurant_id' })
  public restaurantId: string

  @column({ columnName: 'category_id' })
  public categoryId: string

  @column()
  public name: string

  @column()
  public description: string | null

  @column()
  public price: number

  @column()
  public image: string | null

  @column({ columnName: 'is_vegetarian' })
  public isVegetarian: boolean

  @column({ columnName: 'preparation_time' })
  public preparationTime: number

  @column({ columnName: 'is_available' })
  public isAvailable: boolean

  @column()
  public status: MenuItemStatus

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Restaurant, {
    foreignKey: 'restaurantId',
  })
  public restaurant: BelongsTo<typeof Restaurant>

  @belongsTo(() => Category, {
    foreignKey: 'categoryId',
  })
  public category: BelongsTo<typeof Category>

  @beforeCreate()
  public static assignUuid(menuItem: MenuItem) {
    if (!menuItem.id) {
      menuItem.id = uuidv4()
    }
  }
}
