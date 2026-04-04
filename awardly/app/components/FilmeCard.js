'use client';

import { useRouter } from 'next/navigation';

export default function FilmeCard({ filme, categoriaAtual }) {
  const router = useRouter();
  const ator = categoriaAtual && filme.atoresIndicados?.[categoriaAtual];
  const isDirecao = categoriaAtual === 'Melhor Diretor';

  return (
    <div
      className="cardFilme"
      onClick={() => router.push(`/filmes/${filme.tmdbId}`)}
    >
      <img src={filme.poster} alt={filme.titulo} className="posterFilme" loading="lazy" />
      <div className="sobreposicaoFilme">
        <p className="tituloFilme">{filme.titulo}</p>
        {isDirecao
          ? <p className="atorIndicado">{filme.diretor}</p>
          : ator
            ? <p className="atorIndicado">{Array.isArray(ator) ? ator.join(', ') : ator}</p>
            : <p className="anoFilme">{filme.anoLancamento}</p>
        }
      </div>
    </div>
  );
}