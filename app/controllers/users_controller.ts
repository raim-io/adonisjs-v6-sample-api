import Organisation from '#models/organisation'
import User from '#models/user'
import { createUserValidator, loginUserValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class UsersController {
  /**
   * `POST /auth/register`
   *
   * @param HttpContext
   * @returns Create a new user with a new organisation for the user
   */
  async register({ request, response }: HttpContext) {
    const payload = await createUserValidator.validate(request.all())

    try {
      const newUser = await db.transaction(async (trx) => {
        const user = await User.create(
          {
            firstName: payload.firstName,
            lastName: payload.lastName,
            email: payload.email,
            phone: payload.phone,
            password: payload.password,
          },
          { client: trx }
        )

        const organisation = await Organisation.create(
          {
            name: `${payload.firstName}'s Organisation`,
            description: `This organisation belongs to ${payload.firstName} ${payload.lastName}`,
          },
          { client: trx }
        )

        await user.related('organisations').sync([organisation.orgId], false, trx)

        return user
      })

      const token = await User.accessTokens.create(newUser)

      return response.created({
        status: 'success',
        message: 'Registration successful',
        data: { accessToken: token.value!.release(), user: newUser },
      })
    } catch (error) {
      return response.unauthorized({
        status: 'Bad request',
        message: 'Registration unsuccessful',
        statusCode: 401,
      })
    }
  }

  /**
   * `POST /auth/login`
   *
   * @param HttpContext
   * @returns Login a user
   */
  async login({ request, response }: HttpContext) {
    const { email, password } = await loginUserValidator.validate(request.all())

    try {
      const user = await User.verifyCredentials(email, password)
      const token = await User.accessTokens.create(user)

      return response.created({
        status: 'success',
        message: 'Login successful',
        data: { accessToken: token.value!.release(), user: user },
      })
    } catch (error) {
      return response.unauthorized({
        status: 'Bad request',
        message: 'Authentication failed',
        statusCode: 401,
      })
    }
  }

  /**
   * `GET /api/users/:id`
   *
   * @param HttpContext
   * @returns Fetch the record of a user
   */
  async show({ response, params, auth }: HttpContext) {
    const isAuthenticated = await auth.check()
    if (!isAuthenticated) {
      return response.unauthorized({
        status: 'Unauthorized',
        message: 'Authentication required. Please log in to access this resource',
        statusCode: 401,
      })
    }

    const authenticatedUser = auth.getUserOrFail()

    if (authenticatedUser.userId !== params.id) {
      return response.unauthorized({
        status: 'Unauthorized',
        message: 'Permission denied. You cannot view the record of another user',
        statusCode: 401,
      })
    }

    try {
      const user = await User.query().where({ userId: params.id }).first()

      if (!user) {
        return response.notFound({
          status: 'Bad request',
          message: 'User not found',
          statusCod: 404,
        })
      }

      return response.ok({
        status: 'success',
        message: '<message>',
        data: user,
      })
    } catch (errror) {
      return response.badRequest({
        status: 'Bad request',
        message: 'Registration unsuccessful',
        statusCode: 400,
      })
    }
  }
}
