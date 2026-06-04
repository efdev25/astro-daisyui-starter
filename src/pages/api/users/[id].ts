import type { APIRoute } from 'astro'
import { eq } from 'drizzle-orm'
import { createDb } from '../../../db'
import { users } from '../../../db/schema'
import { updateUserSchema } from '../../../lib/validators'

export const GET: APIRoute = async ({ locals, params }) => {
  const id = Number(params.id)
  if (isNaN(id)) return Response.json({ error: 'ID non valido' }, { status: 400 })

  const db = createDb(locals.runtime.env.DB)
  const [user] = await db.select().from(users).where(eq(users.id, id))

  if (!user) return Response.json({ error: 'Non trovato' }, { status: 404 })
  return Response.json(user)
}

export const PATCH: APIRoute = async ({ locals, params, request }) => {
  const id = Number(params.id)
  if (isNaN(id)) return Response.json({ error: 'ID non valido' }, { status: 400 })

  const body = await request.json()
  const parsed = updateUserSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json(
      { errors: parsed.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const db = createDb(locals.runtime.env.DB)
  const [user] = await db
    .update(users)
    .set(parsed.data)
    .where(eq(users.id, id))
    .returning()

  if (!user) return Response.json({ error: 'Non trovato' }, { status: 404 })
  return Response.json(user)
}

export const DELETE: APIRoute = async ({ locals, params }) => {
  const id = Number(params.id)
  if (isNaN(id)) return Response.json({ error: 'ID non valido' }, { status: 400 })

  const db = createDb(locals.runtime.env.DB)
  const [deleted] = await db.delete(users).where(eq(users.id, id)).returning()

  if (!deleted) return Response.json({ error: 'Non trovato' }, { status: 404 })
  return new Response(null, { status: 204 })
}
