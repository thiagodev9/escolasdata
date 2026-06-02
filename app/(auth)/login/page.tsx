import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/login-form'
import { Footprints, Heart, Star } from 'lucide-react'

export default function LoginPage() {
  return (
    <main className="min-h-screen flex overflow-hidden">

      {/* Painel esquerdo — ilustração Little Steps style */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-blue-400 relative flex-col items-center justify-center p-12 overflow-hidden">
        {/* Círculos decorativos */}
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-white/5 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white/5 translate-x-1/4 translate-y-1/4" />
        <div className="absolute top-1/3 right-8 w-32 h-32 rounded-full bg-orange-400/20" />

        {/* Conteúdo */}
        <div className="relative z-10 text-white max-w-sm text-center">
          {/* Pegadas */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-float">
              <Footprints className="w-10 h-10 text-white" />
            </div>
          </div>

          <h2 className="text-4xl font-black leading-tight mb-4">
            Aprendendo,<br />
            Crescendo,<br />
            <span className="text-orange-300">Juntos.</span>
          </h2>
          <p className="text-blue-100 text-base leading-relaxed">
            Um começo alegre para mentes curiosas. Uma base sólida para a vida.
          </p>

          {/* Depoimento */}
          <div className="mt-10 bg-white/15 backdrop-blur-sm rounded-2xl p-5 text-left border border-white/20">
            <div className="flex gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-orange-300 text-orange-300" />
              ))}
            </div>
            <p className="text-sm text-white/90 leading-relaxed">
              &ldquo;O EduCare transformou a comunicação com os pais e simplificou toda a gestão da nossa escola.&rdquo;
            </p>
            <p className="text-xs text-blue-200 mt-2 font-semibold">— Diretora Priya S., Creche Girassol</p>
          </div>
        </div>

        {/* Indicadores rodapé */}
        <div className="absolute bottom-8 flex gap-2">
          <div className="w-8 h-2 rounded-full bg-white" />
          <div className="w-2 h-2 rounded-full bg-white/40" />
          <div className="w-2 h-2 rounded-full bg-white/40" />
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex-1 flex items-center justify-center bg-background p-6 relative">
        {/* Ondas decorativas sutis */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-blue-50 translate-x-1/2 -translate-y-1/2 opacity-60" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-orange-50 -translate-x-1/2 translate-y-1/2 opacity-60" />

        <div className="w-full max-w-md relative z-10">
          <Suspense fallback={
            <div className="bg-white rounded-3xl shadow-modal p-8 h-96 animate-pulse" />
          }>
            <LoginForm />
          </Suspense>
        </div>

        <footer className="absolute bottom-4 text-center w-full text-xs text-slate-400">
          © 2024 EduCare · Portal Pré-Escolar · Todos os direitos reservados
        </footer>
      </div>
    </main>
  )
}
