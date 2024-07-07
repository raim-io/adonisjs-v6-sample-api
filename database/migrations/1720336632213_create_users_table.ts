import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('user_id').unique().notNullable()
      table.string('first_name').notNullable()
      table.string('last_name', 254).notNullable()
      table.string('email', 254).notNullable().unique()
      table.string('phone', 254)
      table.string('password').notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
