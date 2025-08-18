// Landing page pública
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">ElevaLucro BPO</h1>
      <p className="text-xl text-gray-600 mb-8">
        Sistema de gestão financeira para empresas
      </p>
      <button className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
        Começar agora
      </button>
    </main>
  )
}