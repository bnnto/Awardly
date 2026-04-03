'use client';

import { useState } from 'react';
import { useFilmes } from '../../hooks/useFilmes';
import FilmeCard from '@/app/components/FilmeCard';
import '@/styles/filmes.css';

const ANOS = [2023, 2024, 2025, 2026];

export default function Filmes() {
  const [anoSelecionado, setAnoSelecionado] = useState(null);
  const { filmes, loading, erro } = useFilmes(anoSelecionado);

  return (
    <>
    <div className="filmes-container">
      <h1 className="filmes-titulo">Filmes Indicados ao Oscar</h1>

      <div className="filmes-filtros">
        <button
          className={`filtro-btn ${anoSelecionado === null ? 'ativo' : ''}`}
          onClick={() => setAnoSelecionado(null)}
        >
          Todos
        </button>
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

      {loading && <p className="mensagem">Carregando filmes...</p>}
      {erro    && <p className="mensagem erro">Erro: {erro}</p>}

      {!loading && !erro && (
        <div className="filmes-grid">
          {filmes.map((filme) => (
            <FilmeCard key={filme.id} filme={filme} />
          ))}
        </div>
      )}
    </div>
    </>
  );
}