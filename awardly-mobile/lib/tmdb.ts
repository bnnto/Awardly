const BASE_URL = process.env.EXPO_PUBLIC_TMDB_BASE_URL ?? 'https://api.themoviedb.org/3';
const API_KEY  = process.env.EXPO_PUBLIC_TMDB_API_KEY ?? '';

async function fetchTMDB(endpoint: string, params: Record<string, string> = {}) {
  const queryParams = new URLSearchParams({
    api_key: API_KEY,
    language: 'pt-BR',
    ...params,
  }).toString();

  const url = `${BASE_URL}${endpoint}?${queryParams}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erro TMDB: ${res.status}`);
  return res.json();
}

export const getFilme          = (id: string | number) => fetchTMDB(`/movie/${id}`);
export const getFilmeCreditos  = (id: string | number) => fetchTMDB(`/movie/${id}/credits`);
export const getFilmeImagens   = (id: string | number) => fetchTMDB(`/movie/${id}/images`, {
  include_image_language: 'en,null',
});
export const getPessoaCreditos = (id: string | number) => fetchTMDB(`/person/${id}/movie_credits`);

export const getPessoa = async (id: string | number) => {
  const ptBR = await fetchTMDB(`/person/${id}`);
  if (ptBR.biography) return ptBR;
  const en = await fetchTMDB(`/person/${id}`, { language: 'en-US' });
  return { ...ptBR, biography: en.biography };
};

export const getImageURL = (path: string | null | undefined, tamanho = 'w500'): string | null => {
  if (!path) return null;
  const base = process.env.EXPO_PUBLIC_TMDB_IMAGE_BASE ?? 'https://image.tmdb.org/t/p';
  return `${base}/${tamanho}${path}`;
};