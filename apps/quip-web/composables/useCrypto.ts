import { Crypto } from "~/plugins/magic.client";

export const useCrypto = (): Crypto => {
  const { $crypto }: {$crypto: Crypto} = useNuxtApp()
  $crypto.init()
  return $crypto
}
