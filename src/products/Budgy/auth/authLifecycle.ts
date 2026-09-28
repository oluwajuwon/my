import { AuthChangeEvent, Session } from "@supabase/supabase-js";

export const nextAuthSession = (
  current: Session | null,
  event: AuthChangeEvent,
  incoming: Session | null,
): Session | null => {
  if (event === "SIGNED_OUT") return null;
  if ((event === "TOKEN_REFRESHED" || event === "SIGNED_IN") && current?.user.id === incoming?.user.id) {
    return current;
  }
  return incoming;
};
