// The demo account: a pretend patient for showing and building the signed-in app
// before real sign-in (Supabase) exists. Logging in with these details sets the
// `oneg_demo` cookie, and the proxy lets you into /[lang]/app while it's there.
// Nothing about it is secret: it's printed on the login page.

export const DEMO_COOKIE = "oneg_demo";

export const DEMO_ACCOUNT = {
  email: "demo@oneg.health",
  password: "oneg-demo",
  name: "Amina Hassan",
  firstName: "Amina",
  initials: "AH",
  family: "Hassan family",
};

const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function startDemoSession() {
  document.cookie = `${DEMO_COOKIE}=1; path=/; max-age=${MAX_AGE}; samesite=lax`;
}

export function endDemoSession() {
  document.cookie = `${DEMO_COOKIE}=; path=/; max-age=0; samesite=lax`;
}
