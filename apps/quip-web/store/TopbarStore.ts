import {defineStore} from "pinia";
import {Ref, ref} from "vue";

interface TopbarStore {
  homeRef: Ref<HTMLElement | null>,
  aboutRef: Ref<HTMLElement | null>,
  gamesRef: Ref<HTMLElement | null>,
  faqRef: Ref<HTMLElement | null>,
}

const useTopbar = defineStore('topbar', {
  state: (): TopbarStore => {
    return {
      homeRef: ref(null),
      aboutRef: ref(null),
      gamesRef: ref(null),
      faqRef: ref(null),
    }
  },
})

export {
  useTopbar
}
