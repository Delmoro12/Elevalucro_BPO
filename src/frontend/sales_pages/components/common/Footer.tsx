"use client";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Logo e descrição */}
          <div>
            <img 
              src="/images/Logo ElevaLucro.png" 
              alt="ElevaLucro"
              className="h-8 w-auto mb-4"
            />
            <p className="text-sm text-slate-400">
              BPO Financeiro especializado em elevar os resultados da sua empresa 
              com tecnologia e transparência.
            </p>
          </div>

          {/* Links rápidos */}
          <div>
            <h4 className="font-semibold text-white mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#como-funciona" className="hover:text-white transition-colors">Como funciona</a></li>
              <li><a href="#beneficios" className="hover:text-white transition-colors">Benefícios</a></li>
              <li><a href="#planos" className="hover:text-white transition-colors">Planos</a></li>
              <li><a href="#contato" className="hover:text-white transition-colors">Contato</a></li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-semibold text-white mb-4">Fale Conosco</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>WhatsApp: (35) 99700-6169</li>
              <li>E-mail: comercial@elevalucro.com.br</li>
              <li>Atendimento: Seg-Sex, 9h-18h</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-sm text-slate-400 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {currentYear} ElevaLucro • BPO Financeiro</p>
          <p className="text-slate-500">Gestão financeira que eleva resultados</p>
        </div>
      </div>
    </footer>
  );
}