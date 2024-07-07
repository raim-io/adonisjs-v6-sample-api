import router from '@adonisjs/core/services/router'

const UsersController = () => import('#controllers/users_controller')

/**
 * Authentication routes
 */
router
  .group(() => {
    router.post('register', [UsersController, 'register'])
    router.post('login', [UsersController, 'login'])
  })
  .prefix('/auth')

router
  .group(() => {
    router.get('users/:id', [UsersController, 'show'])
  })
  .prefix('/api')
