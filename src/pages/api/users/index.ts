import type { APIRoute } from 'astro'
import { createDb } from '../../../db'
import { users } from '../../../db/schema'
import { createUserSchema } from '../../../lib/validators'

export const GET: APIRoute = async ({ locals }) => {
  const db = createDb(locals.runtime.env.DB)
  const all = await db.select().from(users)
  return Response.json(all)
}

export const POST: APIRoute = async ({ locals, request }) => {
  const body = await request.json()
  const parsed = createUserSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json(
      { errors: parsed.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const db = createDb(locals.runtime.env.DB)
  const [user] = await db
    .insert(users)
    .values({ ...parsed.data, createdAt: new Date() })
    .returning()

  return Response.json(user, { status: 201 })
}
