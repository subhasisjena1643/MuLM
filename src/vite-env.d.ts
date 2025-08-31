/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_DEV_MODE: string
  readonly VITE_DEBUG_LOGGING: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
