// hooks/useFollow.js
// Sistema de seguir/deixar de seguir usando Parse (Back4App)
//
// Estrutura da classe "Follow" no Back4App:
//   seguidor: Pointer<_User>  → quem está seguindo
//   seguindo: Pointer<_User>  → quem está sendo seguido
//
// IMPORTANTE: Crie a classe "Follow" no dashboard do Back4App com
// as permissões de leitura/escrita para usuários autenticados.

import { useState, useEffect } from "react";
import Parse from "@/lib/parseClient";

export function useFollow(usuarioAlvoId) {
  const [seguindo, setSeguindo] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    async function verificar() {
      const eu = Parse.User.current();
      if (!eu || !usuarioAlvoId) { setCarregando(false); return; }
      if (eu.id === usuarioAlvoId) { setCarregando(false); return; }

      try {
        const alvo = Parse.User.createWithoutData(usuarioAlvoId);
        const query = new Parse.Query("Follow");
        query.equalTo("seguidor", eu);
        query.equalTo("seguindo", alvo);
        const existe = await query.first();
        setSeguindo(!!existe);
      } catch (e) {
        console.error("Erro ao verificar follow:", e);
      } finally {
        setCarregando(false);
      }
    }
    verificar();
  }, [usuarioAlvoId]);

  async function toggleFollow() {
    const eu = Parse.User.current();
    if (!eu || !usuarioAlvoId || salvando) return;
    setSalvando(true);

    try {
      const alvo = Parse.User.createWithoutData(usuarioAlvoId);

      if (seguindo) {
        // Deixar de seguir
        const query = new Parse.Query("Follow");
        query.equalTo("seguidor", eu);
        query.equalTo("seguindo", alvo);
        const registro = await query.first();
        if (registro) await registro.destroy();
        setSeguindo(false);
      } else {
        // Seguir
        const Follow = Parse.Object.extend("Follow");
        const novoFollow = new Follow();
        novoFollow.set("seguidor", eu);
        novoFollow.set("seguindo", alvo);

        // ACL: apenas o seguidor pode deletar, todos podem ler
        const acl = new Parse.ACL();
        acl.setPublicReadAccess(true);
        acl.setWriteAccess(eu, true);
        novoFollow.setACL(acl);

        await novoFollow.save();
        setSeguindo(true);
      }
    } catch (e) {
      console.error("Erro ao seguir/deixar de seguir:", e);
    } finally {
      setSalvando(false);
    }
  }

  return { seguindo, carregando, salvando, toggleFollow };
}

// ─── Componente de botão pronto para usar ───────────────────────────────────
//
// Exemplo de uso na página de perfil de outro usuário:
//
//   import { BotaoSeguir } from "@/hooks/useFollow";
//   <BotaoSeguir usuarioAlvoId={perfilUserId} />
//

import styles from "@/styles/perfil.module.css";

export function BotaoSeguir({ usuarioAlvoId }) {
  const { seguindo, carregando, salvando, toggleFollow } = useFollow(usuarioAlvoId);
  const eu = Parse.User.current();

  // Não exibe o botão para o próprio usuário
  if (!eu || eu.id === usuarioAlvoId) return null;

  if (carregando) {
    return <button className={styles.btnSeguirEsq} disabled>...</button>;
  }

  return (
    <button
      className={`${styles.btnSeguir} ${seguindo ? styles.btnSeguindo : ""}`}
      onClick={toggleFollow}
      disabled={salvando}
    >
      {salvando ? "..." : seguindo ? "Seguindo" : "Seguir"}
    </button>
  );
}