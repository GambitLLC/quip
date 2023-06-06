import { useEventListener, useWindowScroll } from "@vueuse/core";

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

function disableScroll() {
  const wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';

  function preventDefault(e: Event) {
    e.preventDefault();
  }

  function preventDefaultForScrollKeys(e: KeyboardEvent) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
    }
  }

  //@ts-ignore
  useEventListener('DOMMouseScroll', preventDefault, false) // older FF
  //@ts-ignore
  useEventListener(wheelEvent, preventDefault, { passive: false })
  useEventListener('touchmove', preventDefault, { passive: false })
  useEventListener('keydown', preventDefaultForScrollKeys, { passive: false })
}

export {
  useScroll,
  scrollIntoViewWithOffset,
  disableScroll
}
