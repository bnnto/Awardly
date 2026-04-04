'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Parse from '@/lib/parseClient';
import { getFilme, getFilmeCreditos, getImageURL } from '../../../lib/tmdb';
import NavbarLogin from '../../components/NavbarLogin';
import '@/styles/filmeUnico.css';

async function verificarWatchlist(tmdbId) {
  const user = Parse.User.current();
  if (!user) return false;
  const query = new Parse.Query('Watchlist');
  query.equalTo('usuarioId', user);
  query.equalTo('filmeId', Number(tmdbId));
  const existe = await query.first();
  return !!existe;
}

async function toggleWatchlist(tmdbId, estaNA) {
  const user = Parse.User.current();
  if (!user) return;
  if (estaNA) {
    const query = new Parse.Query('Watchlist');
    query.equalTo('usuarioId', user);
    query.equalTo('filmeId', Number(tmdbId));
    const obj = await query.first();
    if (obj) await obj.destroy();
  } else {
    const Watchlist = Parse.Object.extend('Watchlist');
    const item = new Watchlist();
    item.set('usuarioId', user);
    item.set('filmeId', Number(tmdbId));
    item.set('oscarAno', 0);
    const acl = new Parse.ACL();
    acl.setPublicReadAccess(true);
    acl.setWriteAccess(user, true);
    item.setACL(acl);
    await item.save();
  }
}

function Estatuetas({ valor, onChange }) {
  const [hover, setHover] = useState(null);

  function calcularValor(e, indice) {
    const rect = e.currentTarget.getBoundingClientRect();
    const metade = (e.clientX - rect.left) < rect.width / 2;
    return metade ? indice - 0.5 : indice;
  }

  const exibir = hover !== null ? hover : valor;

  return (
    <div className="log-estatuetas" onMouseLeave={() => setHover(null)}>
      {[1, 2, 3, 4, 5].map((i) => {
        const cheia = exibir >= i;
        const meia = !cheia && exibir >= i - 0.5;
        return (
          <div
            key={i}
            className="log-estatueta-slot"
            onMouseMove={(e) => setHover(calcularValor(e, i))}
            onClick={(e) => {
              const novo = calcularValor(e, i);
              onChange(valor === novo ? 0 : novo);
            }}
          >
            {cheia ? (
              <img src="/oscar2.png" className="log-estatueta-img" />
            ) : meia ? (
              <div style={{ position: 'relative', width: 28, height: 28 }}>
                <img src="/oscar2.png" className="log-estatueta-img" style={{ clipPath: 'inset(0 50% 0 0)', position: 'absolute' }} />
                <img src="/oscarvazio.png" className="log-estatueta-img" style={{ clipPath: 'inset(0 0 0 50%)', position: 'absolute', opacity: 0.35 }} />
              </div>
            ) : (
              <img src="/oscarvazio.png" className="log-estatueta-img" style={{ opacity: 0.35 }} />
            )}
          </div>
        );
      })}
      {valor > 0 && <span className="log-estatuetas-valor">{valor}</span>}
    </div>
  );
}

function PainelLog({ onSalvo, onFechar, tmdbId }) {
  const hoje = new Date().toISOString().split('T')[0];
  const [data, setData] = useState(hoje);
  const [estatuetas, setEstatuetas] = useState(0);
  const [like, setLike] = useState(false);
  const [review, setReview] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [salvo, setSalvo] = useState(false);

  async function handleSalvar(e) {
    e.preventDefault();
    setErro('');
    const user = Parse.User.current();
    if (!user) { setErro('Você precisa estar logado.'); return; }

    setSalvando(true);
    try {
      const Log = Parse.Object.extend('Log');
      const log = new Log();
      log.set('usuarioId', user);
      log.set('filmeId', Number(tmdbId));
      log.set('dataAssistido', new Date(data + 'T12:00:00'));
      log.set('estatuetas', estatuetas);
      log.set('like', like);
      if (review.trim()) log.set('review', review.trim());

      const acl = new Parse.ACL();
      acl.setPublicReadAccess(true);
      acl.setWriteAccess(user, true);
      log.setACL(acl);

      await log.save();
      setSalvo(true);
      onSalvo?.();
      setTimeout(() => onFechar(), 1400);
    } catch (e) {
      setErro(e.message || 'Erro ao registrar.');
    } finally {
      setSalvando(false);
    }
  }

  if (salvo) {
    return (
      <div className="log-painel log-painel-salvo">
        <span className="log-salvo-texto">✓ registrado!</span>
      </div>
    );
  }

  return (
    <form className="log-painel" onSubmit={handleSalvar}>
      <div className="log-painel-linha">
        <div className="log-campo">
          <label className="log-label">quando assistiu?</label>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="log-input-data"
            max={hoje}
          />
        </div>
        <div className="log-campo">
          <label className="log-label">curtiu?</label>
          <button
            type="button"
            className={`log-btn-like ${like ? 'log-btn-like-ativo' : ''}`}
            onClick={() => setLike(!like)}
          >
            <img src={like ? '/envelopecoracao.png' : '/envelope.png'} className="log-envelope" alt="" />
          </button>
        </div>
      </div>

      <div className="log-campo">
        <label className="log-label">nota</label>
        <Estatuetas valor={estatuetas} onChange={setEstatuetas} />
      </div>

      <div className="log-campo">
        <label className="log-label">review <span className="log-opcional">(opcional)</span></label>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="O que você achou?"
          className="log-textarea"
          rows={2}
          maxLength={1000}
        />
      </div>

      {erro && <p className="log-erro">{erro}</p>}

      <div className="log-acoes">
        <button type="button" className="log-btn-cancelar" onClick={onFechar}>cancelar</button>
        <button type="submit" className="log-btn-salvar" disabled={salvando}>
          {salvando ? 'registrando...' : 'registrar'}
        </button>
      </div>
    </form>
  );
}

export default function FilmeUnico({ params }) {
  const { id } = use(params);
  const router = useRouter();

  const [filme, setFilme] = useState(null);
  const [elenco, setElenco] = useState([]);
  const [classificacao, setClassificacao] = useState(null);
  const [loading, setLoading] = useState(true);
  const [naWatchlist, setNaWatchlist] = useState(false);
  const [salvandoWatch, setSalvandoWatch] = useState(false);
  const [logAberto, setLogAberto] = useState(false);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    async function carregar() {
      try {
        const user = Parse.User.current();
        setUsuario(user);

        const [detalhes, creditos, releases] = await Promise.all([
          getFilme(id),
          getFilmeCreditos(id),
          fetch(`${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/movie/${id}/release_dates?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`).then((r) => r.json()),
        ]);

        const brRelease = releases.results?.find((r) => r.iso_3166_1 === 'BR');
        const classificacaoBR = brRelease?.release_dates?.[0]?.certification;

        setFilme({
          titulo: detalhes.title,
          tituloOriginal: detalhes.original_title,
          sinopse: detalhes.overview,
          backdrop: getImageURL(detalhes.backdrop_path, 'original'),
          poster: getImageURL(detalhes.poster_path, 'w342'),
          ano: detalhes.release_date?.split('-')[0],
          duracao: detalhes.runtime
            ? `${Math.floor(detalhes.runtime / 60)}h ${detalhes.runtime % 60}min`
            : 'N/A',
          nota: detalhes.vote_average?.toFixed(1),
          generos: detalhes.genres?.map((g) => g.name),
          tmdbId: detalhes.id,
        });

        setElenco(creditos.cast?.slice(0, 10) || []);
        setClassificacao(classificacaoBR || 'N/A');

        if (user) {
          const estaNA = await verificarWatchlist(id);
          setNaWatchlist(estaNA);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, [id]);

  async function handleWatchlist() {
    if (salvandoWatch) return;
    setSalvandoWatch(true);
    try {
      await toggleWatchlist(id, naWatchlist);
      setNaWatchlist(!naWatchlist);
    } catch (e) {
      console.error(e);
    } finally {
      setSalvandoWatch(false);
    }
  }

  const nome = usuario?.get('nome') || usuario?.get('username') || '';
  const foto = usuario?.get('foto')?._url || null;

  if (loading) return (
    <div className="filme-unico">
      <NavbarLogin usuario={{ nome, foto }} />
      <div className="filme-loading" />
    </div>
  );
  if (!filme) return <p>Filme não encontrado.</p>;

  return (
    <div className="filme-unico">
      <NavbarLogin usuario={{ nome, foto }} />

      <div className="filme-hero" style={{ backgroundImage: `url(${filme.backdrop})` }}>
        <div className="filme-hero-overlay">
          <img src={filme.poster} alt={filme.titulo} className="filme-poster" />

          {/* wrapper que coloca info + painel lado a lado */}
          <div className="filme-hero-conteudo">
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
                <button
                  onClick={() => setLogAberto(!logAberto)}
                  className={logAberto ? 'btn-ativo' : ''}
                >
                  {logAberto ? '✕ cancelar' : '+ registrar'}
                </button>
                <button
                  onClick={handleWatchlist}
                  disabled={salvandoWatch}
                  className={naWatchlist ? 'btn-watchlist-ativo' : ''}
                >
                  {naWatchlist ? '✓ na watchlist' : '+ watchlist'}
                </button>
              </div>
            </div>

            {/* Painel à direita das infos */}
            {logAberto && (
              <PainelLog
                tmdbId={filme.tmdbId}
                onFechar={() => setLogAberto(false)}
                onSalvo={() => {}}
              />
            )}
          </div>
        </div>
      </div>

      <section className="filme-sinopse">
        <h2>Sinopse</h2>
        <p>{filme.sinopse}</p>
      </section>

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