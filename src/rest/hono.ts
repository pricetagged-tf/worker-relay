import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { prettyJSON } from 'hono/pretty-json'
import { HTTPException } from 'hono/http-exception'

import type { Environment } from '../env'
import { getFromKV, getPricings, getPricingsGrouped } from '../internal/core'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const honoApp = new Hono<{ Bindings: Environment }>()

honoApp.use('*', async (c, next) => {
  const env = c.env.NODE_ENV ?? 'development'

  const origin = ['https://loadout.tf']
  if (env === 'development') {
    origin.push('http://localhost:6006')
  }
  cors({
    origin,
  })
  await next()
})

const getPricingsSchema = zValidator(
  'query',
  z.object({
    refresh: z.string().default('false'),
  })
)

honoApp.get('/pricings', getPricingsSchema, async (c) => {
  console.debug('pricings')
  const fetchFromSource = async () =>
    getPricings({
      cache: true,
      host: c.env.PRICINGS_SERVICE_URL,
      kv: c.env.PRICINGS_KV,
      refresh: c.req.query().refresh === 'true',
    })
  try {
    const results = !c.req.query().refresh
      ? await getFromKV(c.env.PRICINGS_KV, 'pricings-autobot')
      : await fetchFromSource()
    return c.json(results ?? (await fetchFromSource()))
  } catch (e) {
    console.error(e)
    throw new HTTPException(503, {
      message: 'Service Unavailable',
    })
  }
})

honoApp.get('/pricings/group', getPricingsSchema, async (c) => {
  const fetchFromSource = async () =>
    getPricingsGrouped({
      cache: true,
      host: c.env.PRICINGS_SERVICE_URL,
      kv: c.env.PRICINGS_KV,
      refresh: c.req.query().refresh === 'true',
    })
  try {
    const results = !c.req.query().refresh
      ? await getFromKV(c.env.PRICINGS_KV, 'pricings-autobot-grouped')
      : await fetchFromSource()
    return c.json(results ?? (await fetchFromSource()))
  } catch (e) {
    console.error(e)
    throw new HTTPException(503, {
      message: 'Service Unavailable',
    })
  }
})

export default honoApp
