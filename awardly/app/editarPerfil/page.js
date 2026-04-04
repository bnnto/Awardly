"use client";

import { useEffect, useState, useRef } from "react";
import Parse from "@/lib/parseClient";
import NavbarLogin from "../components/NavbarLogin";
import { useRouter } from "next/navigation";
import styles from "@/styles/editarPerfil.module.css";

export default function EditarPerfil() {
  const router = useRouter();
  const inputFotoRef = useRef(null);

  const [usuario, setUsuario] = useState(null);
  const [form, setForm] = useState({ nome: "", bio: "", username: "" });
  const [fotoPreview, setFotoPreview] = useState(null);
  const [fotoFile, setFotoFile] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState({ texto: "", tipo: "" });

  useEffect(() => {
    const user = Parse.User.current();
    if (!user) { router.push("/login"); return; }
    setUsuario(user);
    setForm({
      nome: user.get("nome") || "",
      bio: user.get("bio") || "",
      username: user.get("username") || "",
    });
    const foto = user.get("foto");
    if (foto?._url) setFotoPreview(foto._url);
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleFotoChange(e) {
    const arquivo = e.target.files[0];
    if (!arquivo) return;
    setFotoFile(arquivo);
    setFotoPreview(URL.createObjectURL(arquivo));
  }

  async function handleSalvar(e) {
    e.preventDefault();
    if (!usuario) return;
    setSalvando(true);
    setMensagem({ texto: "", tipo: "" });

    try {
      if (form.nome !== usuario.get("nome")) usuario.set("nome", form.nome);
      if (form.bio !== usuario.get("bio")) usuario.set("bio", form.bio);
      if (form.username !== usuario.get("username")) usuario.set("username", form.username);

      if (fotoFile) {
        const parseFile = new Parse.File(
          `foto_${usuario.id}.jpg`,
          fotoFile,
          fotoFile.type
        );
        await parseFile.save();
        usuario.set("foto", parseFile);
      }

      await usuario.save();
      setMensagem({ texto: "Perfil atualizado com sucesso!", tipo: "sucesso" });
      setTimeout(() => router.push("/perfil"), 1200);
    } catch (e) {
      setMensagem({ texto: e.message || "Erro ao salvar.", tipo: "erro" });
    } finally {
      setSalvando(false);
    }
  }

  const nome = form.nome || form.username || "Usuário";

  return (
    <main className={styles.principal}>
      <NavbarLogin usuario={{ nome, foto: fotoPreview }} />

      <div className={styles.pagina}>
        <div className={styles.cabecalho}>
          <button className={styles.btnVoltar} onClick={() => router.push("/perfil")}>
            ← voltar ao perfil
          </button>
          <h1 className={styles.titulo}>editar perfil</h1>
        </div>

        <form onSubmit={handleSalvar} className={styles.form}>

          <div className={styles.secaoFoto}>
            <div
              className={styles.avatarWrap}
              onClick={() => inputFotoRef.current?.click()}
            >
              {fotoPreview ? (
                <img src={fotoPreview} alt="Foto" className={styles.avatar} />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {nome[0]?.toUpperCase()}
                </div>
              )}
              <div className={styles.avatarOverlay}>
                <span>trocar foto</span>
              </div>
            </div>
            <input
              ref={inputFotoRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFotoChange}
            />
          </div>

          <div className={styles.campos}>
            <div className={styles.campo}>
              <label className={styles.label}>nome de exibição</label>
              <input
                name="nome"
                value={form.nome}
                onChange={handleChange}
                placeholder="Seu nome"
                className={styles.input}
                maxLength={50}
              />
            </div>

            <div className={styles.campo}>
              <label className={styles.label}>username</label>
              <div className={styles.inputPrefix}>
                <span className={styles.prefix}>@</span>
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="username"
                  className={`${styles.input} ${styles.inputComPrefix}`}
                  maxLength={30}
                />
              </div>
            </div>

            <div className={styles.campo}>
              <label className={styles.label}>bio</label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                placeholder="Fale um pouco sobre você..."
                className={styles.textarea}
                maxLength={160}
                rows={3}
              />
              <span className={styles.contador}>{form.bio.length}/160</span>
            </div>
          </div>

          {mensagem.texto && (
            <p className={`${styles.mensagem} ${styles[mensagem.tipo]}`}>
              {mensagem.texto}
            </p>
          )}

          <div className={styles.acoes}>
            <button
              type="button"
              className={styles.btnCancelar}
              onClick={() => router.push("/perfil")}
            >
              cancelar
            </button>
            <button
              type="submit"
              className={styles.btnSalvar}
              disabled={salvando}
            >
              {salvando ? "salvando..." : "salvar alterações"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}