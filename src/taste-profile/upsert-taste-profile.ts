"use server"

import { Playlist, Song } from '@prisma/client'
import { Ok, unwrap, map, mapAsync, isErr } from '@/models/result';
import { AuthenticatedUser } from '@/utils/auth-utils';
import PrismaClientSingleton from '@/clients/prisma-client';
import SupaBaseClientSingleton from '@/clients/supabase-client';
import PlaylistObjectSimplified = SpotifyApi.PlaylistObjectSimplified;
import { getAllUserPlaylists, getAllPlaylistTracks } from './utils/spotify-utils';
import { getOrAddSong } from '@/utils/prisma-utils';
import { generateEmbeddings, EmbeddedSong } from '@/utils/embeddings-utils';

const prisma = PrismaClientSingleton.getInstance();
const supabase = SupaBaseClientSingleton.getInstance();

type PlaylistWithSongs = Playlist & { songs: Song[] };
type ProfileUpdates = { updatedPlaylists: Playlist[], newPlaylists: PlaylistObjectSimplified[], deletedPlaylists: Playlist[] };


export const upsertUserProfile = async (user: AuthenticatedUser) => {
    const playlists: PlaylistWithSongs[] = await prisma.playlist.findMany({
        where: { userId: user.id },
        include: { songs: true }
    });

    const spotifyPlaylists = await getAllUserPlaylists(user);    
    const profileUpdates = await mapAsync(
        spotifyPlaylists,
        async (spotifyPlaylists) => getProfileUpdates(spotifyPlaylists, playlists)
    );

    const updatedPlaylistsSongs = await mapAsync(
        profileUpdates,
        async (profileUpdates) => getUpdatedSongs(user, profileUpdates)
    );
        
    const songEmbeddings = await mapAsync(
        updatedPlaylistsSongs,
        async (updatedPlaylistsSongs) => generateEmbeddings(updatedPlaylistsSongs)
    );
        
    return mapAsync(
        songEmbeddings,
        async (songEmbeddings) => insertSongEmbeddings(songEmbeddings)
    );

}


const getProfileUpdates = (
    spotifyPlaylists: PlaylistObjectSimplified[],
    playlists: Playlist[]) : ProfileUpdates => {
        
    let updatedPlaylists: Playlist[] = []
    let newPlaylists: PlaylistObjectSimplified[] = [];
    let deletedPlaylists: Playlist[] = [];

    playlists.forEach((playlist) => { 
        const spotifyPlaylist = spotifyPlaylists.find((spotifyPlaylist) => spotifyPlaylist.id === playlist.id);

        if (!spotifyPlaylist) {                 // in db but not in spotify
            deletedPlaylists.push(playlist);
            return;
        } 

        // in both, but snapshot id is different (updated)
        const spotifyPlaylistUpdated = spotifyPlaylist.snapshot_id !== playlist.snapshotId;
        if (spotifyPlaylistUpdated) {
            updatedPlaylists.push(playlist);
        }
    });

    spotifyPlaylists.forEach((spotifyPlaylist) => {
        const playlist = playlists.find((playlist) => playlist.id === spotifyPlaylist.id);

        if (!playlist) {                        // in spotify but not in db
            newPlaylists.push(spotifyPlaylist);
        }
    });

    return { updatedPlaylists, newPlaylists, deletedPlaylists };
}


const getUpdatedSongs = async (user: AuthenticatedUser, profileUpdates: ProfileUpdates) => {
    const newPlaylistsSongs = await Promise.all(profileUpdates.newPlaylists.map((newPlaylist) => handleNewPlaylist(user, newPlaylist)));
    const updatedPlaylistsSongs = await Promise.all(profileUpdates.updatedPlaylists.map((updatedPlaylist) => handleUpdatedPlaylist(updatedPlaylist)));
    const deletedPlaylistsSongs = await Promise.all(profileUpdates.deletedPlaylists.map((deletedPlaylist) => hanldeDeletedPlaylist(deletedPlaylist)));

    const songIds = new Set<string>();
    for (const playlistsSongs of [newPlaylistsSongs, updatedPlaylistsSongs, deletedPlaylistsSongs]) {
        playlistsSongs.forEach(
            (playlistSongs) => map(
                    playlistSongs, 
                    (playlistSongs) => playlistSongs.forEach((songId) => songIds.add(songId))
                )
        );
    }
    
    return Array.from(songIds)
}


const handleNewPlaylist = async (user: AuthenticatedUser, newPlaylist: PlaylistObjectSimplified) => {    
    const spotifySongs = await getAllPlaylistTracks(newPlaylist.id); 
    
    // get playlist songs from db or add them if they don't exist
    const songsResult = await mapAsync(
        spotifySongs, 
        async (songs) => Promise.all(songs.map(getOrAddSong))
    );

    if (isErr(songsResult)) {
        return songsResult;
    }

    const songs = unwrap(songsResult).filter(song => song) as Song[];
    await prisma.playlist.create({
        data: {
            id: newPlaylist.id,
            name: newPlaylist.name,
            description: newPlaylist.description,
            snapshotId: newPlaylist.snapshot_id,
            userId: user.id,
            songs: {
                connect: songs.map(song => ({ id: song.id }))
            }
        }
    });

    return Ok(songs.map(song => song.id));
}


const handleUpdatedPlaylist = async (updatedPlaylist: Playlist) => {
    const spotifySongsResult = await getAllPlaylistTracks(updatedPlaylist.id);
    if (isErr(spotifySongsResult)) {
        return spotifySongsResult;
    }
    const spotifySongs = unwrap(spotifySongsResult);
    const currentSongs = await prisma.song.findMany({
        where: { 
            playlists: { some: { id: updatedPlaylist.id } }
        }
    });    

    const addedSongs = spotifySongs.filter((spotifySong) => { 
        return !currentSongs.find((currentSong) => currentSong.id === spotifySong?.track?.id);
    }).map((spotifySong) => spotifySong.track?.id);

    const deletedSongs = currentSongs.filter((currentSong) => { 
        return !spotifySongs.find((spotifySong) => spotifySong?.track?.id === currentSong.id);
    }).map((currentSong) => currentSong.id);
    
    return Ok(addedSongs.concat(deletedSongs).filter(song => song) as string[]);
}


const hanldeDeletedPlaylist = async (deletedPlaylist: Playlist) => {
    const songs = await prisma.song.findMany({
        where: { 
            playlists: { some: { id: deletedPlaylist.id } }
        }
    }); 
    
    await prisma.playlist.delete({ where: { id: deletedPlaylist.id } });

    return Ok(songs.map(song => song.id));
}


const insertSongEmbeddings = async (embeddedSongs: EmbeddedSong[]) => {
    for (const embeddedSong of embeddedSongs) {
        const { data: existingSong } = await supabase.from('songs')
                                            .select('id')
                                            .eq('id', embeddedSong.songId);
        if (existingSong) {
            await supabase.from('songs')
                            .update({ embedding: embeddedSong.embedding })
                            .eq('id', embeddedSong.songId);
        }
    }
}
