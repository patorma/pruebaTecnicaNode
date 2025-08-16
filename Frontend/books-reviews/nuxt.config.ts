export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
  ],
  css: [
    '~/assets/scss/main.scss', // Importa tu archivo Sass principal
    '@fortawesome/fontawesome-svg-core/styles.css' // Estilos base de Font Awesome
  ],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@/assets/scss/_variables.scss" as *; @use "@/assets/scss/_mixins.scss" as *;' // Importa variables y mixins globalmente
        }
      }
    }
  },
  plugins: [
    '~/plugins/fontawesome.js',
    '~/plugins/axios.js' // Plugin para configurar Axios con interceptors
  ],
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api'
    }
  },
  nitro: {
    // Asegúrate de usar la fecha actual o una fecha futura cercana para mayor compatibilidad.
    compatibilityDate: '2025-08-15' // O la fecha actual, por ejemplo '2025-08-16'
  },
})