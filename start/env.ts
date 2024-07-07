/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  MY_NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  MY_PORT: Env.schema.number(),
  MY_APP_KEY: Env.schema.string(),
  MY_HOST: Env.schema.string({ format: 'host' }),
  MY_LOG_LEVEL: Env.schema.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']),
})
