import {useWindowScroll} from "@vueuse/core";

function useScroll() {
  const { x, y } = useWindowScroll()

  const isScrolled = computed(() => {
    return y.value > 0
  })

  return { x, y, isScrolled }
}

function scrollIntoViewWithOffset(element?: HTMLElement | null, offset?: number) {
  if (!element) return
  if (offset === undefined) offset = 0

  const top = element.getBoundingClientRect().top + window.scrollY

  window.scrollTo({
    top: top - offset,
    behavior: "smooth",
  })
}

function onScroll(callback: (event: Event) => void) {
  onMounted(() => {
    window.addEventListener("scroll", callback)
  })

  onUnmounted(() => {
    window.removeEventListener("scroll", callback)
  })
}

export {
  useScroll,
  scrollIntoViewWithOffset,
  onScroll,
}
