'use client';

import { useState } from 'react';
import { useFilmes } from '../../hooks/useFilmes';
import FilmeCard from '../components/FilmeCard';
import '../../styles/categorias.css';

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
      <h1>Categorias do Oscar</h1>

      <div className="filtros">
        <button
          className={anoSelecionado === null ? 'ativo' : ''}
          onClick={() => setAnoSelecionado(null)}
        >
          Todos
        </button>

        {ANOS.map((ano) => (
          <button
            key={ano}
            className={anoSelecionado === ano ? 'ativo' : ''}
            onClick={() => setAnoSelecionado(ano)}
          >
            {ano}
          </button>
        ))}
      </div>

      {loading && <p>Carregando...</p>}
      {erro && <p className="erro">Erro: {erro}</p>}

      {!loading && !erro && (
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