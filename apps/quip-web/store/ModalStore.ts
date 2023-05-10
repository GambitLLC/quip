import {defineStore} from "pinia";
import {Ref, ref} from "vue";

const modals = ["AvatarCreator", "CloseAccount", "Login"] as const
type Modal = typeof modals[number]

interface ModalStore {
  modal: Modal | null,
}

const useModal = defineStore('modal', {
  state: (): ModalStore => {
    return {
      modal: null,
    }
  },
  actions: {
    open(modal: Modal) {
      this.modal = modal
    },
    close() {
      this.modal = null
    }
  }
})

export {
  Modal,
  useModal
}

