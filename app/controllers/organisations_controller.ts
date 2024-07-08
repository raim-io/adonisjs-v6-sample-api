import type { HttpContext } from '@adonisjs/core/http'
import { addOrganisationUserValidator, createOrganisationValidator } from '#validators/organisation'
import Organisation from '#models/organisation'

export default class OrganisationsController {
  /**
   * `GET /api/organisations`
   *
   * @param HttpContext
   * @returns Fetch the organisations a user belongs to
   */
  async index({ response, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()

      const userOrganisations = await user.related('organisations').query()

      return response.ok({
        status: 'success',
        message: '<message>',
        data: {
          organisations: userOrganisations,
        },
      })
    } catch (error) {
      // throw new error('Unable to retrieve user organisations')

      return response.badRequest({
        status: 'Bad request',
        message: 'Registration un',
      })
    }
  }

  /**
   * `GET /api/organisations/:orgId`
   *
   * @param HttpContext
   * @returns Retrieve an organisation a user belongs to
   */
  async show({ response, auth, params }: HttpContext) {
    try {
      const user = await auth.authenticate()

      const userOrganisation = await user
        .related('organisations')
        .query()
        .where({ 'organisations.org_id': params.orgId })
        .first()

      return response.ok({
        status: 'success',
        message: '<message>',
        data: userOrganisation,
      })
    } catch (error) {
      return response.badRequest({ message: error.message })
    }
  }

  /**
   * `POST /api/organisations`
   *
   * @param HttpContext
   * @returns Create a organisation through a user
   */
  async store({ request, response, auth }: HttpContext) {
    const { name, description } = await createOrganisationValidator.validate(request.all())
    const user = await auth.authenticate()

    try {
      const organisation = await user!.related('organisations').create({ name, description })

      return response.created({
        status: 'success',
        message: 'Organisation created successfully',
        data: organisation,
      })
    } catch (error) {
      response.badRequest({
        status: 'Bad request',
        message: 'Client error',
        statusCode: 400,
      })
    }
  }

  /**
   * Add a user to an organisation
   * `POST /api/organisations/:orgId/users
   *
   * @param HttpContext
   * @returns
   */
  async storeUser({ request, response, auth, params }: HttpContext) {
    await auth.authenticate()

    const { userId } = await addOrganisationUserValidator.validate(request.all())

    try {
      const requestedOrganisation = await Organisation.query()
        .where({ orgId: params.orgId })
        .first()

      if (!requestedOrganisation) {
        return response.notFound({
          status: 'Not Found',
          message: 'Organisation was not found',
          statusCode: 404,
        })
      }

      await requestedOrganisation.related('users').sync([userId], false)

      return response.created({
        status: 'success',
        message: 'User added to organisation successfully',
      })
    } catch (error) {
      return error
    }
  }
}
