'use client';

import { useState, useEffect } from 'react';
import Parse from '@/lib/parseClient';
import { getFilme, getImageURL } from '@/lib/tmdb';

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
            const tmdbId   = filme.get('tmdbId');
            const detalhes = await getFilme(tmdbId);

            return {
              id:             filme.id,
              tmdbId,
              titulo:         detalhes.title,
              tituloOriginal: detalhes.original_title,
              sinopse:        detalhes.overview,
              poster:         getImageURL(detalhes.poster_path, 'w342'),
              backdrop:       getImageURL(detalhes.backdrop_path, 'w780'),
              anoLancamento:  detalhes.release_date?.split('-')[0],
              nota:           detalhes.vote_average?.toFixed(1),
              duracao:        detalhes.runtime,
              categorias:     filme.get('categorias') || [],
              vencedores: filme.get('vencedores') || [],
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