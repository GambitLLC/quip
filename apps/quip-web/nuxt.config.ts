// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  css: ['vuetify/lib/styles/main.sass', '@/styles/main.scss'],
  build: {
    transpile: ['vuetify'],
  },
  vite: {
    define: {
      'process.env.DEBUG': false,
    },
  },
  app: {
    head: {
      title: 'quip.gg',
      link: [
        //Preconnect to Google Fonts
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: "" },

        //Co Headline font; styles: 400, 700
        { rel: 'stylesheet', href: 'https://use.typekit.net/wxw4ukt.css' },

        //Lexend font; styles: 300
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Lexend:wght@300&display=swap' },
      ]
    }
  }
})
