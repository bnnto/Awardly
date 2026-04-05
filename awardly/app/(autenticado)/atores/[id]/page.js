'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Parse from '@/lib/parseClient';
import { getPessoa, getPessoaCreditos, getImageURL } from '@/lib/tmdb';
import '@/styles/ator.css';

async function buscarFilmesOscarDoAtor(tmdbIdAtor) {
  const Filme = Parse.Object.extend('Filme');
  const query = new Parse.Query(Filme);
  query.limit(1000);
  const todos = await query.find();

  const filmesDoAtor = [];

  await Promise.allSettled(
    todos.map(async (f) => {
      const tmdbId = f.get('tmdbId');
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/movie/${tmdbId}/credits?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
        );
        const data = await res.json();
        const participou = data.cast?.some((c) => c.id === Number(tmdbIdAtor))
          || data.crew?.some((c) => c.id === Number(tmdbIdAtor));

        if (participou) {
          const personagem = data.cast?.find((c) => c.id === Number(tmdbIdAtor))?.character || null;
          const job = data.crew?.find((c) => c.id === Number(tmdbIdAtor))?.job || null;

          filmesDoAtor.push({
            tmdbId,
            titulo: f.get('titulo'),
            categorias: f.get('categorias') || [],
            vencedores: f.get('vencedores') || [],
            atoresIndicados: f.get('atoresIndicados') || {},
            ano: f.get('ano'),
            personagem,
            job,
          });
        }
      } catch {}
    })
  );

  return filmesDoAtor;
}

function calcularIdade(nascimento, falecimento) {
  if (!nascimento) return null;
  const fim = falecimento ? new Date(falecimento) : new Date();
  const nasc = new Date(nascimento);
  let idade = fim.getFullYear() - nasc.getFullYear();
  const m = fim.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && fim.getDate() < nasc.getDate())) idade--;
  return idade;
}

function formatarData(data) {
  if (!data) return null;
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

export default function AtorUnico({ params }) {
  const { id } = use(params);
  const router = useRouter();

  const [ator, setAtor] = useState(null);
  const [filmesOscar, setFilmesOscar] = useState([]);
  const [indicacoes, setIndicacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bioExpandida, setBioExpandida] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    async function carregar() {
      try {
        const [pessoa, filmes, creditos] = await Promise.all([
            getPessoa(id),
            buscarFilmesOscarDoAtor(id),
            getPessoaCreditos(id),
        ]);

        setAtor({
          nome: pessoa.name,
          foto: getImageURL(pessoa.profile_path, 'w342'),
          biografia: pessoa.biography,
          genero: pessoa.gender === 1 ? 'Feminino' : pessoa.gender === 2 ? 'Masculino' : 'Não informado',
          nascimento: pessoa.birthday,
          falecimento: pessoa.deathday,
          localNascimento: pessoa.place_of_birth,
          tambemConhecidoPor: pessoa.also_known_as || [],
          creditadoEm: pessoa.known_for_department === 'Acting' ? 'Atuação'
          : pessoa.known_for_department === 'Directing' ? 'Direção'
          : pessoa.known_for_department === 'Writing' ? 'Roteiro'
          : pessoa.known_for_department === 'Production' ? 'Produção'
          : pessoa.known_for_department || null,
          totalCreditos: (creditos.cast?.length || 0) + (creditos.crew?.length || 0),
        });

        const inds = [];
        filmes.forEach((filme) => {
          Object.entries(filme.atoresIndicados).forEach(([cat, atores]) => {
            const lista = Array.isArray(atores) ? atores : [atores];
            lista.forEach((nomeAtor) => {
              if (
                typeof nomeAtor === 'string' &&
                nomeAtor.toLowerCase().includes(pessoa.name.toLowerCase().split(' ')[0])
              ) {
                const venceu = filme.vencedores?.some(
                  (v) => v === cat || v === `${cat}::${nomeAtor}`
                );
                inds.push({
                  categoria: cat,
                  filme: filme.titulo,
                  tmdbId: filme.tmdbId,
                  ano: filme.ano,
                  venceu,
                });
              }
            });
          });
        });

        setIndicacoes(inds);
        setFilmesOscar(filmes);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, [id]);

  if (loading) return (
    <div className="ator-unico">
      <div className="ator-loading" />
    </div>
  );

  if (!ator) return <p>Ator não encontrado.</p>;

  const idade = calcularIdade(ator.nascimento, ator.falecimento);
  const BIO_LIMITE = 400;
  const bioLonga = ator.biografia?.length > BIO_LIMITE;

  return (
    <div className="ator-unico">
      <div className="ator-hero">
        <div className="ator-hero-conteudo">
          <img src={ator.foto} alt={ator.nome} className="ator-foto" />
          <div className="ator-info">
            <h1>{ator.nome}</h1>

            <div className="ator-meta">
                {ator.creditadoEm && (
                <div className="ator-meta-item">
                    <span className="ator-meta-label">Creditado(a) em</span>
                    <span className="ator-meta-valor">{ator.totalCreditos} filmes</span>
                </div>
                )}
              {ator.genero && (
                <div className="ator-meta-item">
                  <span className="ator-meta-label">Gênero</span>
                  <span className="ator-meta-valor">{ator.genero}</span>
                </div>
              )}
              {ator.nascimento && (
                <div className="ator-meta-item">
                  <span className="ator-meta-label">Nascimento</span>
                  <span className="ator-meta-valor">
                    {formatarData(ator.nascimento)}
                    {idade !== null && !ator.falecimento && ` (${idade} anos)`}
                  </span>
                </div>
              )}
              {ator.falecimento && (
                <div className="ator-meta-item">
                  <span className="ator-meta-label">Falecimento</span>
                  <span className="ator-meta-valor">
                    {formatarData(ator.falecimento)}
                    {idade !== null && ` (${idade} anos)`}
                  </span>
                </div>
              )}
              {ator.localNascimento && (
                <div className="ator-meta-item">
                  <span className="ator-meta-label">Local de nascimento</span>
                  <span className="ator-meta-valor">{ator.localNascimento}</span>
                </div>
              )}
              {ator.tambemConhecidoPor.length > 0 && (
                <div className="ator-meta-item ator-meta-item--full">
                  <span className="ator-meta-label">Também conhecido(a) por</span>
                  <div className="ator-aliases">
                    {ator.tambemConhecidoPor.slice(0, 5).map((nome, i) => (
                      <span key={i} className="ator-alias-tag">{nome}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {ator.biografia && (
              <div className="ator-bio">
                <p className={`ator-bio-texto ${bioExpandida ? 'ator-bio-texto--expandida' : 'ator-bio-texto--recolhida'}`}>
                  {ator.biografia}
                </p>
                {bioLonga && (
                  <button
                    className="ator-bio-btn"
                    onClick={() => setBioExpandida(!bioExpandida)}
                  >
                    {bioExpandida ? 'Ver menos' : 'Ver mais'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="ator-secao">
        <h2>Indicações ao Oscar</h2>
        {indicacoes.length === 0 ? (
          <p className="ator-vazio">O ator nunca foi indicado ao Oscar.</p>
        ) : (
          <div className="ator-indicacoes">
            {indicacoes.map((ind, i) => (
              <div
                key={i}
                className={`ator-indicacao-card ${ind.venceu ? 'ator-indicacao-vencedor' : ''}`}
                onClick={() => router.push(`/filmes/${ind.tmdbId}`)}
              >
                {ind.venceu && (
                  <img src="/oscar2.png" className="ator-indicacao-icone" alt="Vencedor" />
                )}
                <div>
                  <p className="ator-indicacao-categoria">{ind.categoria}{ind.ano && ` • ${ind.ano}`}</p>
                  <p className="ator-indicacao-filme">{ind.filme}</p>
                </div>
                {ind.venceu && (
                  <span className="ator-badge-vencedor">Vencedor</span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="ator-secao ator-secao--filmes">
        <h2>Filmes com Indicação ao Oscar</h2>
        {filmesOscar.length === 0 ? (
          <p className="ator-vazio">O ator não participou de nenhum filme indicado ao Oscar.</p>
        ) : (
          <div className="ator-filmes-grid">
            {filmesOscar.map((filme) => (
              <div
                key={filme.tmdbId}
                className="ator-filme-card"
                onClick={() => router.push(`/filmes/${filme.tmdbId}`)}
              >
                <FilmeCardSimples tmdbId={filme.tmdbId} titulo={filme.titulo} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function FilmeCardSimples({ tmdbId, titulo }) {
  const [poster, setPoster] = useState(null);

  useEffect(() => {
    fetch(
      `${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/movie/${tmdbId}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=pt-BR`
    )
      .then((r) => r.json())
      .then((d) => setPoster(getImageURL(d.poster_path, 'w342')))
      .catch(() => {});
  }, [tmdbId]);

  return (
    <>
      <img src={poster || '/placeholder.jpg'} alt={titulo} />
      <div className="ator-filme-overlay">
        <p>{titulo}</p>
      </div>
    </>
  );
}