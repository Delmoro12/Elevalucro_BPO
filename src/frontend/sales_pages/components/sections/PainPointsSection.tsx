"use client";

interface PainPoint {
  text: string;
}

interface PainPointsSectionProps {
  title: string;
  titleHighlight: string;
  description: string;
  painPoints: PainPoint[];
}

export default function PainPointsSection({
  title,
  titleHighlight,
  description,
  painPoints
}: PainPointsSectionProps) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-semibold mb-6">
            {title} <span className="text-emerald-300">{titleHighlight}</span>
          </h2>
          <p className="text-slate-300/90 text-lg mb-8">
            {description}
          </p>
        </div>
        <div className="rounded-2xl border border-red-500/20 p-8 bg-red-500/5">
          <div className="space-y-4">
            {painPoints.map((point, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-red-400 mt-2 flex-shrink-0"></div>
                <p className="text-slate-300/90">{point.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}