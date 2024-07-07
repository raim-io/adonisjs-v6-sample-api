import { UserFactory } from '#database/factories/user_factory'
import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'
import { getActiveTest, test } from '@japa/runner'
import timekeeper from 'timekeeper'

export function timeTravel(monthsToTravel: number) {
  const test = getActiveTest()
  if (!test) {
    throw new Error('Cannot use "timeTravel" outside of a Japa test')
  }

  timekeeper.reset()

  const date = new Date()
  date.setMonth(date.getMonth() + monthsToTravel)
  timekeeper.travel(date)

  test.cleanup(() => {
    timekeeper.reset()
  })
}

test.group('Users / Auth', (group) => {
  group.each.setup(async () => await testUtils.db().truncate())

  test('should successfully register a user and create a default organisation if all requiremets are met', async ({
    assert,
    client,
  }) => {
    const formData = {
      firstName: 'Oluwatobiloba',
      lastName: 'Raheem',
      email: 'test@gmail.com',
      phone: '+234 7777777777',
      password: 'my password',
    }

    const response = await client.post('/auth/register').json(formData)

    const persistedUser = await User.query().where({ email: formData.email }).first()
    assert.isNotNull(persistedUser)

    response.assertBodyContains({
      status: 'success',
      message: 'Registration successful',
      data: {
        user: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: undefined, // Password is not returned
        },
      },
    })

    assert.isDefined(response.body().data.accessToken)
    assert.isNotNull(response.body().data.accessToken)

    // Assert that the default organisation was created
    await persistedUser!.load('organisations')

    assert.lengthOf(persistedUser!.organisations, 1)
    assert.equal(persistedUser?.organisations[0].name, `${formData.firstName}'s Organisation`)
  })

  test('It successfully login a user if all conditions are met', async ({ assert, client }) => {
    const password = 'My Password'
    const user = await UserFactory.merge({ password }).create()

    const formData = { email: user.email, password }

    const response = await client.post('/auth/login').json(formData)

    response.assertBodyContains({
      status: 'success',
      message: 'Login successful',
      data: {
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          password: undefined, // Password is not returned
        },
      },
    })

    assert.isNotNull(response.body().data.accessToken)
    assert.isDefined(response.body().data.accessToken)
  })

  function dataset() {
    const fields = ['email', 'password'] as const
    const conditions = ['invalid', 'undefined'] as const

    const mix: Array<[(typeof fields)[number], (typeof conditions)[number]]> = []

    fields.forEach((istate) => {
      conditions.forEach((jstate) => {
        mix.push([istate, jstate])
      })
    })

    return mix
  }

  test('should NOT log the user in if the "{$self}" credential is invalid')
    .with(dataset())
    .run(async ({ client }, [field, condition]) => {
      const password = 'My Password'
      const user = await UserFactory.merge({ password }).create()

      const formData = {
        email:
          condition === 'undefined'
            ? undefined
            : field !== 'email'
              ? user.email
              : 'invalidemail@gmail.com',
        password:
          condition === 'undefined'
            ? undefined
            : field !== 'password'
              ? password
              : 'invalid password',
      }

      const response = await client.post('/auth/login').json(formData)

      if (condition === 'undefined') {
        response.assertStatus(422)
        response.assertBodyContains({
          errors: [
            { message: `The ${field} field must be defined`, field: `${field}`, rule: 'required' },
          ],
        })

        return
      }

      response.assertBodyContains({
        status: 'Bad request',
        message: 'Authentication failed',
        statusCode: 401,
      })
    })

  test('should retrieve the record of a user', async ({ client }) => {
    // Create multiple users
    const users = await UserFactory.createMany(10)

    // Try to fetch a single user
    const response = await client
      .get(`/api/users/${users[0].userId}`)
      .withGuard('api')
      .loginAs(users[0])

    response.assertStatus(200)

    response.assertBodyContains({
      status: 'success',
      message: '<message>',
      data: {
        userId: users[0].userId,
        firstName: users[0].firstName,
        lastName: users[0].lastName,
        email: users[0].email,
        phone: users[0].phone,
        password: undefined, // Password is not returned
      },
    })
  })

  test('should NOT retrieve the record of a user if user is NOT "{$self}"')
    .with(['notLoggedIn', 'self'] as const)
    .run(async ({ client }, condition) => {
      // Create multiple users
      const users = await UserFactory.createMany(10)

      // Try to fetch a single user
      const request = client.get(`/api/users/${users[0].userId}`)
      const response = await (condition === 'notLoggedIn' ? request : request.loginAs(users[5]))

      response.assertStatus(401)

      response.assertBodyContains({
        status: 'Unauthorized',
        message:
          condition === 'notLoggedIn'
            ? 'Authentication required. Please log in to access this resource'
            : 'Permission denied. You cannot view the record of another user',
        statusCode: 401,
      })
    })

  test('should fail if the required "{$self}" field is missing')
    .with(['firstName', 'lastName', 'email', 'phone', 'password'] as const)
    .run(async ({ client }, field) => {
      const formData = {
        firstName: field !== 'firstName' ? 'Oluwatobiloba' : undefined,
        lastName: field !== 'lastName' ? 'Raheem' : undefined,
        email: field !== 'email' ? 'test@gmail.com' : undefined,
        phone: field !== 'phone' ? '+234 7777777777' : undefined,
        password: field !== 'password' ? 'my password' : undefined,
      }

      const response = await client.post('/auth/register').json(formData)

      response.assertStatus(422)

      response.assertBodyContains({
        errors: [
          { message: `The ${field} field must be defined`, field: `${field}`, rule: 'required' },
        ],
      })
    })

  test('should fail if there are duplicate "email" or "userId" fields', async ({ client }) => {
    // Create a user
    const existingUser = await UserFactory.create()

    const formData = {
      firstName: 'Oluwatobiloba',
      lastName: 'Raheem',
      // Try registering with the emil of the existing user
      email: existingUser.email,
      phone: '+234 7777777777',
      password: 'my password',
    }

    const response = await client.post('/auth/register').json(formData)

    response.assertStatus(422)

    response.assertBodyContains({
      errors: [
        { message: `The email has already been taken`, field: `email`, rule: 'database.unique' },
      ],
    })
  })
})
