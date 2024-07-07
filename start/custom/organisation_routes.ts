import router from '@adonisjs/core/services/router'

router
  .group(() => {
    // router
    //   .resource('organisations', 'organisations_controller')
    //   .apiOnly()
    //   .only(['store', 'show', 'index'])

    router.get('organisations', 'organisations_controller.index')
    router.get('organisations/:orgId', 'organisations_controller.show')
    router.post('organisations', 'organisations_controller.store')

    router.post('organisations/:orgId/users', 'organisations_controller')
  })
  .prefix('/api')
