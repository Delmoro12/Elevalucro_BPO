import { Button } from '@/src/frontend/components/ui'

// Landing page pública
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">ElevaLucro BPO</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Sistema de gestão financeira para empresas
      </p>
      <Button>Começar agora</Button>
    </main>
  )
}