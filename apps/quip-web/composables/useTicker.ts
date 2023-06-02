import { Ticker } from "~/plugins/magic.client";

export const useTicker = (): Ticker => {
  const { $ticker }: {$ticker: Ticker} = useNuxtApp()
  $ticker.init()
  return $ticker
}
