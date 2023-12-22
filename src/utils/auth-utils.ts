import { PrismaClient, Token, User } from '@prisma/client'
import { Result, Ok, Err, mapAsync, map } from '@/models/result';
import { ErrorWithCode } from '@/models/error'; 

type SpotifyToken = {
    access_token: string,
    token_type: string,
    scope: string,
    expires_in: number,
    refresh_token: string
}

export const refreshAccessToken = async (token: Token) : Promise<Result<Token, ErrorWithCode>> => {
    const request = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
        },
        body: `grant_type=refresh_token&refresh_token=${token.refreshToken}`,
        cache: "no-cache"
    });

    if (request.ok) {
        const spotify_token: SpotifyToken = await request.json();
        return Ok({
            ...token,
            token: spotify_token.access_token,
            refreshToken: spotify_token.refresh_token,
            expiresAt: Math.floor(Date.now() / 1000) + spotify_token.expires_in
        });
    }

    return Err(
        {
            status: request.status,
            message: request.statusText
        }
    );
}


export type AuthenticatedUser = User & {token: Token | null};
export const refreshUserAccess = async (user: AuthenticatedUser) : Promise<Result<AuthenticatedUser, ErrorWithCode>> => { 
    const prisma = new PrismaClient();

    if (!user.token) {
        return Err({status: 401, message: "User is not authenticated"});
    }    

    const newToken = await refreshAccessToken(user.token);
    const tokenId = user.token.id;
    
    const refreshResult = await mapAsync(newToken,
        async (token) => {
            const result: Token = await prisma.token.update({
                where: { id: tokenId},
                data: { token: token.token, refreshToken: token.refreshToken, expiresAt: token.expiresAt }
            });    

            return result;
        }
    )
    
    const newUser = map(refreshResult, 
        (token): AuthenticatedUser => {
            user.token = token;
            return user;
        }
    )

    return newUser;
}
