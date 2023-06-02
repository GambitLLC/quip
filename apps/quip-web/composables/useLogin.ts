import { LoginEvent } from "~/plugins/magic.client";

export const useLogin = (): ((email: string) => LoginEvent) => {
  const { $login }: {$login: ((email: string) => LoginEvent)} = useNuxtApp()
  return $login
}
