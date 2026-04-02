'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getFilme, getFilmeCreditos, getImageURL } from '../../../lib/tmdb';

export default function FilmeUnico({ params }) {
  const { id } = use(params); // ✅ Next.js 15: params é uma Promise
  const router  = useRouter();

  const [filme,         setFilme]         = useState(null);
  const [elenco,        setElenco]        = useState([]);
  const [trailer,       setTrailer]       = useState(null);
  const [classificacao, setClassificacao] = useState(null);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const [detalhes, creditos, videos, releases] = await Promise.all([
          getFilme(id),
          getFilmeCreditos(id),
          fetch(`${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/movie/${id}/videos?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`).then((r) => r.json()),
          fetch(`${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/movie/${id}/release_dates?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`).then((r) => r.json()),
        ]);

        const trailerYT = videos.results?.find(
          (v) => v.type === 'Trailer' && v.site === 'YouTube'
        );

        const brRelease       = releases.results?.find((r) => r.iso_3166_1 === 'BR');
        const classificacaoBR = brRelease?.release_dates?.[0]?.certification;

        setFilme({
          titulo:        detalhes.title,
          tituloOriginal: detalhes.original_title,
          sinopse:       detalhes.overview,
          backdrop:      getImageURL(detalhes.backdrop_path, 'original'),
          poster:        getImageURL(detalhes.poster_path, 'w342'),
          ano:           detalhes.release_date?.split('-')[0],
          duracao:       detalhes.runtime
            ? `${Math.floor(detalhes.runtime / 60)}h ${detalhes.runtime % 60}min`
            : 'N/A',
          nota:    detalhes.vote_average?.toFixed(1),
          generos: detalhes.genres?.map((g) => g.name),
        });

        setElenco(creditos.cast?.slice(0, 10) || []);
        setTrailer(trailerYT?.key || null);
        setClassificacao(classificacaoBR || 'N/A');
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, [id]);

  if (loading) return <p>Carregando...</p>;
  if (!filme)  return <p>Filme não encontrado.</p>;

  return (
    <div className="filme-unico">
      <div
        className="filme-hero"
        style={{ backgroundImage: `url(${filme.backdrop})` }}
      >
        <div className="filme-hero-overlay">
          <img src={filme.poster} alt={filme.titulo} className="filme-poster" />

          <div className="filme-hero-info">
            <h1>{filme.titulo}</h1>
            <p className="titulo-original">{filme.tituloOriginal}</p>

            <p>{filme.ano} • {filme.duracao} • ⭐ {filme.nota} • {classificacao}</p>

            <div className="generos">
              {filme.generos?.map((g) => (
                <span key={g} className="tag">{g}</span>
              ))}
            </div>

            <div className="acoes">
              <button>❤️ Curtir</button>
              <button>📌 Minha Lista</button>
            </div>
          </div>
        </div>
      </div>

      <section className="filme-sinopse">
        <h2>Sinopse</h2>
        <p>{filme.sinopse}</p>
      </section>

      {trailer && (
        <section className="filme-trailer">
          <h2>Trailer</h2>
          <iframe
            width="100%"
            height="400"
            src={`https://www.youtube.com/embed/${trailer}`}
            title="Trailer"
            allowFullScreen
          />
        </section>
      )}

      <section className="filme-elenco">
        <h2>Elenco</h2>
        <div className="elenco-grid">
          {elenco.map((ator) => (
            <div
              key={ator.id}
              className="ator-card"
              onClick={() => router.push(`/atores/${ator.id}`)}
            >
              <img src={getImageURL(ator.profile_path, 'w185')} alt={ator.name} />
              <p className="ator-nome">{ator.name}</p>
              <p className="ator-personagem">{ator.character}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}