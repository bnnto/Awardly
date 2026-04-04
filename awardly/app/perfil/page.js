"use client";

import { useEffect, useState } from "react";
import Parse from "@/lib/parseClient";
import NavbarLogin from "../components/NavbarLogin";
import TabsPerfil from "../components/TabsPerfil";
import styles from "@/styles/perfil.module.css";
import { getImageURL } from "@/lib/tmdb";
import { useRouter } from "next/navigation";

const FILMES_FAVORITOS = [
  { id: 1064213, poster_path: "/aosm8NMQ3UyoBVpSxyimorCQykC.jpg", title: "Ainda Estou Aqui" },
  { id: 1054867, poster_path: "/kYgQkdIfHqhvRtQKGSxaJiRJZfg.jpg", title: "Uma Batalha Após a Outra" },
  { id: 693134, poster_path: "/imdb9bHewgU2RmkRmCxe2y0O4Ij.jpg", title: "Duna: Parte Dois" },
  { id: 974576, poster_path: "/xgGGinKRL8xeRdjpvkzKorrvkNO.jpg", title: "O Aprendiz" },
];

const ATIVIDADE_RECENTE = [
  { tipo: "review", filme: "Ainda Estou Aqui", nota: 9.2, texto: "Uma obra devastadora e necessária.", data: "2 dias atrás" },
  { tipo: "watchlist", filme: "O Brutalista", data: "5 dias atrás" },
  { tipo: "avaliacao", filme: "Duna: Parte Dois", nota: 8.5, data: "1 semana atrás" },
  { tipo: "seguindo", usuario: "maria_cinefila", data: "1 semana atrás" },
];

const REVIEWS_RECENTES = [
  {
    filme: "Ainda Estou Aqui",
    poster: "/aosm8NMQ3UyoBVpSxyimorCQykC.jpg",
    nota: 9.2,
    texto: "Uma obra devastadora e necessária. Fernanda Torres entrega uma das melhores atuações dos últimos anos.",
    categoria: "Melhor Filme",
    ano: 2025,
    data: "2 dias atrás",
  },
  {
    filme: "Duna: Parte Dois",
    poster: "/imdb9bHewgU2RmkRmCxe2y0O4Ij.jpg",
    nota: 8.5,
    texto: "Épico visual sem precedentes. Villeneuve consolida sua posição como um dos maiores diretores da atualidade.",
    categoria: "Melhor Direção",
    ano: 2025,
    data: "1 semana atrás",
  },
];

function EstatCard({ valor, label }) {
  return (
    <div className={styles.estatCard}>
      <span className={styles.estatValor}>{valor}</span>
      <span className={styles.estatLabel}>{label}</span>
    </div>
  );
}

function FilmeFavorito({ filme }) {
  return (
    <div className={styles.filmeFav}>
      <img
        src={getImageURL(filme.poster_path, "w342")}
        alt={filme.title}
        className={styles.filmeFavImg}
      />
      <div className={styles.filmeFavOverlay}>
        <span className={styles.filmeFavTitulo}>{filme.title}</span>
      </div>
    </div>
  );
}

function AtividadeItem({ item }) {
  const icones = {
    review: "✍️",
    watchlist: "🎬",
    avaliacao: "⭐",
    seguindo: "👤",
  };

  const textos = {
    review: `avaliou "${item.filme}" com ${item.nota}`,
    watchlist: `adicionou "${item.filme}" à watchlist`,
    avaliacao: `deu nota ${item.nota} para "${item.filme}"`,
    seguindo: `começou a seguir ${item.usuario}`,
  };

  return (
    <div className={styles.atividadeItem}>
      <span className={styles.atividadeIcone}>{icones[item.tipo]}</span>
      <div className={styles.atividadeInfo}>
        <p className={styles.atividadeTexto}>{textos[item.tipo]}</p>
        <span className={styles.atividadeData}>{item.data}</span>
      </div>
    </div>
  );
}

function ReviewCard({ review }) {
  return (
    <div className={styles.reviewCard}>
      <img
        src={getImageURL(review.poster, "w185")}
        alt={review.filme}
        className={styles.reviewPoster}
      />
      <div className={styles.reviewBody}>
        <div className={styles.reviewHeader}>
          <span className={styles.reviewFilme}>{review.filme}</span>
          <span className={styles.reviewNota}>{review.nota}</span>
        </div>
        <span className={styles.reviewCategoria}>
          Oscar {review.ano} · {review.categoria}
        </span>
        <p className={styles.reviewTexto}>{review.texto}</p>
        <span className={styles.reviewData}>{review.data}</span>
      </div>
    </div>
  );
}

export default function Perfil() {
  const [usuario, setUsuario] = useState(null);
  const [seguidores, setSeguidores] = useState(0);
  const [seguindo, setSeguindo] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function carregar() {
      try {
        const user = Parse.User.current();
        if (user) {
          setUsuario(user);

          const qSeguidores = new Parse.Query("Follow");
          qSeguidores.equalTo("seguindo", user);
          const totalSeguidores = await qSeguidores.count();
          setSeguidores(totalSeguidores);

          const qSeguindo = new Parse.Query("Follow");
          qSeguindo.equalTo("seguidor", user);
          const totalSeguindo = await qSeguindo.count();
          setSeguindo(totalSeguindo);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  if (carregando) {
    return (
      <main className={styles.principal}>
        <NavbarLogin usuario={{ nome: "", foto: null }} />
        <div className={styles.esqueletoPage} />
      </main>
    );
  }

  const nome = usuario?.get("nome") || usuario?.get("username") || "Usuário";
  const bio = usuario?.get("bio") || "Cinéfilo apaixonado por Oscar.";
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
              <div className={styles.avatarPlaceholder}>
                {nome[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div className={styles.headerInfo}>
            <h1 className={styles.nomeUsuario}>{nome}</h1>
            <p className={styles.bioUsuario}>{bio}</p>
          </div>
          <button className={styles.btnEditar} onClick={() => router.push("/editarPerfil")}>
            Editar perfil
          </button>
        </div>
      </div>

      <div className={styles.estatRow}>
        <EstatCard valor="24" label="filmes avaliados" />
        <EstatCard valor="8" label="reviews" />
        <EstatCard valor={seguidores} label="seguidores" />
        <EstatCard valor={seguindo} label="seguindo" />
        <EstatCard valor="12" label="watchlist" />
      </div>

      <TabsPerfil ativa="perfil" />

      <div className={styles.conteudo}>
        <div className={styles.colunaEsq}>
          <section className={styles.secao}>
            <h2 className={styles.tituloSecao}>filmes favoritos</h2>
            <div className={styles.gradeFilmesFav}>
              {FILMES_FAVORITOS.map((f) => (
                <FilmeFavorito key={f.id} filme={f} />
              ))}
            </div>
          </section>

          <section className={styles.secao}>
            <h2 className={styles.tituloSecao}>reviews recentes</h2>
            <div className={styles.listaReviews}>
              {REVIEWS_RECENTES.map((r, i) => (
                <ReviewCard key={i} review={r} />
              ))}
            </div>
          </section>
        </div>

        <aside className={styles.sidebar}>
          <section className={styles.secao}>
            <h2 className={styles.tituloSecao}>atividade recente</h2>
            <div className={styles.listaAtividade}>
              {ATIVIDADE_RECENTE.map((a, i) => (
                <AtividadeItem key={i} item={a} />
              ))}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}