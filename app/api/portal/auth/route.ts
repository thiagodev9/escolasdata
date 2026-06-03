import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const rl = checkRateLimit(`portal-auth:${ip}`, { windowMs: 15 * 60 * 1000, max: 5 })
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Muitas tentativas. Aguarde 15 minutos.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    )
  }

  try {
    const { email } = await request.json()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'E-mail inválido.' }, { status: 400 })
    }

    const emailNorm = email.trim().toLowerCase()
    const admin = createAdminClient()

    const { data: responsavel } = await (admin as any)
      .from('responsaveis')
      .select('id')
      .eq('email', emailNorm)
      .maybeSingle()

    if (responsavel) {
      const origin = request.headers.get('origin') ?? 'http://localhost:3000'
      const { error } = await admin.auth.signInWithOtp({
        email: emailNorm,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${origin}/portal`,
        },
      })
      if (error) throw error
    }

    // Sempre retorna ok — não revela se o e-mail está cadastrado
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
