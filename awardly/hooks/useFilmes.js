'use client';

import { useState, useEffect } from 'react';
import Parse from '@/lib/parseClient';
import { getFilme, getFilmeCreditos, getImageURL } from '@/lib/tmdb';

export function useFilmes(ano = null) {
  const [filmes,  setFilmes]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro,    setErro]    = useState(null);

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true);
        setErro(null);

        const Filme = Parse.Object.extend('Filme');
        const query = new Parse.Query(Filme);
        if (ano) query.equalTo('ano', ano);
        const filmesDB = await query.find();

        const resultados = await Promise.allSettled(
          filmesDB.map(async (filme) => {
            const tmdbId = filme.get('tmdbId');

            const [detalhes, creditos] = await Promise.all([
              getFilme(tmdbId),
              getFilmeCreditos(tmdbId),
            ]);

            // Filtra todos os diretores, pega apenas os nomes e junta com vírgula
            const diretoresTMDB = creditos.crew
              ?.filter((p) => p.job === 'Director')
              .map((p) => p.name)
              .join(', ') || null;

            return {
              id:              filme.id,
              tmdbId,
              tituloOriginal:  detalhes.original_title,
              sinopse:         detalhes.overview,
              poster:          getImageURL(detalhes.poster_path, 'w342'),
              backdrop:        getImageURL(detalhes.backdrop_path, 'w780'),
              anoLancamento:   detalhes.release_date?.split('-')[0],
              nota:            detalhes.vote_average?.toFixed(1),
              duracao:         detalhes.runtime,
              categorias:      filme.get('categorias')      || [],
              vencedores:      filme.get('vencedores')      || [],
              atoresIndicados: filme.get('atoresIndicados') || {},
              diretor:         diretoresTMDB,
              titulo:          filme.get('titulo')          || detalhes.title,
            };
          })
        );

        const filmesCompletos = resultados
          .filter((r) => r.status === 'fulfilled')
          .map((r) => r.value);

        setFilmes(filmesCompletos);
      } catch (e) {
        setErro(e.message);
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, [ano]);

  return { filmes, loading, erro };
}