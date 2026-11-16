import { NextResponse, NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export async function GET() {
  try {
    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ enquiries: [], note: 'Supabase not configured' })

    const { data, error } = await supabase
      .from('enquiries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      // Table may not exist yet — return empty
      return NextResponse.json({ enquiries: [] })
    }

    return NextResponse.json({ enquiries: data || [] })
  } catch (e) {
    return NextResponse.json({ enquiries: [], error: String(e) })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, read } = await req.json()
    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })

    const { error } = await supabase.from('enquiries').update({ read }).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })

    const { error } = await supabase.from('enquiries').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
