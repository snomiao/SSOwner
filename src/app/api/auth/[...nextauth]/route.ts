import { authConfig } from "@/server/auth";
import NextAuth from "next-auth";
export const dynamic = 'force-dynamic'
const { handlers: { GET, POST } } = NextAuth(authConfig);
export { GET, POST }
