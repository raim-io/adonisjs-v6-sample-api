/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

import('./custom/user_routes.js')
import('./custom/organisation_routes.js')

router.get('/', async () => {
  return {
    hello: 'world',
  }
})
