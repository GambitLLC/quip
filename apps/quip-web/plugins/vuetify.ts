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
    'jetblack-light': '#292930',
    'green-dark': '#AAE9AB',
    'green-light': '#C7F4C2',
    'green-bullet': '#AAE9AB',
    'green-bullet-accent': '#B8FAE2',
    'purple-dark': '#C6C3FC',
    'purple-light': '#ECEBFF',
    'purple-bullet': '#5956E9',
    'purple-bullet-accent': '#FAB8C4',
    'blue-dark': '#9BE9F2',
    'blue-light': '#C2F1F4',
    'blue-bullet': '#9BE9F2',
    'blue-bullet-accent': '#F1FAB8',
    'border-grey': '#B8CEDD',
    'secondary-grey': '#98A7B1',
    'grey-light': '#fefefe',
    'grey-dark': '#6C6D71',
    'gold': '#FFBB55',
    'red': '#DC3C2D',
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
