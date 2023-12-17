import SpotifyWebApi from "spotify-web-api-node";

const scopes = [
    "user-read-email",
    "user-top-read",
    "user-read-recently-played",
    "user-modify-playback-state",
    "playlist-modify-public",
    "playlist-modify-private"
].join(",");

const params = {
    scope: scopes,
};

const queryParamString = new URLSearchParams(params).toString();

const AUTH_URL = `https://accounts.spotify.com/authorize?` + queryParamString.toString();

export { AUTH_URL };