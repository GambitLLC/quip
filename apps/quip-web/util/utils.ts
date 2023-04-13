import {useDisplay} from "vuetify";

const isMobile = computed(() => {
  const display = useDisplay()
  return display.smAndDown.value
})

export {
  isMobile
}
