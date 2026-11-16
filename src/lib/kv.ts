// Upstash Redis REST client for analytics
const getUrl = () => process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || ''
const getToken = () => process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || ''

export async function kvPipe(cmds: (string | number)[][]): Promise<unknown[]> {
  const url = getUrl()
  const token = getToken()
  if (!url || !token) return cmds.map(() => null)

  const res = await fetch(`${url}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cmds),
  })
  if (!res.ok) return cmds.map(() => null)
  const data: { result: unknown }[] = await res.json()
  return data.map(d => d.result)
}

export async function kvCmd(cmd: (string | number)[]): Promise<unknown> {
  const results = await kvPipe([cmd])
  return results[0]
}
