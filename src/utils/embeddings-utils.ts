import OpenAiSingleton from '@/clients/openai-client';
import PrismaClientSingleton from '@/clients/prisma-client';

const openAi = OpenAiSingleton.getInstance();
const prisma = PrismaClientSingleton.getInstance();

export type EmbeddedSong = { songId: string, embedding: number[] };
export async function generateEmbeddings(songIds: string[]): Promise<EmbeddedSong[]> {
    const playlistStrings = await Promise.all(songIds.map((songId) => generatePlaylistString(songId)));
    const embeddings = await generateEmbedding(playlistStrings);

    return embeddings.map((embedding, index) => ({ songId: songIds[index], embedding: embedding.embedding }));
}


async function generatePlaylistString(songId: string) {
    const playlists = await prisma.playlist.findMany({
        where: { 
            songs: { some: { id: songId } }
        }
    });

    const playlistStrings = playlists.map((playlist) => playlist.name + ': ' + playlist.description);
    const playlistString = playlistStrings.join(', ');

    return playlistString;
}


async function generateEmbedding(playlistStrings: string[]) {
    const embeddingResponse = await openAi.embeddings.create({
        model: 'text-embedding-ada-002',
        input: playlistStrings,
    })

    const embeddings = embeddingResponse.data

    return embeddings;
} 