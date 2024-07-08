import app from '@adonisjs/core/services/app'
import { defineConfig } from '@adonisjs/lucid'
import { join } from 'path'
import fs from 'fs'

const databaseDirectory = join(app.appRoot.pathname, 'database')
const databaseFile = join(databaseDirectory, 'db.sqlite3')

// Ensure the database directory exists
if (!fs.existsSync(databaseDirectory)) {
  fs.mkdirSync(databaseDirectory, { recursive: true })
}

const dbConfig = defineConfig({
  connection: 'sqlite',
  connections: {
    sqlite: {
      client: 'better-sqlite3',
      connection: {
        filename: databaseFile, // app.tmpPath('db.sqlite3'),
      },
      useNullAsDefault: true,
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
    },
  },
})

export default dbConfig
