import NextAuth from 'next-auth'
import SpotifyProvider from 'next-auth/providers/spotify'
import { AUTH_URL } from '../utils/spotify-auth'
import { AdapterUser } from 'next-auth/adapters'
import { Session } from 'next-auth'
import { JWT } from 'next-auth/jwt'
import { refreshAccessToken, isExpired } from '../utils/auth-utils'
import { getUser, createUser } from '@auth/utils/prisma-utils'

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET

const handler = NextAuth({
    providers: [
        SpotifyProvider({
            clientId: SPOTIFY_CLIENT_ID!, 
            clientSecret: SPOTIFY_CLIENT_SECRET!,
            authorization: AUTH_URL
        })
    ],
    callbacks: {        
        async signIn({user, account, profile}) {
            const dbUser = await getUser(account?.userId as string);
            if (!dbUser) {       
                createUser({
                    id: account?.userId as string,
                    createdAt: new Date(),
                    lastUpdated: new Date()
                })
            }

            return true;    // bool representing user allowed to sign in 
        },
        async jwt({token, user, account, profile }) {            
            if (account && user){
                token.accessToken = account?.access_token as string
                token.refreshToken = account?.refresh_token as string
                token.accessTokenExpires = account?.expires_at as number * 1000 
            }
           
            if (!isExpired(token)) {
                return token;
            }
            
            const refreshedToken = await refreshAccessToken(token); 
            if (refreshedToken) {
                token.accessToken = refreshedToken.accessToken;
                token.refreshToken = refreshedToken.refreshToken;
                token.accessTokenExpires = refreshedToken.accessTokenExpires * 1000 + Date.now();
            }

            return token;
        },

        async session({ session, token, user} : { session: Session, token: JWT, user: AdapterUser}) {
            session.accessToken = token.accessToken;
            session.refreshToken = token.refreshToken;
            session.id = user.id;
            return session;
        },
    }
})

export { handler as GET, handler as POST }