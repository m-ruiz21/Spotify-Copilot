"use server"

import SpotifyWebApi from 'spotify-web-api-node';
import { AUTH_URL } from '@auth/utils/spotify-auth';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET

class SpotifyApiSingleton {
    private static instance: SpotifyWebApi;

    private constructor() {}

    public static getInstance(): SpotifyWebApi {
        if (!SpotifyApiSingleton.instance) {
            SpotifyApiSingleton.instance = new SpotifyWebApi({
                clientId: SPOTIFY_CLIENT_ID!,
                clientSecret: SPOTIFY_CLIENT_SECRET!, 
                redirectUri: AUTH_URL 
            });
        }

        return SpotifyApiSingleton.instance;
    }
}

export default SpotifyApiSingleton;