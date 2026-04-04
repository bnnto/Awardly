'use client';

// 👇 INSERÇÃO 1: Adicionado o useEffect
import { useState, useEffect } from 'react';
import { useFilmes } from '../../hooks/useFilmes';
import FilmeCard from '@/app/components/FilmeCard';
import '@/styles/categorias.css';
import NavbarLogin from '../components/NavbarLogin';
// 👇 INSERÇÃO 2: Importado o Parse para buscar o usuário logado
import Parse from '@/lib/parseClient';

const ANOS = [2023, 2024, 2025, 2026];

const ORDEM_CATEGORIAS = [
  'Melhor Filme',
  'Melhor Diretor',
  'Melhor Ator',
  'Melhor Atriz',
  'Melhor Ator Coadjuvante',
  'Melhor Atriz Coadjuvante',
  'Melhor Roteiro Original',
  'Melhor Roteiro Adaptado',
  'Melhor Filme Internacional',
  'Melhor Animação',
  'Melhor Documentário (Longa)',
  'Melhor Documentário (Curta)',
  'Melhor Curta de Animação',
  'Melhor Curta-Metragem (Live Action)',
  'Melhor Fotografia',
  'Melhor Edição',
  'Melhor Montagem',
  'Melhor Trilha Sonora',
  'Melhor Canção Original',
  'Melhor Design de Produção',
  'Melhor Figurino',
  'Melhor Maquiagem e Penteados',
  'Melhor Som',
  'Melhores Efeitos Visuais',
  'Melhor Direção de Elenco',
];

const CATEGORIAS_ATUACAO = [
  'Melhor Ator',
  'Melhor Atriz',
  'Melhor Ator Coadjuvante',
  'Melhor Atriz Coadjuvante',
];

const CATEGORIAS_ROTEIRO = [
  'Melhor Roteiro Original',
  'Melhor Roteiro Adaptado',
];

export default function Categorias() {
  const [anoSelecionado, setAnoSelecionado] = useState(null);
  const { filmes, loading, erro } = useFilmes(anoSelecionado);

  // 👇 INSERÇÃO 3: Criado o estado e a busca do usuário logado
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const user = Parse.User.current();
    setUsuario(user);
  }, []);

  const nome = usuario?.get('nome') || usuario?.get('username') || '';
  const foto = usuario?.get('foto')?._url || null;
  // 👆 -------------------------------------------------------- 👆

  const categoriasAgrupadas = filmes.reduce((acc, filme) => {
    filme.categorias.forEach((cat) => {
      if (!acc[cat]) acc[cat] = [];

      if (CATEGORIAS_ATUACAO.includes(cat)) {
        // Duplica card por ator indicado
        const atores = filme.atoresIndicados?.[cat];
        if (Array.isArray(atores) && atores.length > 1) {
          atores.forEach((ator) => {
            // Vencedor só se ESTE ator específico ganhou
            const venceu = filme.vencedores?.some(
              (v) => v === cat && filme.atoresIndicados?.[`${cat}__vencedor`] === ator
              // OU: vencedores guarda 'Melhor Ator::Cillian Murphy'
              || v === `${cat}::${ator}`
            );
            acc[cat].push({ ...filme, _itemForcado: ator, _venceuItem: venceu });
          });
        } else {
          acc[cat].push({ ...filme, _venceuItem: filme.vencedores?.includes(cat) });
        }

      } else if (cat === 'Melhor Canção Original') {
        // Duplica card por canção indicada
        const cancoes = filme.cancao?.[cat];
        if (Array.isArray(cancoes) && cancoes.length > 1) {
          cancoes.forEach((cancao) => {
            const venceu = filme.vencedores?.some(
              (v) => v === `${cat}::${cancao}`
            );
            acc[cat].push({ ...filme, _itemForcado: cancao, _venceuItem: venceu });
          });
        } else {
          const cancao = Array.isArray(cancoes) ? cancoes[0] : cancoes;
          acc[cat].push({
            ...filme,
            _itemForcado: cancao || null,
            _venceuItem: filme.vencedores?.includes(cat),
          });
        }

      } else if (CATEGORIAS_ROTEIRO.includes(cat)) {
        acc[cat].push({
          ...filme,
          _itemForcado: filme.roteiristas || null,  // só da TMDB
          _venceuItem: filme.vencedores?.includes(cat),
        });

      } else {
        acc[cat].push({ ...filme, _venceuItem: filme.vencedores?.includes(cat) });
      }
    });
    return acc;
  }, {});

  const categoriasOrdenadas = ORDEM_CATEGORIAS
    .filter((cat) => categoriasAgrupadas[cat])
    .map((cat) => [cat, categoriasAgrupadas[cat]]);

  const categoriasExtras = Object.entries(categoriasAgrupadas)
    .filter(([cat]) => !ORDEM_CATEGORIAS.includes(cat));

  const todasCategorias = [...categoriasOrdenadas, ...categoriasExtras];

  return (
    <div className="categorias-container">
      {/* 👇 INSERÇÃO 4: O componente Navbar foi colocado no topo da tela, repassando os dados */}
      <NavbarLogin usuario={{ nome, foto }} />
      {/* 👆 ---------------------------------------------------------------------------------- 👆 */}

      <h1 className="categorias-titulo">Categorias do Oscar</h1>

      <div className="filtros">
        {ANOS.map((ano) => (
          <button
            key={ano}
            className={`filtro-btn ${anoSelecionado === ano ? 'ativo' : ''}`}
            onClick={() => setAnoSelecionado(ano === anoSelecionado ? null : ano)}
          >
            {ano}
          </button>
        ))}
      </div>

      {!anoSelecionado && (
        <div className="selecione">
          <p>Selecione o ano</p>
        </div>
      )}

      {loading && anoSelecionado && <p className="mensagem">Carregando...</p>}
      {erro && <p className="mensagem erro">Erro: {erro}</p>}

      {!loading && !erro && anoSelecionado && (
        <div className="categorias-lista">
          {todasCategorias.map(([nome, filmesCategoria]) => (
            <div key={nome} className="categoria-bloco">
              <h2>{nome}</h2>
              <div className="categoria-filmes">
                {filmesCategoria.map((filme, i) => (
                  <FilmeCard
                    key={`${filme.id}-${filme._itemForcado ?? ''}-${i}`}
                    filme={filme}
                    categoriaAtual={nome}
                    itemForcado={filme._itemForcado ?? null}
                    venceu={filme._venceuItem ?? false}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}