import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// ---------- Navora Authentication Configuration ----------
export const { handlers, auth, signIn, signOut } = NextAuth({
  // ---------- Authentication Providers ----------
  providers: [Google],
});
