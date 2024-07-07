import type { HttpContext } from '@adonisjs/core/http'
import { addOrganisationUserValidator, createOrganisationValidator } from '#validators/organisation'
import db from '@adonisjs/lucid/services/db'
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
      throw error('Unable to retrieve user organisations')
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
        .where({ orgId: params.orgId })

      return response.ok({
        status: 'success',
        message: '<message>',
        data: {
          userOrganisation,
        },
      })
    } catch (error) {
      throw error('Unable to retrieve user organisations')
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
    const user = auth.user

    if (!user) {
      return
    }

    try {
      const newOrganisation = await db.transaction(async (trx) => {
        const organisation = await user!
          .related('organisations')
          .create({ name, description }, { client: trx })

        return organisation
      })

      return response.created({
        status: 'success',
        message: 'Organisation created successfully',
        data: newOrganisation,
      })
    } catch (error) {
      throw error({
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
    const { userId } = await addOrganisationUserValidator.validate(request.all())
    const user = auth.user

    if (!user) {
      return
    }

    await db.transaction(async (trx) => {
      const requestedOrganisation = await Organisation.query()
        .where({ orgId: params.orgId })
        .first()

      if (!requestedOrganisation) {
        return
      }

      await requestedOrganisation.related('users').sync([userId], false, trx)
    })

    return response.created({
      status: 'success',
      message: 'User added to organisation successfully',
    })
  }
}
