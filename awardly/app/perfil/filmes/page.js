"use client";

import { useEffect, useState } from "react";
import Parse from "@/lib/parseClient";
import NavbarLogin from "../../components/NavbarLogin";
import TabsPerfil from "../../components/TabsPerfil";
import styles from "@/styles/perfil.module.css";
import { getFilme, getImageURL } from "@/lib/tmdb";

export default function PerfilFilmes() {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    async function carregar() {
      const user = Parse.User.current();
      setUsuario(user);
      if (!user) { setCarregando(false); return; }

      try {
        const query = new Parse.Query("AvaliacaoFilme");
        query.equalTo("usuarioId", user);
        query.descending("createdAt");
        const resultados = await query.find();

        const comDetalhes = await Promise.allSettled(
          resultados.map(async (r) => {
            const filme = await getFilme(r.get("filmeId"));
            return {
              filme,
              nota: r.get("nota"),
              oscarAno: r.get("oscarAno"),
              id: r.id,
            };
          })
        );

        setAvaliacoes(
          comDetalhes
            .filter((r) => r.status === "fulfilled")
            .map((r) => r.value)
        );
      } catch (e) {
        console.error(e);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  const nome = usuario?.get("nome") || usuario?.get("username") || "Usuário";
  const foto = usuario?.get("foto")?._url || null;

  return (
    <main className={styles.principal}>
      <NavbarLogin usuario={{ nome, foto }} />

      <div className={styles.bannerWrap}>
        <div className={styles.banner} />
        <div className={styles.headerPerfil}>
          <div className={styles.avatarWrap}>
            {foto ? (
              <img src={foto} alt={nome} className={styles.avatar} />
            ) : (
              <div className={styles.avatarPlaceholder}>{nome[0]?.toUpperCase()}</div>
            )}
          </div>
          <div className={styles.headerInfo}>
            <h1 className={styles.nomeUsuario}>{nome}</h1>
          </div>
          <button className={styles.btnEditar}>Editar perfil</button>
        </div>
      </div>

      <TabsPerfil />

      <div className={styles.conteudoFull}>
        <h2 className={styles.tituloSecao} style={{ marginBottom: 24 }}>
          todos os filmes avaliados
        </h2>

        {carregando ? (
          <div className={styles.gradeFilmesAval}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={styles.cardFilmeAvalEsq} />
            ))}
          </div>
        ) : avaliacoes.length === 0 ? (
          <p className={styles.vazio}>Você ainda não avaliou nenhum filme.</p>
        ) : (
          <div className={styles.gradeFilmesAval}>
            {avaliacoes.map(({ filme, nota, oscarAno }) => (
              <div key={filme.id} className={styles.cardFilmeAval}>
                <div className={styles.cardFilmeAvalImg}>
                  <img
                    src={getImageURL(filme.poster_path, "w342")}
                    alt={filme.title}
                  />
                  <span className={styles.cardFilmeNota}>{nota}</span>
                </div>
                <div className={styles.cardFilmeAvalInfo}>
                  <p className={styles.cardFilmeAvalTitulo}>{filme.title}</p>
                  <span className={styles.cardFilmeAvalAno}>Oscar {oscarAno}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}