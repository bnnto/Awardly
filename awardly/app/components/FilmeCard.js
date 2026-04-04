'use client';

import { useRouter } from 'next/navigation';

export default function FilmeCard({ filme, categoriaAtual, itemForcado, venceu }) {
  const router = useRouter();

  // itemForcado pode ser: nome do ator, nome da canção, ou nome dos roteiristas
  const nomeItem = Array.isArray(itemForcado)
    ? itemForcado.join(', ')
    : itemForcado;

  return (
    <div
      className={`cardFilme ${venceu ? 'cardFilmeVencedor' : ''}`}
      onClick={() => router.push(`/filmes/${filme.tmdbId}`)}
    >
      <img
        src={filme.poster}
        alt={filme.titulo}
        className="posterFilme"
        loading="lazy"
      />

      {venceu && (
        <div className="wrapperOscar">
          <span className="textoVencedor">VENCEDOR</span>
          <img src="/oscar2.png" alt="Vencedor" className="iconeOscar" />
        </div>
      )}

      <div className="sobreposicaoFilme">
        <p className="tituloFilme">{filme.titulo}</p>
        {nomeItem
          ? <p className="atorIndicado">{nomeItem}</p>
          : <p className="anoFilme">{filme.anoLancamento}</p>
        }
      </div>
    </div>
  );
}