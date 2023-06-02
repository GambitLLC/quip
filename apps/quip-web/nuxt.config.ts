// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      RPC_URL: 'https://api.devnet.solana.com',
      WSS_BINANCE: 'wss://ws-api.binance.us:443/ws-api/v3',
      PK_MAGIC: 'pk_live_79385C11B09DBB96'

    }
  },
  nitro: {
    storage: {
      db: {
        driver: "azureCosmos",
        endpoint: "https://quip-db.documents.azure.com:443/",
        accountKey: "8ObmGZbuHC29WoFNWZUeuYDAosTU2mCyOzCnJ76tbzAW9Ht7BIfIXsqlMD2kHv4JXfMIJpuhIteAACDb16wI1g=="
      }
    }
  },
  css: ['vuetify/lib/styles/main.sass', '@/styles/main.scss'],
  build: {
    transpile: ['vuetify'],
  },
  vite: {
    define: {
      'process.env.DEBUG': false,
    },
  },
  modules: [
    '@pinia/nuxt',
  ],
  routeRules: {
    '/': { prerender: true },
    '/wallet': { ssr: false },
  },
  app: {
    head: {
      meta: [
        { name: 'theme-color', content: 'black-translucent'},
        // { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' },
      ],
      title: 'quip.gg',
      link: [
        //Preconnect to Google Fonts
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: "" },

        //Co Headline font; styles: 400, 700
        { rel: 'stylesheet', href: 'https://use.typekit.net/wxw4ukt.css' },

        //Lexend font; styles: 300, 400
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Lexend:wght@300;400&display=swap' },

        //Rubik font; styles: 400, 700
        {rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700&display=swap'}
      ]
    }
  }
})
