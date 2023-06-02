import { LogoutEvent } from "~/plugins/magic.client";

export const useLogout = (): (() => LogoutEvent) => {
  const { $logout }: {$logout: (() => LogoutEvent)} = useNuxtApp()
  return $logout
}
