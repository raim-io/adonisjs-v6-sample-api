import router from '@adonisjs/core/services/router'

const UsersController = () => import('#controllers/users_controller')
const OrganisationsController = () => import('#controllers/organisations_controller')

router.get('/', async (ctx) => {
  ctx.response.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background-color: #f0f0f0;
            }
            .container {
                text-align: center;
                background: white;
                padding: 50px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .name {
                font-size: 2em;
                font-weight: bold;
            }
            .role, .brand {
                font-size: 1.2em;
                color: #555;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="name">Raheem Oluwatobiloba</div>
            <div class="role">Backend Engineering</div>
            <div class="brand">HNG 11 - Task 2</div>
        </div>
    </body>
    </html>
  `)
})

/**
 * Authentication routes
 */
router
  .group(() => {
    router.post('register', [UsersController, 'register'])
    router.post('login', [UsersController, 'login'])
  })
  .prefix('/auth')

/**
 * User routes
 */
router
  .group(() => {
    router.get('users/:id', [UsersController, 'show'])
  })
  .prefix('/api')

/**
 * Organisation routes
 */
router
  .group(() => {
    router.get('organisations', [OrganisationsController, 'index'])
    router.get('organisations/:orgId', [OrganisationsController, 'show'])
    router.post('organisations', [OrganisationsController, 'store'])

    router.post('organisations/:orgId/users', [OrganisationsController, 'storeUser'])
  })
  .prefix('/api')
