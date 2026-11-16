import { NextResponse, NextRequest } from 'next/server'

const SHOP = 'kongtattoocareglobal.myshopify.com'
const API_VERSION = '2026-10'

function shopifyFetch(endpoint: string, options?: RequestInit) {
  const token = process.env.SHOPIFY_ADMIN_TOKEN
  if (!token) throw new Error('Missing SHOPIFY_ADMIN_TOKEN')
  return fetch(`https://${SHOP}/admin/api/${API_VERSION}${endpoint}`, {
    ...options,
    headers: {
      'X-Shopify-Access-Token': token,
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  })
}

export async function GET() {
  try {
    const resp = await shopifyFetch('/price_rules.json?limit=50')
    if (!resp.ok) {
      const text = await resp.text()
      return NextResponse.json({ error: `Shopify error ${resp.status}`, detail: text }, { status: resp.status })
    }
    const data = await resp.json()
    const rules = data.price_rules || []

    // Fetch discount codes for each rule
    const discounts = await Promise.all(
      rules.map(async (rule: Record<string, unknown>) => {
        const codesResp = await shopifyFetch(`/price_rules/${rule.id}/discount_codes.json?limit=5`)
        const codesData = codesResp.ok ? await codesResp.json() : { discount_codes: [] }
        const codes = codesData.discount_codes || []
        return {
          id: rule.id,
          title: rule.title,
          value: rule.value,
          valueType: rule.value_type,
          usageCount: rule.usage_count,
          usageLimit: rule.usage_limit,
          startsAt: rule.starts_at,
          endsAt: rule.ends_at,
          codes: codes.map((c: Record<string, unknown>) => ({ id: c.id, code: c.code, usageCount: c.usage_count })),
        }
      })
    )
    return NextResponse.json({ discounts })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, code, discountType, value, usageLimit, endsAt } = body

    // Create price rule
    const ruleResp = await shopifyFetch('/price_rules.json', {
      method: 'POST',
      body: JSON.stringify({
        price_rule: {
          title,
          target_type: 'line_item',
          target_selection: 'all',
          allocation_method: 'across',
          value_type: discountType === 'percentage' ? 'percentage' : 'fixed_amount',
          value: discountType === 'percentage' ? `-${Math.abs(value)}` : `-${Math.abs(value)}`,
          customer_selection: 'all',
          usage_limit: usageLimit || null,
          starts_at: new Date().toISOString(),
          ends_at: endsAt || null,
        },
      }),
    })
    if (!ruleResp.ok) {
      const text = await ruleResp.text()
      return NextResponse.json({ error: 'Failed to create price rule', detail: text }, { status: 400 })
    }
    const ruleData = await ruleResp.json()
    const ruleId = ruleData.price_rule.id

    // Create discount code
    const codeResp = await shopifyFetch(`/price_rules/${ruleId}/discount_codes.json`, {
      method: 'POST',
      body: JSON.stringify({ discount_code: { code } }),
    })
    if (!codeResp.ok) {
      const text = await codeResp.text()
      return NextResponse.json({ error: 'Price rule created but code failed', detail: text }, { status: 400 })
    }
    const codeData = await codeResp.json()
    return NextResponse.json({ success: true, rule: ruleData.price_rule, code: codeData.discount_code })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { ruleId } = await req.json()
    const resp = await shopifyFetch(`/price_rules/${ruleId}.json`, { method: 'DELETE' })
    if (!resp.ok) {
      return NextResponse.json({ error: `Failed to delete: ${resp.status}` }, { status: 400 })
    }
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
