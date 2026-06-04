import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { emitirNfse, gerarXmlAbrasf } from '@/lib/nfse/client'
import type { NfseConfig } from '@/lib/supabase/types'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const admin = createClient()
    const { data: usuario } = await (admin as any)
      .from('usuarios').select('escola_id, role, nome, escola:escolas(nome)').eq('id', user.id).single() as {
        data: { escola_id: string; role: string; nome: string; escola: { nome: string } | null } | null
      }

    if (!usuario || !['diretora', 'super_admin'].includes(usuario.role)) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const body = await request.json()
    const {
      aluno_id, responsavel_id, responsavel_nome, responsavel_email,
      valor, competencia, descricao,
    } = body

    if (!valor || !competencia) {
      return NextResponse.json({ error: 'valor e competencia são obrigatórios.' }, { status: 400 })
    }

    // Criar registro pendente
    const { data: nfse, error: insertError } = await (admin as any)
      .from('nfse_emitidas')
      .insert({
        escola_id:    usuario.escola_id,
        aluno_id:     aluno_id ?? null,
        responsavel_id: responsavel_id ?? null,
        valor,
        competencia:  `${competencia}-01`,
        descricao:    descricao ?? `Mensalidade ${formatCompetencia(competencia)}`,
        status:       'pendente',
        criado_por:   user.id,
      })
      .select('id')
      .single() as { data: { id: string } | null; error: any }

    if (insertError) throw insertError

    // Buscar configuração NFS-e
    const { data: config } = await (admin as any)
      .from('nfse_config')
      .select('*')
      .eq('escola_id', usuario.escola_id)
      .maybeSingle() as { data: NfseConfig | null }

    // Se não tem config completa, gera apenas XML para emissão manual
    if (!config?.prestador_cnpj || !config?.prestador_im) {
      // Gera XML para download
      const xml = gerarXmlAbrasf({
        cnpjPrestador:        config?.prestador_cnpj ?? '00000000000000',
        imPrestador:          config?.prestador_im   ?? '000000',
        razaoSocialPrestador: usuario.escola?.nome   ?? 'Escola',
        nomeResponsavel:      responsavel_nome       ?? 'Responsável',
        emailResponsavel:     responsavel_email,
        valor,
        issAliquota:          config?.iss_aliquota ?? 5,
        discriminacao:        descricao ?? `Mensalidade ${formatCompetencia(competencia)}`,
        competencia,
        municipioIbge:        config?.municipio_ibge ?? '3550308',
        codigoServico:        config?.codigo_servico ?? '8.01',
        rpsNumero:            Date.now(),
        rpsSerie:             'EduNest',
      })

      await (admin as any).from('nfse_emitidas').update({
        status:   'pendente',
        xml_url:  null,
        erro_msg: 'Config incompleta — use o XML para emissão manual.',
      }).eq('id', nfse!.id)

      return NextResponse.json({
        id:  nfse!.id,
        xml,
        modo: 'manual',
        msg: 'NFS-e preparada. Complete a configuração para emissão automática.',
      })
    }

    // Emissão automática via NFe.io
    if (config.nfeio_api_key) {
      try {
        const payload = {
          prestador: {
            cnpj:               config.prestador_cnpj!,
            inscricaoMunicipal: config.prestador_im!,
            municipio:          config.municipio_ibge!,
          },
          tomador: {
            razaoSocial: responsavel_nome ?? 'Responsável',
            email:       responsavel_email,
          },
          servico: {
            valor,
            iss:          valor * config.iss_aliquota / 100,
            issAliquota:  config.iss_aliquota,
            codigoTributarioMunicipio: config.codigo_servico,
            discriminacao: descricao ?? `Mensalidade ${formatCompetencia(competencia)}`,
            competencia,
          },
        }

        const nfeioCompanyId = process.env.NFEIO_COMPANY_ID
        if (!nfeioCompanyId) throw new Error('NFEIO_COMPANY_ID não configurado')
        const result = await emitirNfse(nfeioCompanyId, payload, config.nfeio_api_key)

        await (admin as any).from('nfse_emitidas').update({
          status:      result.status === 'Issued' ? 'emitida' : 'pendente',
          nfse_numero: result.number ?? null,
          nfse_codigo_verificacao: result.checkCode ?? null,
          xml_url:     result.xmlUrl ?? null,
          pdf_url:     result.pdfUrl ?? null,
        }).eq('id', nfse!.id)

        return NextResponse.json({ id: nfse!.id, numero: result.number, modo: 'automatico' })
      } catch (apiErr: any) {
        await (admin as any).from('nfse_emitidas').update({
          status: 'erro', erro_msg: apiErr.message,
        }).eq('id', nfse!.id)
        return NextResponse.json({ error: apiErr.message }, { status: 502 })
      }
    }

    // Config completa mas sem NFe.io key → gera XML
    const xml = gerarXmlAbrasf({
      cnpjPrestador:        config.prestador_cnpj!,
      imPrestador:          config.prestador_im!,
      razaoSocialPrestador: usuario.escola?.nome ?? 'Escola',
      nomeResponsavel:      responsavel_nome ?? 'Responsável',
      emailResponsavel:     responsavel_email,
      valor,
      issAliquota:          config.iss_aliquota,
      discriminacao:        descricao ?? `Mensalidade ${formatCompetencia(competencia)}`,
      competencia,
      municipioIbge:        config.municipio_ibge ?? '3550308',
      codigoServico:        config.codigo_servico,
      rpsNumero:            Date.now(),
      rpsSerie:             'EduNest',
    })

    return NextResponse.json({ id: nfse!.id, xml, modo: 'manual' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

function formatCompetencia(competencia: string) {
  const [ano, mes] = competencia.split('-')
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return `${meses[parseInt(mes) - 1]}/${ano}`
}
