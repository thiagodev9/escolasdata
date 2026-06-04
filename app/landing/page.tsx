import Link from 'next/link'
import {
  Users, Calendar, CreditCard, MessageSquare, UtensilsCrossed,
  BarChart3, Shield, Smartphone, CheckCircle2, Star, ArrowRight,
  Footprints, Heart, Zap, TrendingUp, Clock, Lock,
} from 'lucide-react'

export const metadata = {
  title: 'EduNest — Sistema de Gestão para Educação Infantil',
  description: 'Gerencie alunos, frequência, mensalidades e comunique-se com os pais. O sistema completo para sua escola infantil.',
}

const BENEFITS = [
  { icon: Zap,         bg: '#eff6ff', color: '#2563eb', title: 'Tudo em um lugar',          desc: 'Alunos, frequência, mensalidades e comunicados. Sem planilha, sem papel, sem grupo de WhatsApp.' },
  { icon: TrendingUp,  bg: '#f0fdf4', color: '#16a34a', title: 'Reduza inadimplência',       desc: 'Acompanhe em tempo real quem pagou e quem está em atraso. Alertas automáticos para os responsáveis.' },
  { icon: Smartphone,  bg: '#fff7ed', color: '#ea580c', title: 'Pais sempre informados',     desc: 'Portal da família com frequência, cardápio e mensalidades. Acesso por link — sem senha para lembrar.' },
  { icon: Clock,       bg: '#fdf4ff', color: '#9333ea', title: 'Economize horas por semana', desc: 'Chamada em 2 minutos, relatórios em um clique e cobranças automáticas todo mês.' },
  { icon: BarChart3,   bg: '#f0f9ff', color: '#0891b2', title: 'Relatórios prontos',         desc: 'Frequência, aniversariantes, financeiro e lista de alunos exportados em PDF a qualquer momento.' },
  { icon: Lock,        bg: '#fff1f2', color: '#e11d48', title: 'Segurança LGPD',             desc: 'Dados criptografados e isolados por escola. Conformidade total com a legislação brasileira.' },
]

const FEATURES = [
  {
    eyebrow: 'Frequência Digital',
    title: 'Chamada em segundos, relatório automático',
    desc: 'Marque a presença de cada aluno com um toque. O sistema calcula o percentual de frequência automaticamente e gera relatórios para pais e secretaria sem nenhum esforço extra.',
    items: ['Chamada rápida por turma', 'Percentual por aluno e turma', 'Relatório mensal em PDF', 'Histórico completo do ano'],
    color: '#0891b2',
    bg: '#f0f9ff',
    mockup: 'frequencia',
  },
  {
    eyebrow: 'Mensalidades',
    title: 'Controle financeiro sem planilha',
    desc: 'Visualize em segundos quem pagou, quem está em aberto e quem está em atraso. Gere cobranças em lote e acompanhe a saúde financeira da escola em tempo real.',
    items: ['Status de pagamento em tempo real', 'Geração em lote', 'Histórico completo por aluno', 'Relatório de inadimplência'],
    color: '#16a34a',
    bg: '#f0fdf4',
    mockup: 'mensalidades',
  },
  {
    eyebrow: 'Portal da Família',
    title: 'Pais conectados sem grupo de WhatsApp',
    desc: 'Cada responsável acessa frequência, cardápio, comunicados e mensalidades pelo celular — com link mágico por e-mail, sem precisar criar senha ou baixar app.',
    items: ['Frequência em tempo real', 'Cardápio semanal', 'Comunicados e avisos', 'Situação financeira'],
    color: '#9333ea',
    bg: '#fdf4ff',
    mockup: 'portal',
  },
]

const PRICING = [
  { faixa: 'Até 30 alunos',  preco: 'R$ 3,92', sub: '/aluno/mês', total: 'R$ 1.411/ano', economia: 'Economize R$ 353', destaque: false, cta: 'Assinar anual' },
  { faixa: '31–80 alunos',   preco: 'R$ 3,12', sub: '/aluno/mês', total: 'R$ 2.995/ano', economia: 'Economize R$ 749', destaque: true,  cta: 'Assinar anual' },
  { faixa: '81–150 alunos',  preco: 'R$ 2,32', sub: '/aluno/mês', total: 'R$ 4.838/ano', economia: 'Economize R$ 1.209', destaque: false, cta: 'Assinar anual' },
  { faixa: '150+ alunos',    preco: 'R$ 1,59', sub: '/aluno/mês', total: 'R$ 5.724/ano', economia: 'Economize R$ 1.431', destaque: false, cta: 'Assinar anual' },
]

const TESTIMONIALS = [
  { nome: 'Silvana Moraes',    cargo: 'Diretora, Escola Base — Americana SP',        texto: 'Antes eu perdia horas com planilha e grupo de WhatsApp. Hoje faço a chamada em 2 minutos e os pais recebem tudo no portal.' },
  { nome: 'Rosangela Pires',   cargo: 'Gestora, Creche Girassol — Campinas SP',      texto: 'O portal dos pais foi um diferencial enorme na captação. As mães adoram acompanhar a frequência do filho sem precisar ligar.' },
  { nome: 'Carla Sampaio',     cargo: 'Diretora, Centro Infantil Arco-Íris — SP',    texto: 'O controle de mensalidades ficou muito mais fácil. Sei exatamente quem pagou e quem está em atraso sem nenhuma planilha.' },
]

const FAQS = [
  { q: 'Preciso instalar algum aplicativo?',     r: 'Não. O EduNest funciona 100% no navegador — celular, tablet ou computador. Nenhuma instalação necessária.' },
  { q: 'Como os pais acessam o portal?',         r: 'Pelo e-mail cadastrado. Eles recebem um link mágico e acessam tudo sem precisar criar senha ou baixar app.' },
  { q: 'Como funciona a cobrança mensal?',       r: 'Por aluno ativo no mês. Escola com 25 alunos paga menos que escola com 80. O valor ajusta automaticamente conforme sua escola cresce.' },
  { q: 'Meus dados ficam seguros?',              r: 'Sim. Dados criptografados, isolados por escola e em conformidade com a LGPD. Sem acesso de terceiros.' },
  { q: 'Tem suporte em caso de dúvida?',         r: 'Suporte por WhatsApp em horário comercial. Equipe brasileira, sem chatbot, sem fila de espera.' },
]

export default function LandingPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --primary: #0891b2;
          --primary-dark: #0e7490;
          --primary-light: #e0f7fa;
          --primary-glow: rgba(8,145,178,0.15);
          --dark: #0f172a;
          --mid: #334155;
          --muted: #64748b;
          --border: #e2e8f0;
          --bg: #ffffff;
          --bg-subtle: #f8fafc;
          --bg-hero: #f0f9ff;
          --radius: 0.875rem;
          --radius-lg: 1.25rem;
        }

        body { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--dark); overflow-x: hidden; }
        a { text-decoration: none; }

        /* ── NAVBAR ── */
        .nav {
          position: sticky; top: 0; z-index: 100;
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(16px) saturate(180%);
          border-bottom: 1px solid var(--border);
        }
        .nav-wrap { max-width: 1160px; margin: 0 auto; padding: 0 1.5rem; height: 4rem; display: flex; align-items: center; justify-content: space-between; }
        .nav-logo { display: flex; align-items: center; gap: 0.625rem; }
        .nav-logo-icon { width: 2rem; height: 2rem; background: linear-gradient(135deg, var(--primary), var(--primary-dark)); border-radius: 0.55rem; display: flex; align-items: center; justify-content: center; }
        .nav-logo-name { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 700; font-size: 1.15rem; color: var(--dark); letter-spacing: -0.03em; }
        .nav-links { display: flex; gap: 0.25rem; }
        .nav-link { padding: 0.4rem 0.875rem; font-size: 0.875rem; font-weight: 500; color: var(--muted); border-radius: 0.5rem; transition: color 0.15s, background 0.15s; }
        .nav-link:hover { color: var(--dark); background: var(--bg-subtle); }
        .nav-right { display: flex; align-items: center; gap: 0.75rem; }
        .nav-login { font-size: 0.875rem; font-weight: 500; color: var(--mid); padding: 0.4rem 0.875rem; border-radius: 0.5rem; transition: color 0.15s; }
        .nav-login:hover { color: var(--primary); }
        .nav-cta { background: var(--primary); color: white; font-size: 0.875rem; font-weight: 600; padding: 0.5rem 1.125rem; border-radius: 100px; transition: background 0.15s, box-shadow 0.15s; box-shadow: 0 2px 8px var(--primary-glow); }
        .nav-cta:hover { background: var(--primary-dark); box-shadow: 0 4px 16px var(--primary-glow); }

        /* ── HERO ── */
        .hero {
          background: radial-gradient(ellipse 80% 60% at 50% -10%, #cffafe 0%, transparent 70%), var(--bg);
          padding: 5.5rem 1.5rem 5rem;
          text-align: center;
        }
        .hero-wrap { max-width: 760px; margin: 0 auto; }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 0.4rem;
          background: var(--primary-light); color: var(--primary-dark);
          font-size: 0.75rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase;
          padding: 0.35rem 0.875rem; border-radius: 100px;
          margin-bottom: 1.75rem;
          animation: fadeUp 0.5s ease both;
        }
        .badge-pulse { width: 6px; height: 6px; background: var(--primary); border-radius: 50%; animation: pulse 2s ease-in-out infinite; }
        .hero-h1 {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: clamp(2.5rem, 5.5vw, 4.25rem);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.04em;
          color: var(--dark);
          margin-bottom: 1.25rem;
          animation: fadeUp 0.5s 0.08s ease both;
        }
        .hero-h1 span {
          background: linear-gradient(135deg, var(--primary) 0%, #0369a1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-sub {
          font-size: 1.1rem; color: var(--muted); line-height: 1.75; max-width: 540px; margin: 0 auto 2.25rem;
          font-weight: 300;
          animation: fadeUp 0.5s 0.16s ease both;
        }
        .hero-actions { display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: center; margin-bottom: 2rem; animation: fadeUp 0.5s 0.24s ease both; }
        .btn-primary { display: inline-flex; align-items: center; gap: 0.4rem; background: var(--primary); color: white; font-weight: 600; font-size: 0.9375rem; padding: 0.8125rem 1.625rem; border-radius: 100px; transition: background 0.15s, box-shadow 0.2s, transform 0.15s; box-shadow: 0 4px 16px var(--primary-glow); }
        .btn-primary:hover { background: var(--primary-dark); box-shadow: 0 8px 24px var(--primary-glow); transform: translateY(-1px); }
        .btn-outline { display: inline-flex; align-items: center; gap: 0.4rem; border: 1.5px solid var(--border); color: var(--mid); font-weight: 500; font-size: 0.9375rem; padding: 0.8125rem 1.5rem; border-radius: 100px; transition: border-color 0.15s, color 0.15s; }
        .btn-outline:hover { border-color: var(--primary); color: var(--primary); }
        .hero-trust { display: flex; flex-wrap: wrap; gap: 1.5rem; justify-content: center; animation: fadeUp 0.5s 0.32s ease both; }
        .hero-trust-item { display: flex; align-items: center; gap: 0.375rem; font-size: 0.8125rem; color: var(--muted); }

        /* ── STATS ── */
        .stats { padding: 3rem 1.5rem; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); background: var(--bg-subtle); }
        .stats-wrap { max-width: 1160px; margin: 0 auto; display: flex; justify-content: center; gap: 5rem; flex-wrap: wrap; }
        .stat { text-align: center; }
        .stat-n { font-family: 'Bricolage Grotesque', sans-serif; font-size: 2.25rem; font-weight: 800; color: var(--dark); line-height: 1; letter-spacing: -0.04em; }
        .stat-n span { color: var(--primary); }
        .stat-label { font-size: 0.8125rem; color: var(--muted); margin-top: 0.25rem; font-weight: 400; }

        /* ── SECTION SHARED ── */
        .section { padding: 5.5rem 1.5rem; }
        .wrap { max-width: 1160px; margin: 0 auto; }
        .section-eyebrow { display: inline-flex; align-items: center; gap: 0.375rem; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--primary); margin-bottom: 0.875rem; }
        .section-title { font-family: 'Bricolage Grotesque', sans-serif; font-size: clamp(1.75rem, 3.5vw, 2.5rem); font-weight: 800; letter-spacing: -0.03em; line-height: 1.2; color: var(--dark); margin-bottom: 0.875rem; }
        .section-sub { font-size: 1rem; color: var(--muted); line-height: 1.75; max-width: 480px; font-weight: 300; }

        /* ── BENEFITS ── */
        .benefits-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; margin-top: 3rem; }
        .benefit-card { background: white; border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1.625rem; transition: box-shadow 0.2s, transform 0.2s; }
        .benefit-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.08); transform: translateY(-2px); }
        .benefit-icon { width: 2.5rem; height: 2.5rem; border-radius: 0.625rem; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; }
        .benefit-title { font-family: 'Bricolage Grotesque', sans-serif; font-size: 0.9375rem; font-weight: 700; color: var(--dark); margin-bottom: 0.375rem; letter-spacing: -0.01em; }
        .benefit-desc { font-size: 0.85rem; color: var(--muted); line-height: 1.7; font-weight: 300; }

        /* ── FEATURE SECTIONS ── */
        .feature-section { padding: 4rem 1.5rem; }
        .feature-section.alt { background: var(--bg-subtle); }
        .feature-grid { max-width: 1160px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; align-items: center; }
        .feature-grid.rev { direction: rtl; }
        .feature-grid.rev > * { direction: ltr; }
        .feature-items { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1.5rem; }
        .feature-item { display: flex; align-items: center; gap: 0.625rem; font-size: 0.875rem; color: var(--mid); font-weight: 400; }
        .feature-check { width: 1.25rem; height: 1.25rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .feature-cta { display: inline-flex; align-items: center; gap: 0.375rem; margin-top: 1.75rem; font-size: 0.875rem; font-weight: 600; transition: gap 0.15s; }
        .feature-cta:hover { gap: 0.625rem; }

        /* ── MOCKUP CONTAINER ── */
        .mockup-shell { background: white; border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
        .mockup-topbar { background: var(--bg-subtle); border-bottom: 1px solid var(--border); padding: 0.625rem 0.875rem; display: flex; align-items: center; gap: 0.375rem; }
        .m-dot { width: 8px; height: 8px; border-radius: 50%; }
        .mockup-body { padding: 1.25rem; }
        .m-row { display: flex; align-items: center; justify-content: space-between; padding: 0.625rem 0; border-bottom: 1px solid #f1f5f9; }
        .m-row:last-child { border: none; }
        .m-name { font-size: 0.8125rem; font-weight: 500; color: var(--dark); }
        .m-sub { font-size: 0.7rem; color: var(--muted); }
        .m-tag { font-size: 0.7rem; font-weight: 600; padding: 0.2rem 0.5rem; border-radius: 100px; }
        .m-pct { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 700; font-size: 0.875rem; color: var(--primary); }
        .m-stat-row { display: grid; grid-template-columns: repeat(3,1fr); gap: 0.625rem; margin-bottom: 1rem; }
        .m-stat { background: var(--bg-subtle); border-radius: 0.625rem; padding: 0.75rem; text-align: center; }
        .m-stat-v { font-family: 'Bricolage Grotesque', sans-serif; font-size: 1.25rem; font-weight: 800; letter-spacing: -0.03em; }
        .m-stat-l { font-size: 0.65rem; color: var(--muted); margin-top: 2px; }
        .m-bar-wrap { margin-top: 0.625rem; }
        .m-bar-label { display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--muted); margin-bottom: 0.35rem; }
        .m-bar-track { background: #f1f5f9; border-radius: 100px; height: 6px; }
        .m-bar-fill { height: 6px; border-radius: 100px; }

        /* ── PHONE MOCKUP ── */
        .phone-frame { width: 240px; background: linear-gradient(145deg, #1e293b, #0f172a); border-radius: 2.25rem; padding: 0.6rem; box-shadow: 0 24px 60px rgba(0,0,0,0.25); margin: 0 auto; }
        .phone-screen { background: var(--bg-subtle); border-radius: 1.75rem; overflow: hidden; }
        .phone-sb { background: white; padding: 0.6rem 1rem 0.35rem; display: flex; justify-content: space-between; font-size: 0.6rem; color: #94a3b8; }
        .phone-hdr { background: white; padding: 0.25rem 1rem 0.75rem; }
        .phone-hdr-hello { font-size: 0.65rem; color: #94a3b8; }
        .phone-hdr-name { font-family: 'Bricolage Grotesque', sans-serif; font-size: 1rem; font-weight: 700; color: var(--dark); }
        .phone-content { padding: 0.625rem; display: flex; flex-direction: column; gap: 0.5rem; }
        .phone-card { background: white; border-radius: 0.75rem; padding: 0.75rem; border: 1px solid #f1f5f9; }
        .phone-card-row { display: flex; align-items: center; justify-content: space-between; }
        .phone-card-name { font-weight: 600; font-size: 0.75rem; color: var(--dark); }
        .phone-card-sub { font-size: 0.6rem; color: #94a3b8; margin-top: 1px; }
        .phone-pill { font-size: 0.58rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 100px; }
        .phone-warn { background: #fffbeb; border: 1px solid #fde68a; border-radius: 0.75rem; padding: 0.625rem; }
        .phone-warn-t { font-size: 0.7rem; font-weight: 600; color: #92400e; }
        .phone-warn-s { font-size: 0.6rem; color: #b45309; margin-top: 1px; }
        .phone-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
        .phone-mini { border-radius: 0.75rem; padding: 0.625rem; text-align: center; }
        .phone-mini-label { font-size: 0.58rem; font-weight: 600; }
        .phone-mini-val { font-family: 'Bricolage Grotesque', sans-serif; font-size: 1.1rem; font-weight: 800; margin-top: 2px; }
        .phone-nb { background: white; border-top: 1px solid #f1f5f9; padding: 0.5rem; display: flex; justify-content: space-around; }
        .phone-nb-item { font-size: 0.52rem; color: #94a3b8; font-weight: 500; text-align: center; }

        /* ── PRICING ── */
        .pricing-bg { background: var(--bg-subtle); }
        .pricing-head { text-align: center; margin-bottom: 3rem; }
        .pricing-head .section-sub { margin: 0 auto; }
        .pricing-annual-badge { display: inline-flex; align-items: center; gap: 0.375rem; background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; font-size: 0.75rem; font-weight: 600; padding: 0.35rem 0.875rem; border-radius: 100px; margin-bottom: 1.5rem; }
        .pricing-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 1rem; }
        .price-card { background: white; border: 1.5px solid var(--border); border-radius: var(--radius-lg); padding: 1.75rem; position: relative; transition: box-shadow 0.2s; }
        .price-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
        .price-economia { display: inline-block; background: #f0fdf4; color: #15803d; font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 100px; margin-bottom: 1rem; }
        .price-card.featured { border-color: var(--primary); box-shadow: 0 0 0 4px var(--primary-glow); }
        .price-badge { position: absolute; top: -0.8rem; left: 50%; transform: translateX(-50%); background: var(--primary); color: white; font-size: 0.7rem; font-weight: 700; padding: 0.25rem 0.875rem; border-radius: 100px; white-space: nowrap; }
        .price-faixa { font-size: 0.8125rem; color: var(--muted); margin-bottom: 1.25rem; font-weight: 400; }
        .price-val { font-family: 'Bricolage Grotesque', sans-serif; font-size: 2.75rem; font-weight: 800; color: var(--dark); letter-spacing: -0.04em; line-height: 1; }
        .price-unit { font-size: 0.75rem; color: var(--muted); margin-top: 0.25rem; }
        .price-total { font-size: 0.75rem; color: #94a3b8; margin-top: 0.2rem; }
        .price-btn { display: block; text-align: center; margin-top: 1.5rem; padding: 0.6875rem; border-radius: 100px; font-size: 0.875rem; font-weight: 600; transition: background 0.15s, color 0.15s, box-shadow 0.15s; border: 1.5px solid var(--border); color: var(--mid); }
        .price-btn:hover { border-color: var(--primary); color: var(--primary); }
        .price-card.featured .price-btn { background: var(--primary); color: white; border-color: var(--primary); box-shadow: 0 4px 12px var(--primary-glow); }
        .price-card.featured .price-btn:hover { background: var(--primary-dark); }
        .pricing-all { background: white; border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1.75rem; margin-top: 1.25rem; }
        .pricing-all-title { font-size: 0.8125rem; font-weight: 600; color: var(--mid); margin-bottom: 1.125rem; text-align: center; text-transform: uppercase; letter-spacing: 0.06em; }
        .pricing-all-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.625rem; }
        .pricing-all-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; color: var(--muted); font-weight: 300; }

        /* ── TESTIMONIALS ── */
        .testi-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.5rem; margin-top: 3rem; }
        .testi-card { background: white; border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1.75rem; }
        .testi-stars { display: flex; gap: 2px; margin-bottom: 1rem; }
        .testi-text { font-size: 0.9rem; color: var(--mid); line-height: 1.75; margin-bottom: 1.5rem; font-style: italic; font-weight: 300; }
        .testi-author { display: flex; align-items: center; gap: 0.75rem; }
        .testi-avatar { width: 2.25rem; height: 2.25rem; border-radius: 50%; background: linear-gradient(135deg, var(--primary), #0369a1); display: flex; align-items: center; justify-content: center; font-family: 'Bricolage Grotesque', sans-serif; font-weight: 700; font-size: 0.875rem; color: white; flex-shrink: 0; }
        .testi-name { font-weight: 600; font-size: 0.875rem; color: var(--dark); }
        .testi-role { font-size: 0.75rem; color: var(--muted); font-weight: 300; }

        /* ── FAQ ── */
        .faq-wrap { max-width: 680px; margin: 3rem auto 0; display: flex; flex-direction: column; gap: 0.75rem; }
        .faq-item { border: 1px solid var(--border); border-radius: var(--radius); padding: 1.375rem 1.5rem; transition: border-color 0.15s; }
        .faq-item:hover { border-color: var(--primary); }
        .faq-q { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 700; font-size: 0.9375rem; color: var(--dark); margin-bottom: 0.5rem; letter-spacing: -0.01em; }
        .faq-a { font-size: 0.875rem; color: var(--muted); line-height: 1.7; font-weight: 300; }

        /* ── CTA FINAL ── */
        .cta-section { background: linear-gradient(135deg, #0891b2 0%, #0369a1 100%); padding: 5.5rem 1.5rem; text-align: center; position: relative; overflow: hidden; }
        .cta-glow { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 600px; height: 400px; background: radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%); pointer-events: none; }
        .cta-wrap { max-width: 600px; margin: 0 auto; position: relative; z-index: 1; }
        .cta-h2 { font-family: 'Bricolage Grotesque', sans-serif; font-size: clamp(2rem, 4vw, 3rem); font-weight: 800; color: white; letter-spacing: -0.04em; line-height: 1.15; margin-bottom: 1rem; }
        .cta-sub { font-size: 1rem; color: rgba(255,255,255,0.75); line-height: 1.7; margin-bottom: 2.25rem; font-weight: 300; }
        .btn-white { display: inline-flex; align-items: center; gap: 0.4rem; background: white; color: var(--primary-dark); font-weight: 700; font-size: 0.9375rem; padding: 0.8125rem 1.75rem; border-radius: 100px; transition: box-shadow 0.2s, transform 0.15s; box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
        .btn-white:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.2); transform: translateY(-1px); }
        .btn-ghost-white { display: inline-flex; align-items: center; gap: 0.4rem; border: 1.5px solid rgba(255,255,255,0.4); color: rgba(255,255,255,0.85); font-weight: 500; font-size: 0.9375rem; padding: 0.8125rem 1.5rem; border-radius: 100px; transition: border-color 0.15s, color 0.15s; }
        .btn-ghost-white:hover { border-color: white; color: white; }
        .cta-note { font-size: 0.8rem; color: rgba(255,255,255,0.5); margin-top: 1.25rem; }

        /* ── FOOTER ── */
        .footer { background: var(--dark); padding: 3rem 1.5rem 2rem; }
        .footer-wrap { max-width: 1160px; margin: 0 auto; }
        .footer-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 3rem; margin-bottom: 3rem; flex-wrap: wrap; }
        .footer-brand p { font-size: 0.8125rem; color: #64748b; max-width: 240px; line-height: 1.65; margin-top: 0.75rem; font-weight: 300; }
        .footer-cols { display: flex; gap: 4rem; flex-wrap: wrap; }
        .footer-col-title { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; margin-bottom: 1rem; }
        .footer-col-links { display: flex; flex-direction: column; gap: 0.625rem; }
        .footer-col-link { font-size: 0.8125rem; color: #64748b; transition: color 0.15s; }
        .footer-col-link:hover { color: white; }
        .footer-bottom { border-top: 1px solid #1e293b; padding-top: 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
        .footer-copy { font-size: 0.78rem; color: #475569; }

        /* ── ANIMATIONS ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.8); }
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 960px) {
          .nav-links { display: none; }
          .benefits-grid { grid-template-columns: repeat(2, 1fr); }
          .feature-grid { grid-template-columns: 1fr; gap: 2.5rem; }
          .feature-grid.rev { direction: ltr; }
          .pricing-grid { grid-template-columns: repeat(2, 1fr); }
          .testi-grid { grid-template-columns: 1fr; }
          .footer-top { flex-direction: column; }
        }
        @media (max-width: 600px) {
          .benefits-grid { grid-template-columns: 1fr; }
          .pricing-grid { grid-template-columns: 1fr; }
          .stats-wrap { gap: 2.5rem; }
          .pricing-all-grid { grid-template-columns: repeat(2,1fr); }
        }
      `}} />

      {/* ── NAVBAR ── */}
      <header className="nav">
        <div className="nav-wrap">
          <Link href="/" className="nav-logo">
            <div className="nav-logo-icon"><Footprints size={16} color="white" /></div>
            <span className="nav-logo-name">EduNest</span>
          </Link>
          <nav className="nav-links">
            <a href="#funcionalidades" className="nav-link">Funcionalidades</a>
            <a href="#portal"          className="nav-link">Portal dos Pais</a>
            <a href="#precos"          className="nav-link">Preços</a>
            <a href="#faq"             className="nav-link">Dúvidas</a>
          </nav>
          <div className="nav-right">
            <Link href="/login" className="nav-login">Entrar</Link>
            <Link href="/login" className="nav-cta">Criar conta</Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-wrap">
          <div className="hero-badge">
            <span className="badge-pulse" />
            Sistema completo para educação infantil
          </div>
          <h1 className="hero-h1">
            Gerencie sua escola infantil<br />
            com <span>profissionalismo</span>
          </h1>
          <p className="hero-sub">
            Alunos, frequência, mensalidades e portal dos pais — tudo em um sistema criado especialmente para diretoras de escolas infantis brasileiras.
          </p>
          <div className="hero-actions">
            <Link href="/login" className="btn-primary">
              Começar agora <ArrowRight size={16} />
            </Link>
            <a href="#funcionalidades" className="btn-outline">
              Ver funcionalidades
            </a>
          </div>
          <div className="hero-trust">
            {['Sem contrato de fidelidade', 'Cancele quando quiser', 'Suporte em português'].map(t => (
              <span key={t} className="hero-trust-item">
                <CheckCircle2 size={14} style={{ color: '#16a34a' }} /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <div className="stats">
        <div className="stats-wrap">
          {[
            { n: '500', suf: '+', label: 'escolas cadastradas' },
            { n: '12',  suf: 'mil', label: 'alunos gerenciados' },
            { n: '98',  suf: '%', label: 'satisfação das diretoras' },
            { n: '5',   suf: 'min', label: 'para aprender o sistema' },
          ].map(s => (
            <div key={s.label} className="stat">
              <div className="stat-n">{s.n}<span>{s.suf}</span></div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── BENEFÍCIOS ── */}
      <section id="funcionalidades" className="section" style={{ background: 'white' }}>
        <div className="wrap">
          <div style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 0' }}>
            <div className="section-eyebrow">Por que o EduNest</div>
            <h2 className="section-title" style={{ margin: '0 auto 0.875rem' }}>
              Tudo que sua escola precisa,<br />nada que não precisa
            </h2>
            <p className="section-sub" style={{ maxWidth: '100%' }}>
              Substituímos planilha, caderno de chamada, grupo de WhatsApp e boleto manual — em um sistema que qualquer pessoa aprende em minutos.
            </p>
          </div>
          <div className="benefits-grid">
            {BENEFITS.map(b => (
              <div key={b.title} className="benefit-card">
                <div className="benefit-icon" style={{ background: b.bg }}>
                  <b.icon size={18} style={{ color: b.color }} />
                </div>
                <div className="benefit-title">{b.title}</div>
                <div className="benefit-desc">{b.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURE SECTIONS ── */}
      {FEATURES.map((f, i) => (
        <section key={f.eyebrow} className={`feature-section${i % 2 !== 0 ? ' alt' : ''}`}>
          <div className={`feature-grid${i % 2 !== 0 ? ' rev' : ''}`}>
            {/* Text */}
            <div>
              <div className="section-eyebrow" style={{ color: f.color }}>{f.eyebrow}</div>
              <h2 className="section-title">{f.title}</h2>
              <p className="section-sub">{f.desc}</p>
              <div className="feature-items">
                {f.items.map(item => (
                  <div key={item} className="feature-item">
                    <div className="feature-check" style={{ background: f.bg }}>
                      <CheckCircle2 size={14} style={{ color: f.color }} />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
              <Link href="/login" className="feature-cta" style={{ color: f.color }}>
                Começar agora <ArrowRight size={15} />
              </Link>
            </div>

            {/* Mockup */}
            <div>
              {f.mockup === 'frequencia' && (
                <div className="mockup-shell">
                  <div className="mockup-topbar">
                    <div className="m-dot" style={{ background: '#f87171' }} />
                    <div className="m-dot" style={{ background: '#fbbf24' }} />
                    <div className="m-dot" style={{ background: '#34d399' }} />
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginLeft: '0.5rem' }}>Frequência — Jardim I</span>
                  </div>
                  <div className="mockup-body">
                    <div className="m-stat-row">
                      {[{ v: '23', l: 'Presentes', c: '#16a34a' }, { v: '3', l: 'Ausentes', c: '#dc2626' }, { v: '92%', l: 'Média do mês', c: '#0891b2' }].map(s => (
                        <div key={s.l} className="m-stat">
                          <div className="m-stat-v" style={{ color: s.c }}>{s.v}</div>
                          <div className="m-stat-l">{s.l}</div>
                        </div>
                      ))}
                    </div>
                    {[
                      { n: 'Alice Teixeira',  t: '7B', s: 'Presente', bg: '#dcfce7', tc: '#15803d', pct: 96 },
                      { n: 'Bruno Almeida',   t: '7B', s: 'Presente', bg: '#dcfce7', tc: '#15803d', pct: 88 },
                      { n: 'Camila Rocha',    t: '7B', s: 'Ausente',  bg: '#fee2e2', tc: '#dc2626', pct: 72 },
                      { n: 'Daniel Souza',    t: '7B', s: 'Presente', bg: '#dcfce7', tc: '#15803d', pct: 100 },
                    ].map(row => (
                      <div key={row.n} className="m-row">
                        <div>
                          <div className="m-name">{row.n}</div>
                          <div className="m-sub">Turma {row.t}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span className="m-tag" style={{ background: row.bg, color: row.tc }}>{row.s}</span>
                          <span className="m-pct">{row.pct}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {f.mockup === 'mensalidades' && (
                <div className="mockup-shell">
                  <div className="mockup-topbar">
                    <div className="m-dot" style={{ background: '#f87171' }} />
                    <div className="m-dot" style={{ background: '#fbbf24' }} />
                    <div className="m-dot" style={{ background: '#34d399' }} />
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginLeft: '0.5rem' }}>Mensalidades — Junho 2026</span>
                  </div>
                  <div className="mockup-body">
                    <div className="m-stat-row">
                      {[{ v: '81', l: 'Pagas', c: '#16a34a' }, { v: '4', l: 'Em aberto', c: '#d97706' }, { v: '2', l: 'Atrasadas', c: '#dc2626' }].map(s => (
                        <div key={s.l} className="m-stat">
                          <div className="m-stat-v" style={{ color: s.c }}>{s.v}</div>
                          <div className="m-stat-l">{s.l}</div>
                        </div>
                      ))}
                    </div>
                    {[
                      { n: 'Alice Teixeira',  v: 'R$ 850',  s: 'Pago',      bg: '#dcfce7', tc: '#15803d' },
                      { n: 'Bruno Almeida',   v: 'R$ 850',  s: 'Pago',      bg: '#dcfce7', tc: '#15803d' },
                      { n: 'Camila Rocha',    v: 'R$ 850',  s: 'Atrasado',  bg: '#fee2e2', tc: '#dc2626' },
                      { n: 'Daniel Souza',    v: 'R$ 1.200',s: 'Em aberto', bg: '#fef3c7', tc: '#92400e' },
                    ].map(row => (
                      <div key={row.n} className="m-row">
                        <div>
                          <div className="m-name">{row.n}</div>
                          <div className="m-sub">{row.v}</div>
                        </div>
                        <span className="m-tag" style={{ background: row.bg, color: row.tc }}>{row.s}</span>
                      </div>
                    ))}
                    <div className="m-bar-wrap">
                      <div className="m-bar-label"><span>Recebido no mês</span><span style={{ color: '#16a34a', fontWeight: 600 }}>94%</span></div>
                      <div className="m-bar-track"><div className="m-bar-fill" style={{ width: '94%', background: 'linear-gradient(to right, #16a34a, #4ade80)' }} /></div>
                    </div>
                  </div>
                </div>
              )}

              {f.mockup === 'portal' && (
                <div className="phone-frame" id="portal">
                  <div className="phone-screen">
                    <div className="phone-sb"><span>9:41</span><span>●●●</span></div>
                    <div className="phone-hdr">
                      <div className="phone-hdr-hello">Olá,</div>
                      <div className="phone-hdr-name">Fernanda 👋</div>
                    </div>
                    <div className="phone-content">
                      <div className="phone-card">
                        <div className="phone-card-row">
                          <div>
                            <div className="phone-card-name">Alice Teixeira</div>
                            <div className="phone-card-sub">Jardim I · Turma A</div>
                          </div>
                          <span className="phone-pill" style={{ background: '#dcfce7', color: '#15803d' }}>Presente</span>
                        </div>
                      </div>
                      <div className="phone-warn">
                        <div className="phone-warn-t">Mensalidade em aberto</div>
                        <div className="phone-warn-s">Junho · vence em 5 dias</div>
                      </div>
                      <div className="phone-2col">
                        <div className="phone-mini" style={{ background: '#e0f7fa' }}>
                          <div className="phone-mini-label" style={{ color: '#0891b2' }}>Frequência</div>
                          <div className="phone-mini-val" style={{ color: '#0891b2' }}>94%</div>
                        </div>
                        <div className="phone-mini" style={{ background: '#fff7ed' }}>
                          <div className="phone-mini-label" style={{ color: '#ea580c' }}>Cardápio</div>
                          <div style={{ fontSize: '0.58rem', color: '#ea580c', marginTop: 4, lineHeight: 1.4 }}>Arroz, feijão<br />frango grelhado</div>
                        </div>
                      </div>
                    </div>
                    <div className="phone-nb">
                      {['Início', 'Frequência', 'Finanças', 'Avisos'].map(n => (
                        <div key={n} className="phone-nb-item">{n}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      ))}

      {/* ── PREÇOS ── */}
      <section id="precos" className="section pricing-bg">
        <div className="wrap">
          <div className="pricing-head">
            <div className="section-eyebrow" style={{ justifyContent: 'center' }}>Preços</div>
            <h2 className="section-title" style={{ textAlign: 'center' }}>Planos anuais</h2>
            <p className="section-sub">Cobrança por aluno ativo, cobrado anualmente. Economize até 20% em relação ao mensal.</p>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.25rem' }}>
              <span className="pricing-annual-badge">
                <CheckCircle2 size={13} /> Pagamento anual — melhor custo-benefício
              </span>
            </div>
          </div>
          <div className="pricing-grid">
            {PRICING.map(p => (
              <div key={p.faixa} className={`price-card${p.destaque ? ' featured' : ''}`}>
                {p.destaque && <span className="price-badge">Mais popular</span>}
                <div className="price-faixa">{p.faixa}</div>
                <span className="price-economia">{p.economia}</span>
                <div className="price-val">{p.preco}</div>
                <div className="price-unit">{p.sub} · cobrado anualmente</div>
                <div className="price-total">{p.total} no plano anual</div>
                <Link href="/login" className="price-btn">{p.cta}</Link>
              </div>
            ))}
          </div>
          <div className="pricing-all">
            <div className="pricing-all-title">Incluído em todos os planos</div>
            <div className="pricing-all-grid">
              {['Portal dos pais','Frequência digital','Cardápio semanal','Comunicados','Relatórios PDF','Suporte WhatsApp','Atualizações grátis','Segurança LGPD','Sem contrato'].map(item => (
                <div key={item} className="pricing-all-item">
                  <CheckCircle2 size={14} style={{ color: '#16a34a', flexShrink: 0 }} /> {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── DEPOIMENTOS ── */}
      <section className="section" style={{ background: 'white' }}>
        <div className="wrap">
          <div style={{ textAlign: 'center', maxWidth: 520, margin: '0 auto' }}>
            <div className="section-eyebrow" style={{ justifyContent: 'center' }}>Depoimentos</div>
            <h2 className="section-title">Diretoras que transformaram suas escolas</h2>
          </div>
          <div className="testi-grid">
            {TESTIMONIALS.map(t => (
              <div key={t.nome} className="testi-card">
                <div className="testi-stars">
                  {[...Array(5)].map((_, i) => <Star key={i} size={13} style={{ fill: '#f59e0b', color: '#f59e0b' }} />)}
                </div>
                <p className="testi-text">"{t.texto}"</p>
                <div className="testi-author">
                  <div className="testi-avatar">{t.nome[0]}</div>
                  <div>
                    <div className="testi-name">{t.nome}</div>
                    <div className="testi-role">{t.cargo}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="section" style={{ background: 'var(--bg-subtle)' }}>
        <div className="wrap">
          <div style={{ textAlign: 'center' }}>
            <div className="section-eyebrow" style={{ justifyContent: 'center' }}>Dúvidas frequentes</div>
            <h2 className="section-title">Perguntas e respostas</h2>
          </div>
          <div className="faq-wrap">
            {FAQS.map(f => (
              <div key={f.q} className="faq-item">
                <div className="faq-q">{f.q}</div>
                <div className="faq-a">{f.r}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="cta-section">
        <div className="cta-glow" />
        <div className="cta-wrap">
          <h2 className="cta-h2">Sua escola merece um sistema à altura</h2>
          <p className="cta-sub">
            Comece hoje mesmo. Sem burocracia, sem contrato de fidelidade. Cancele quando quiser.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
            <Link href="/login" className="btn-white">
              Criar conta <ArrowRight size={16} />
            </Link>
            <a href="https://wa.me/5519999999999" target="_blank" rel="noopener noreferrer" className="btn-ghost-white">
              Falar com suporte
            </a>
          </div>
          <p className="cta-note">A partir de R$ 1,59/aluno/mês · Plano anual · Economize até 20%</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-wrap">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="nav-logo" style={{ marginBottom: '0.5rem' }}>
                <div className="nav-logo-icon"><Footprints size={16} color="white" /></div>
                <span className="nav-logo-name" style={{ color: 'white' }}>EduNest</span>
              </div>
              <p>Sistema de gestão para educação infantil. Feito para diretoras brasileiras.</p>
            </div>
            <div className="footer-cols">
              <div>
                <div className="footer-col-title">Produto</div>
                <div className="footer-col-links">
                  <a href="#funcionalidades" className="footer-col-link">Funcionalidades</a>
                  <a href="#precos"          className="footer-col-link">Preços</a>
                  <a href="#faq"             className="footer-col-link">Dúvidas</a>
                </div>
              </div>
              <div>
                <div className="footer-col-title">Conta</div>
                <div className="footer-col-links">
                  <Link href="/login"  className="footer-col-link">Entrar</Link>
                  <Link href="/login"  className="footer-col-link">Criar conta</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span className="footer-copy">© {new Date().getFullYear()} EduNest. Todos os direitos reservados.</span>
            <span className="footer-copy" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              Feito com <Heart size={12} style={{ color: '#e11d48' }} /> para educação infantil
            </span>
          </div>
        </div>
      </footer>
    </>
  )
}
