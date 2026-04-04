'use client';

import { useState } from 'react';
import { useFilmes } from '../../hooks/useFilmes';
import FilmeCard from '@/app/components/FilmeCard';
import '@/styles/categorias.css';

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

export default function Categorias() {
  const [anoSelecionado, setAnoSelecionado] = useState(null);
  const { filmes, loading, erro } = useFilmes(anoSelecionado);

  const categoriasAgrupadas = filmes.reduce((acc, filme) => {
    filme.categorias.forEach((cat) => {
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(filme);
    });
    return acc;
  }, {});

  const categoriasOrdenadas = ORDEM_CATEGORIAS
    .filter((cat) => categoriasAgrupadas[cat])
    .map((cat) => [cat, categoriasAgrupadas[cat]]);

  // categorias que não estão na lista oficial aparecem no final
  const categoriasExtras = Object.entries(categoriasAgrupadas)
    .filter(([cat]) => !ORDEM_CATEGORIAS.includes(cat));

  const todasCategorias = [...categoriasOrdenadas, ...categoriasExtras];

  return (
    <div className="categorias-container">
      <h1 className="categorias-titulo">Categorias do Oscar</h1>

      <div className="filtros">
        {ANOS.map((ano) => (
          <button
            key={ano}
            className={`filtro-btn ${anoSelecionado === ano ? 'ativo' : ''}`}
            onClick={() => setAnoSelecionado(ano)}
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
                {filmesCategoria.map((filme) => (
                  <FilmeCard key={filme.id} filme={filme} categoriaAtual={nome} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}