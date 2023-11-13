import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'

import type { Environment } from '../env'
import { getFromKV, getPricings } from '../internal/core'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const honoApp = new Hono<{ Bindings: Environment }>()

const getPricingsSchema = zValidator(
  'query',
  z.object({
    refresh: z.string().default('false'),
  })
)

honoApp.get('/pricings', getPricingsSchema, async (c) => {
  const getShorthand = async () =>
    getPricings({
      cache: true,
      host: c.env.PRICINGS_SERVICE_URL,
      kv: c.env.PRICINGS_KV,
      refresh: true,
    })
  try {
    const results = !c.req.query().refresh
      ? await getFromKV(c.env.PRICINGS_KV, 'pricings-autobot')
      : await getShorthand()
    return c.json(results ?? (await getShorthand()))
  } catch (e) {
    console.log(e)
    throw new HTTPException(503, {
      message: 'Service Unavailable',
    })
  }
})

export default honoApp
