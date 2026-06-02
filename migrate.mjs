#!/usr/bin/env node
/**
 * EduCare — runner de migrations via Supabase Management API
 * Uso: node migrate.mjs <PAT> [002|003|004|all]
 *
 * PAT = Personal Access Token (supabase.com → Account → Access Tokens)
 */

import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))

const PROJECT_REF = 'cgreissqlrreczxeswol'
const BASE_URL    = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`

const MIGRATIONS = {
  '002': join(__dir, 'supabase/migrations/002_sprint1.sql'),
  '003': join(__dir, 'supabase/migrations/003_sprint2.sql'),
  '004': join(__dir, 'supabase/migrations/004_sprint3.sql'),
}

async function runSql(pat, sql) {
  const res = await fetch(BASE_URL, {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${pat}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({ query: sql }),
  })

  const text = await res.text()
  if (!res.ok) {
    let msg = text
    try { msg = JSON.parse(text)?.message ?? text } catch {}
    throw new Error(`HTTP ${res.status}: ${msg}`)
  }
  return text
}

// Quebra o SQL em statements individuais e roda cada um
async function runMigration(pat, filePath, label) {
  console.log(`\n▶ Rodando migration ${label}...`)
  const sql = readFileSync(filePath, 'utf-8')

  try {
    await runSql(pat, sql)
    console.log('  ✅ Concluído sem erros.')
    return 0
  } catch (e) {
    // Se falhou como bloco único, tenta statement por statement
    console.log(`  ⚠ Bloco único falhou, tentando por statement... (${e.message.slice(0,80)})`)
    return await runByStatement(pat, sql)
  }
}

async function runByStatement(pat, sql) {
  // Divide em blocos lógicos pelo separador de comentário de seção
  // e também por ponto-e-vírgula fora de parênteses e blocos $$
  const stmts = splitSql(sql)

  let ok = 0; let erros = 0
  for (const stmt of stmts) {
    if (!stmt.trim()) continue
    try {
      await runSql(pat, stmt)
      ok++
      process.stdout.write('.')
    } catch (e) {
      const msg = e.message
      if (msg.includes('already exists') || msg.includes('duplicate') || msg.includes('múltiplas')) {
        process.stdout.write('s')
        ok++
      } else if (msg.includes('does not exist') && stmt.trim().toUpperCase().startsWith('DROP')) {
        process.stdout.write('s') // DROP IF EXISTS já tratado
        ok++
      } else {
        process.stdout.write('x')
        console.error(`\n  ⚠ ${msg.slice(0, 150)}`)
        erros++
      }
    }
  }
  console.log(`\n  ✓ ${ok} ok · ${erros} erros`)
  return erros
}

function splitSql(sql) {
  const results = []
  let current   = ''
  let depth     = 0    // profundidade de parênteses
  let inDollar  = false
  let i         = 0

  while (i < sql.length) {
    const ch   = sql[i]
    const next = sql[i + 1] ?? ''

    // Detecta blocos $$ ... $$
    if (ch === '$' && next === '$') {
      inDollar = !inDollar
      current += '$$'
      i += 2
      continue
    }
    if (inDollar) { current += ch; i++; continue }

    // Comentários de linha — pula até fim da linha
    if (ch === '-' && next === '-') {
      while (i < sql.length && sql[i] !== '\n') i++
      continue
    }

    if (ch === '(') depth++
    if (ch === ')') depth--

    if (ch === ';' && depth === 0) {
      const s = current.trim()
      if (s) results.push(s)
      current = ''
      i++
      continue
    }

    current += ch
    i++
  }
  const last = current.trim()
  if (last) results.push(last)
  return results
}

async function main() {
  const [,, pat, target = 'all'] = process.argv

  if (!pat || pat.length < 20) {
    console.error('Uso: node migrate.mjs <PAT> [002|003|004|all]')
    console.error('PAT: supabase.com → Account → Access Tokens → Generate new token')
    process.exit(1)
  }

  const toRun = target === 'all'
    ? Object.entries(MIGRATIONS)
    : [[target, MIGRATIONS[target]]].filter(([,v]) => v)

  if (!toRun.length) {
    console.error(`Migration "${target}" não encontrada. Use: 002, 003, 004 ou all`)
    process.exit(1)
  }

  console.log(`EduCare Migrations — projeto: ${PROJECT_REF}`)
  console.log(`Rodando: ${toRun.map(([k]) => k).join(', ')}`)

  let totalErros = 0
  for (const [label, path] of toRun) {
    totalErros += await runMigration(pat, path, label)
  }

  if (totalErros === 0) {
    console.log('\n✅ Todas as migrations concluídas sem erros!')
  } else {
    console.log(`\n⚠ Concluído com ${totalErros} erro(s). Verifique acima.`)
  }
}

main().catch(e => { console.error(e.message); process.exit(1) })
