import honoApp from './rest/hono'
import { Environment } from './env'
import cronHandler from './cron/cron'
export default {
  fetch: honoApp.fetch,
  scheduled: cronHandler,
} as ExportedHandler<Environment>
