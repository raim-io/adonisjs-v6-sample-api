import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose, cuid } from '@adonisjs/core/helpers'
import { BaseModel, beforeCreate, column, manyToMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import Organisation from './organisation.js'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  public static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare userId: string

  @column()
  declare firstName: string

  @column()
  declare lastName: string

  @column()
  declare email: string

  @column()
  declare phone: string | null

  @column({ serializeAs: null })
  declare password: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @manyToMany(() => Organisation, {
    localKey: 'userId',
    pivotForeignKey: 'user_id',
    relatedKey: 'orgId',
    pivotRelatedForeignKey: 'org_id',
    pivotTimestamps: true,
    pivotTable: 'org_user',
  })
  declare organisations: ManyToMany<typeof Organisation>

  static accessTokens = DbAccessTokensProvider.forModel(User, {
    expiresIn: '30 days',
    prefix: 'Bearer',
    table: 'auth_access_tokens',
    type: 'auth_token',
    tokenSecretLength: 50,
  })

  @beforeCreate()
  public static generateCuid(user: User) {
    user.userId = cuid()
  }
}
