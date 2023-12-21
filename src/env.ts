import { KVNamespace } from '@cloudflare/workers-types'

export type Environment = {
  NODE_ENV: 'production' | 'development'
  PRICINGS_SERVICE_URL: string
  PRICINGS_KV: KVNamespace
}
