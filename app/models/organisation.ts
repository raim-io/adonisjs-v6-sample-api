import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, manyToMany } from '@adonisjs/lucid/orm'
import User from './user.js'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import { cuid } from '@adonisjs/core/helpers'

export default class Organisation extends BaseModel {
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare orgId: string

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => User, {
    localKey: 'orgId',
    pivotForeignKey: 'org_id',
    relatedKey: 'userId',
    pivotRelatedForeignKey: 'user_id',
    pivotTimestamps: true,
    pivotTable: 'org_user',
  })
  declare users: ManyToMany<typeof User>

  @beforeCreate()
  static generateCuid(org: Organisation) {
    org.orgId = cuid()
  }
}
