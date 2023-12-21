import { JWT } from "next-auth/jwt";
import { getUser } from "./prisma-utils";

export const refreshAccessToken = async (refreshToken: JWT) : Promise<JWT | null> => {
    const request = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
        },
        body: `grant_type=refresh_token&refresh_token=${refreshToken}`,
        cache: "no-cache"
    });

    if (request.ok) {
        return await request.json();
    }

    console.error(`Failed to refresh access token: ${request.status} ${request.statusText}`);
    return null;
}

type TokenInfo = {
    accessToken: string|null;
    refreshToken: string|null;
    accessTokenExpiresAt: number|null;
}


export const isExpired = (token: JWT) => {
    const now = Math.floor(Date.now() / 1000);
    const minUntilExpiration = token.accessTokenExpires - now;
    return minUntilExpiration < 10; 
} 
