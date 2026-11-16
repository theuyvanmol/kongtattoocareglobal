import { NextResponse } from 'next/server'

const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || 'kongtattoocareglobal.myshopify.com'
const SHOPIFY_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN || ''

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    // Create / update Shopify customer with newsletter opt-in
    const res = await fetch(`https://${SHOPIFY_DOMAIN}/admin/api/2026-10/customers.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': SHOPIFY_TOKEN,
      },
      body: JSON.stringify({
        customer: {
          email,
          email_marketing_consent: {
            state: 'subscribed',
            opt_in_level: 'single_opt_in',
          },
          tags: 'newsletter-signup,web-footer',
        },
      }),
    })

    if (res.ok) {
      return NextResponse.json({ ok: true })
    }

    // If customer already exists (422), try to update them
    if (res.status === 422) {
      // Search for existing customer
      const searchRes = await fetch(
        `https://${SHOPIFY_DOMAIN}/admin/api/2026-10/customers/search.json?query=email:${encodeURIComponent(email)}`,
        {
          headers: { 'X-Shopify-Access-Token': SHOPIFY_TOKEN },
        }
      )
      const searchData = await searchRes.json()
      const existing = searchData.customers?.[0]
      if (existing) {
        await fetch(`https://${SHOPIFY_DOMAIN}/admin/api/2026-10/customers/${existing.id}.json`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': SHOPIFY_TOKEN,
          },
          body: JSON.stringify({
            customer: {
              id: existing.id,
              email_marketing_consent: {
                state: 'subscribed',
                opt_in_level: 'single_opt_in',
              },
            },
          }),
        })
        return NextResponse.json({ ok: true })
      }
    }

    return NextResponse.json({ error: 'Subscription failed' }, { status: 500 })
  } catch (err) {
    console.error('Newsletter error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
