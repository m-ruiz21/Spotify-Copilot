import { AuthenticatedUser } from "@/utils/auth-utils";
import { Result, Ok, Err } from "@/models/result";
import PlaylistObjectSimplified = SpotifyApi.PlaylistObjectSimplified;
import SpotifyApiSingleton from "@/clients/spotify-client";
import { ErrorWithCode } from "@/models/error";

const spotifyApi = SpotifyApiSingleton.getInstance();
export const getAllUserPlaylists = async (user: AuthenticatedUser): Promise<Result<PlaylistObjectSimplified[], ErrorWithCode>> => {
    let offset = 0;
    const limit = 50; 
    let allPlaylists: PlaylistObjectSimplified[] = [];

    while (true) {
        const response = await spotifyApi.getUserPlaylists(user.id, { limit, offset});
        if (response.statusCode !== 200) {
            return Err({
                status: response.statusCode,
                message: "Error getting user playlists: " + response.body
            });
        }

        allPlaylists = allPlaylists.concat(response.body.items);
        if (!response.body.next) {
            break;
        }

        offset += limit;
    }

    return Ok(allPlaylists);
}


export const getAllPlaylistTracks = async (playlistId: string): Promise<Result<SpotifyApi.PlaylistTrackObject[], ErrorWithCode>> => {
    let offset = 0;
    const limit = 100; 
    let allTracks: SpotifyApi.PlaylistTrackObject[] = [];

    while (true) {
        const response = await spotifyApi.getPlaylistTracks(playlistId, { limit, offset});
        if (response.statusCode !== 200) {
            return Err({
                status: response.statusCode,
                message: "Error getting playlist tracks: " + response.body
            });
        }

        allTracks = allTracks.concat(response.body.items);
        if (!response.body.next) {
            break;
        }

        offset += limit;
    }

    return Ok(allTracks);
}