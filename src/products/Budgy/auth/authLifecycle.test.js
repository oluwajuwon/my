import { nextAuthSession } from "./authLifecycle";

const session = (userId, token) => ({ user: { id: userId }, access_token: token });

it("does not replace authenticated app state for a token refresh", () => {
  const current = session("member-1", "old");
  expect(nextAuthSession(current, "TOKEN_REFRESHED", session("member-1", "new"))).toBe(current);
});

it("does not treat a repeated same-user SIGNED_IN event as a fresh login", () => {
  const current = session("member-1", "old");
  expect(nextAuthSession(current, "SIGNED_IN", session("member-1", "new"))).toBe(current);
});

it("changes protected state for real access changes", () => {
  const current = session("member-1", "old");
  expect(nextAuthSession(current, "SIGNED_OUT", null)).toBeNull();
  expect(nextAuthSession(current, "SIGNED_IN", session("member-2", "new")).user.id).toBe("member-2");
});
