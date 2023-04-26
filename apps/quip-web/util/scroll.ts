import {useWindowScroll} from "@vueuse/core";

function useScroll() {
  const { x, y } = useWindowScroll()

  const isScrolled = computed(() => {
    return y.value > 0
  })

  return { x, y, isScrolled }
}

export {
  useScroll
}
