/*
  Warnings:

  - The primary key for the `Playlist` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Playlist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    CONSTRAINT "Playlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Playlist" ("id", "name", "snapshotId", "userId") SELECT "id", "name", "snapshotId", "userId" FROM "Playlist";
DROP TABLE "Playlist";
ALTER TABLE "new_Playlist" RENAME TO "Playlist";
CREATE TABLE "new__PlaylistToSong" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_PlaylistToSong_A_fkey" FOREIGN KEY ("A") REFERENCES "Playlist" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PlaylistToSong_B_fkey" FOREIGN KEY ("B") REFERENCES "Song" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new__PlaylistToSong" ("A", "B") SELECT "A", "B" FROM "_PlaylistToSong";
DROP TABLE "_PlaylistToSong";
ALTER TABLE "new__PlaylistToSong" RENAME TO "_PlaylistToSong";
CREATE UNIQUE INDEX "_PlaylistToSong_AB_unique" ON "_PlaylistToSong"("A", "B");
CREATE INDEX "_PlaylistToSong_B_index" ON "_PlaylistToSong"("B");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
