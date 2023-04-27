import {defineStore} from "pinia";

interface User {
  name: string,
  avatar: string,
}

interface UserStore {
  signedIn: boolean,
  user: User | null,
}

const useUser = defineStore('user', {
  state: (): UserStore => {
    return {
      signedIn: false,
      user: null
    }
  },
  actions: {
    signIn(user: User) {
      this.signedIn = true
      this.user = user
    },
    signOut() {
      this.signedIn = false
      this.user = null
    },
  },
})

export {
  User,
  useUser
}
