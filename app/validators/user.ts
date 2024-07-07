import vine from '@vinejs/vine'

export const createUserValidator = vine.compile(
  vine.object({
    firstName: vine.string().trim(),
    lastName: vine.string().trim(),
    email: vine
      .string()
      .email()
      .trim()
      .unique(async (db, value) => {
        const exists = await db.from('users').where({ email: value }).first()

        return !exists
      }),
    phone: vine.string().trim(),
    password: vine.string().trim(),
  })
)

export const loginUserValidator = vine.compile(
  vine.object({
    email: vine.string().email().trim(),
    password: vine.string().trim(),
  })
)
