import PrismaClientSingleton from "@/clients/prisma-client"
import PlaylistTrackObject = SpotifyApi.PlaylistTrackObject;
import { Ok } from "@/models/result";

const prisma = PrismaClientSingleton.getInstance();
export const getOrAddSong = async (song: PlaylistTrackObject) => {
    if (!song.track) {
        return;
    }

    const dbSong = await prisma.song.findUnique({
        where: {
            id: song.track?.id
        }
    });

    if (dbSong) {
        return dbSong;
    }

    const artists = await Promise.all(song.track.artists.map(getOrAddArtist));
    return prisma.song.create({
        data: {
            id: song.track?.id,
            title: song.track?.name,
            artists: {
                connect: artists.map(artist => ({ id: artist.id }))
            }
        }
    });
}

export const getOrAddArtist = async (artist: SpotifyApi.ArtistObjectSimplified) => {
    const dbArtist = await prisma.artist.findUnique({
        where: {
            id: artist.id
        }
    });

    if (dbArtist) {
        return dbArtist;
    }

    return prisma.artist.create({
        data: {
            id: artist.id,
            name: artist.name
        }
    });
}

export const updateLastUpdated = async (userId: string) => {
    const result = await prisma.user.update({
        where: { id: userId },
        data: { lastUpdated: new Date() }
    });
}