/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WOWSQL_URL?: string;
  readonly VITE_WOWSQL_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
