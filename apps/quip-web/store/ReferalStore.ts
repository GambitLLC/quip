import {defineStore} from "pinia";

type ReferralStatus = 'Pending' | 'Completed' | 'Rejected'

interface Referral {
  date: Date,
  username: string,
  amountEarned: number,
  status: ReferralStatus
}

interface ReferralStore {
  referrals: Referral[],
  totalEarned: number,
  totalReferrals: number,
  referralLink: string,
}

const useReferral = defineStore('referrals', {
  state: (): ReferralStore => {
    return {
      referrals: [
        { date: new Date('2021-01-01'), username: 'bendgk', amountEarned: 0.0001, status: 'Completed' },
        { date: new Date('2021-01-01'), username: 'bendgk', amountEarned: 0.0001, status: 'Completed' },
        { date: new Date('2021-01-01'), username: 'bendgk', amountEarned: 0.0001, status: 'Completed' },
        { date: new Date('2021-01-01'), username: 'bendgk', amountEarned: 0.0001, status: 'Completed' },
        { date: new Date('2021-01-01'), username: 'bendgk', amountEarned: 0.0001, status: 'Completed' },
        { date: new Date('2021-01-01'), username: 'bendgk', amountEarned: 0.0001, status: 'Completed' },
        { date: new Date('2021-01-01'), username: 'bendgk', amountEarned: 0.0001, status: 'Completed' },
        { date: new Date('2021-01-01'), username: 'bendgk', amountEarned: 0.0001, status: 'Completed' },
        { date: new Date('2021-01-01'), username: 'bendgk', amountEarned: 0.0001, status: 'Completed' },
        { date: new Date('2021-01-01'), username: 'bendgk', amountEarned: 0.0001, status: 'Completed' },
        { date: new Date('2021-01-01'), username: 'bendgk', amountEarned: 0.0001, status: 'Completed' },
        { date: new Date('2021-01-01'), username: 'bendgk', amountEarned: 0.0001, status: 'Completed' },
        { date: new Date('2021-01-01'), username: 'bendgk', amountEarned: 0.0001, status: 'Completed' },
        { date: new Date('2021-01-01'), username: 'bendgk', amountEarned: 0.0001, status: 'Completed' },
        { date: new Date('2021-01-01'), username: 'bendgk', amountEarned: 0.0001, status: 'Completed' },
        { date: new Date('2021-01-01'), username: 'bendgk', amountEarned: 0.0001, status: 'Completed' },
        { date: new Date('2021-01-01'), username: 'bendgk', amountEarned: 0.0001, status: 'Completed' },
        { date: new Date('2021-01-01'), username: 'bendgk', amountEarned: 0.0001, status: 'Completed' },
        { date: new Date('2021-01-01'), username: 'bendgk', amountEarned: 0.0001, status: 'Completed' },
        { date: new Date('2021-01-01'), username: 'bendgk', amountEarned: 0.0001, status: 'Completed' },
        { date: new Date('2021-01-01'), username: 'bendgk', amountEarned: 0.0001, status: 'Completed' },
        { date: new Date('2021-01-01'), username: 'bendgk', amountEarned: 0.0001, status: 'Completed' },
        { date: new Date('2021-01-01'), username: 'bendgk', amountEarned: 0.0001, status: 'Completed' },
      ],
      totalEarned: 0,
      totalReferrals: 0,
      referralLink: 'quip.gg/r/bendgk'
    }
  },
  actions: {

  }
})

export {
  Referral,
  ReferralStatus,
  useReferral
}

