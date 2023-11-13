import { KVNamespace } from '@cloudflare/workers-types'

export type Environment = {
  PRICINGS_SERVICE_URL: string
  PRICINGS_KV: KVNamespace
}
