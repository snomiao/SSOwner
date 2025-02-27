import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, {
  type NextAuthConfig,
  type DefaultSession,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";
// import DiscordProvider from "next-auth/providers/discord";
// import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";

import { env } from "@/env";
import { db } from "@/server/db";
// import { DefaultSession } from "next-auth";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
    redirect: (args) => {
      console.log(args)
      return args.url
      // return 'https://calibre-snoauth.snomiao.dev/'
    }
  },
  cookies: {
    ...process.env.AUTH_HOST && {
      sessionToken: {
        options: {
          sameSite: false,
          domain: process.env.AUTH_HOST,
        }
      }
    }
  },
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    GithubProvider({
      clientId: env.AUTH_GITHUB_ID,
      clientSecret: env.AUTH_GITHUB_SECRET,
    }),
    // DiscordProvider({
    //   clientId: env.DISCORD_CLIENT_ID,
    //   clientSecret: env.DISCORD_CLIENT_SECRET,
    // }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
} satisfies NextAuthConfig;

// /**
//  * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
//  *
//  * @see https://next-auth.js.org/configuration/nextjs
//  */
// export const getServerAuthSession = () => getServerSession(authOptions);
export const { auth, signIn, signOut } = NextAuth(authConfig)