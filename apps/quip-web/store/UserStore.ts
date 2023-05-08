import {defineStore} from "pinia";
import {Avatar} from "~/components/util/Avatar/types";

interface PersonalInfo {
  legalName: string,
  dob: Date,
  address: string,
}

interface User {
  name: string,
  email: string,
  avatar: Avatar,
  btcAddress: string,
  personalInfo: PersonalInfo,
}

interface UserStore {
  signedIn: boolean,
  user: User | null,
}

function getLang() {
  console.log(navigator)
  if (navigator.languages !== undefined)
    return navigator.languages[0];
  return navigator.language;
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
        },
        btcAddress: '3H7mh...FqEfW',
        personalInfo: {
          legalName: 'Benjamin Kosten',
          dob: new Date('1995-01-01'),
          address: '123 Fake Street, Fake City, Fake Country',
        },
      },
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
  useUser,
  getLang
}
