import {defineStore} from "pinia";
import {Avatar} from "~/components/util/Avatar/types";

interface User {
  name: string,
  email: string,
  avatar: Avatar,
}

interface UserStore {
  signedIn: boolean,
  user: User | null,
}

const useUser = defineStore('user', {
  state: (): UserStore => {
    return {
      signedIn: false,
      user: {
        name: 'bendgk',
        email: 'benkosten@gmail.com',
        avatar: {
          eye: 'Normal',
          face: "Light",
          hair: "04",
          mouth: "Normal_Smile",
          outfit: "01",
          accessory: "Earphone",
          color: "green",
        }
      }
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
