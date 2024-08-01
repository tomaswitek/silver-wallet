/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_NETWORK_TYPE: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
