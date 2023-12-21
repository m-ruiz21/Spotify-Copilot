import NextAuth, { DefaultSession } from "next-auth";

declare module 'next-auth' {
    interface Session extends DefaultSession{
        id: string;
        accessToken: string;
        refreshToken: string;
        accessTokenExpires: number;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        accessToken: string;
        refreshToken: string;
        accessTokenExpires: number;
    }
}