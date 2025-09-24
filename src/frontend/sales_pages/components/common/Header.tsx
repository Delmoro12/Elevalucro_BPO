"use client";

interface HeaderProps {
  logoAlt?: string;
}

export default function Header({ logoAlt = "ElevaLucro - BPO Financeiro" }: HeaderProps) {
  const navItems = [
    { href: "#como-funciona", label: "Como funciona" },
    { href: "#beneficios", label: "Benefícios" },
    { href: "#seguranca", label: "Segurança" },
    { href: "#interface", label: "Interface" },
    { href: "#resultados", label: "Resultados" },
    { href: "#planos", label: "Planos" },
    { href: "#contato", label: "Contato" }
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-slate-900/50 border-b border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <img 
            src="/images/Logo ElevaLucro.png" 
            alt={logoAlt}
            className="h-10 w-auto"
          />
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300">
          {navItems.map((item) => (
            <a 
              key={item.href}
              href={item.href} 
              className="hover:text-white transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}