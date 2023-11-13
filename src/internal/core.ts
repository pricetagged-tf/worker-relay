import { KVKeys } from './types'

export async function getPricings(options: {
  host: string
  kv: KVNamespace
  refresh?: boolean
  cache?: boolean
}): Promise<unknown> {
  const { host, kv, refresh = false, cache = true } = options
  if (!refresh) {
    const cached = await getFromKV(kv, 'pricings-autobot')
    if (cached) {
      return cached
    }
  }
  const res = await fetch(
    host + '/pricings?source=autobot.tf&refresh=' + refresh
  )

  const result = await res.json()
  if (cache) {
    await saveToKV(kv, 'pricings-autobot', result)
  }
  return result
}

export async function saveToKV(kv: KVNamespace, key: KVKeys, data: unknown) {
  return kv.put(key, JSON.stringify(data), {
    // 9 minutes
    expirationTtl: 9 * 60,
  })
}

export async function getFromKV(kv: KVNamespace, key: KVKeys) {
  return kv.get(key, { type: 'json' })
}
