import { createVuetify, ThemeDefinition } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const quipThemeLight: ThemeDefinition = {
  dark: false,
  colors: {
    primary: '#AE50FD',
    background: '#F0F9FF',
    white: '#FFFFFF',
    black: '#000000',
    jetblack: '#14171F',
    'green-dark': '#AAE9AB',
    'green-light': '#C7F4C2',
    'purple-dark': '#C6C3FC',
    'purple-light': '#ECEBFF',
    'blue-dark': '#9BE9F2',
    'blue-light': '#C2F1F4',
    'border-grey': '#B8CEDD',
    'grey-light': '#fefefe'
  }
}

export default defineNuxtPlugin(nuxtApp => {
  const vuetify = createVuetify({
    ssr: true,
    components,
    directives,
    theme: {
      defaultTheme: 'quipThemeLight',
      themes: {
        quipThemeLight
      }
    },
    display: {
      mobileBreakpoint: 'md',
    }
  })

  nuxtApp.vueApp.use(vuetify)
})
