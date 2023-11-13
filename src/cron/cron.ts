import { ExportedHandlerScheduledHandler } from '@cloudflare/workers-types'
import { Environment } from '../env'
import { getPricings } from '../internal/core'

const cronHandler: ExportedHandlerScheduledHandler<Environment> = async (
  event,
  env,
  ctx
) => {
  switch (event.cron) {
    case '*/9 * * * *':
      await getPricings({
        cache: true,
        host: env.PRICINGS_SERVICE_URL,
        kv: env.PRICINGS_KV,
        refresh: true,
      })
      break
    default:
      break
  }
}
export default cronHandler
