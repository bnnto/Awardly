'use client';

import { useState } from 'react';
import { useFilmes } from '../../hooks/useFilmes';
import FilmeCard from '@/app/components/FilmeCard';
import '@/styles/categorias.css';

const ANOS = [2023, 2024, 2025, 2026];

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
          {Object.entries(categoriasAgrupadas).map(([nome, filmesCategoria]) => (
            <div key={nome} className="categoria-bloco">
              <h2>{nome}</h2>
              <div className="categoria-filmes">
                {filmesCategoria.map((filme) => (
                  <FilmeCard key={filme.id} filme={filme} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}