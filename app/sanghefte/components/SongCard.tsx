import { Button } from "../../components/Button";
import type { Song } from "../types";

type SongCardProps = {
  song: Song;
  index: number;
  onUpdate: (song: Song) => void;
  onRemove: () => void;
};

export function SongCard({ song, index, onUpdate, onRemove }: SongCardProps) {
  return (
    <div className="bg-stone-100 border border-amber-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-amber-600 font-bold">{index + 1}.</span>
        <label className="sr-only" htmlFor={`song-title-${index}`}>
          Tittel
        </label>
        <input
          id={`song-title-${index}`}
          type="text"
          value={song.title}
          onChange={(e) => onUpdate({ ...song, title: e.target.value })}
          placeholder="Tittel"
          className="flex-1 px-3 py-2 border border-amber-300 rounded bg-white text-amber-900 font-medium"
        />
      </div>

      <label
        className="block text-sm text-amber-700 mb-1"
        htmlFor={`song-lyrics-${index}`}
      >
        Sangtekst
      </label>
      <textarea
        id={`song-lyrics-${index}`}
        value={song.lyrics}
        onChange={(e) => onUpdate({ ...song, lyrics: e.target.value })}
        placeholder="Skriv sangteksten her..."
        rows={6}
        className="w-full px-3 py-2 border border-amber-300 rounded bg-white text-amber-900 resize-y font-serif"
      />

      <div className="mt-3 flex justify-end">
        <Button variant="danger" size="sm" onClick={onRemove}>
          Fjern
        </Button>
      </div>
    </div>
  );
}
