import vine from '@vinejs/vine'

export const createOrganisationValidator = vine.compile(
  vine.object({
    name: vine.string().trim(),
    description: vine.string().trim().nullable().optional(),
  })
)

export const addOrganisationUserValidator = vine.compile(
  vine.object({
    userId: vine.string().exists(async (db, value) => {
      const exists = await db.from('users').where({ user_id: value })

      return !!exists
    }),
  })
)
