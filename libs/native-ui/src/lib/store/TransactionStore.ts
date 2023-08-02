import { create } from "zustand";

interface TransactionItem {
  address: string,
  timestamp: number,
  amount: number,
  priceInUSD: number,
}

interface TransactionDay {
  date: number,
  items: TransactionItem[],
}

interface TransactionStore {
  transactions: TransactionDay[],
}

const useTransactionStore = create<TransactionStore>((set) => ({
  transactions: [
    {
      items: [
        {
          address: "HJ7MqeXQL1MLfVEh4qZeUzExKg8RUS9Pxiu98oXruG6j",
          timestamp: 1627776000000,
          amount: 1.0,
          priceInUSD: 21.00
        },
        {
          address: "HJ7MqeXQL1MLfVEh4qZeUzExKg8RUS9Pxiu98oXruG6j",
          timestamp: 1627776000000,
          amount: -2.0,
          priceInUSD: 21.00
        }
      ],
      date: 1627776000000
    } as TransactionDay,
    {
      items: [
        {
          address: "HJ7MqeXQL1MLfVEh4qZeUzExKg8RUS9Pxiu98oXruG6j",
          timestamp: 1627776000000,
          amount: 1.0,
          priceInUSD: 21.00
        },
        {
          address: "HJ7MqeXQL1MLfVEh4qZeUzExKg8RUS9Pxiu98oXruG6j",
          timestamp: 1627776000000,
          amount: 2.0,
          priceInUSD: 21.00
        }
      ],
      date: 1627776000000
    } as TransactionDay,
    {
      items: [
        {
          address: "HJ7MqeXQL1MLfVEh4qZeUzExKg8RUS9Pxiu98oXruG6j",
          timestamp: 1627776000000,
          amount: 1.0,
          priceInUSD: 21.00
        },
        {
          address: "HJ7MqeXQL1MLfVEh4qZeUzExKg8RUS9Pxiu98oXruG6j",
          timestamp: 1627776000000,
          amount: 2.0,
          priceInUSD: 21.00
        }
      ],
      date: 1627776000000
    } as TransactionDay
  ]
}))

export {
  useTransactionStore,
  TransactionItem,
  TransactionDay,
  TransactionStore
}
