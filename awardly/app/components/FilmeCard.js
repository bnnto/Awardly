'use client';

import { useRouter } from 'next/navigation';

export default function FilmeCard({ filme }) {
  const router = useRouter();

  return (
    <div
      className="cardFilme"
      onClick={() => router.push(`/filmes/${filme.tmdbId}`)}
    >
      <img src={filme.poster} alt={filme.titulo} className="posterFilme" loading="lazy" />
      <div className="sobreposicaoFilme">
        <p className="tituloFilme">{filme.titulo}</p>
        <p className="anoFilme">{filme.anoLancamento}</p>
      </div>
    </div>
  );
}