"use client";

import { useEffect, useState } from "react";
import Parse from "@/lib/parseClient";
import NavbarLogin from "../../components/NavbarLogin";
import TabsPerfil from "../../components/TabsPerfil";
import styles from "@/styles/perfil.module.css";
import { getFilme, getImageURL } from "@/lib/tmdb";

export default function PerfilReviews() {
  const [reviews, setReviews] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    async function carregar() {
      const user = Parse.User.current();
      setUsuario(user);
      if (!user) { setCarregando(false); return; }

      try {
        const query = new Parse.Query("Review");
        query.equalTo("usuarioId", user);
        query.descending("createdAt");
        const resultados = await query.find();

        const comDetalhes = await Promise.allSettled(
          resultados.map(async (r) => {
            const filme = await getFilme(r.get("filmeId"));
            return {
              filme,
              nota: r.get("nota"),
              texto: r.get("texto"),
              categoria: r.get("categoria"),
              oscarAno: r.get("oscarAno"),
              data: r.createdAt?.toLocaleDateString("pt-BR"),
              id: r.id,
            };
          })
        );

        setReviews(
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
          todas as reviews
        </h2>

        {carregando ? (
          <div className={styles.listaReviews}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.reviewCardEsq} />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <p className={styles.vazio}>Você ainda não escreveu nenhuma review.</p>
        ) : (
          <div className={styles.listaReviews}>
            {reviews.map(({ filme, nota, texto, categoria, oscarAno, data, id }) => (
              <div key={id} className={styles.reviewCard}>
                <img
                  src={getImageURL(filme.poster_path, "w185")}
                  alt={filme.title}
                  className={styles.reviewPoster}
                />
                <div className={styles.reviewBody}>
                  <div className={styles.reviewHeader}>
                    <span className={styles.reviewFilme}>{filme.title}</span>
                    <span className={styles.reviewNota}>{nota}</span>
                  </div>
                  <span className={styles.reviewCategoria}>
                    Oscar {oscarAno} · {categoria}
                  </span>
                  <p className={styles.reviewTexto}>{texto}</p>
                  <span className={styles.reviewData}>{data}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}