"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { BackLink } from "../../components/BackLink";
import { Button } from "../../components/Button";
import { Modal } from "../../components/Modal";
import { LIMITS } from "../../config/constants";
import { CreatePamphletModal } from "../components/CreatePamphletModal";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";
import { ProgressBar } from "../components/ProgressBar";
import { SongCard } from "../components/SongCard";
import { demoSongs } from "../demoSongs";
import { pamphletStorage } from "../storage";
import type { Song, StoredPamphlet } from "../types";
import { encodeSongs } from "../utils";

export default function RedigerPage() {
  const router = useRouter();
  const [pamphlets, setPamphlets] = useState<StoredPamphlet[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<StoredPamphlet | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);

  const selectedPamphlet = pamphlets.find((p) => p.id === selectedId) || null;

  // Load pamphlets on mount
  useEffect(() => {
    const loaded = pamphletStorage.getPamphlets();
    setPamphlets(loaded);
  }, []);

  // Auto-save with 300ms debounce
  useEffect(() => {
    if (!selectedPamphlet) return;

    const timer = setTimeout(() => {
      pamphletStorage.savePamphlet(selectedPamphlet);
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedPamphlet]);

  // Calculate current encoded length
  const currentLength = selectedPamphlet
    ? encodeSongs(selectedPamphlet.songs).length +
      `${window.location.origin}/sanghefte?data=`.length
    : 0;

  const handleCreatePamphlet = (name: string) => {
    const newPamphlet = pamphletStorage.createPamphlet(name);
    setPamphlets([...pamphlets, newPamphlet]);
    setSelectedId(newPamphlet.id);
  };

  const handleLoadExamples = () => {
    const examplePamphlet = pamphletStorage.createPamphlet("Eksempelsanger");
    const withSongs = { ...examplePamphlet, songs: demoSongs };
    pamphletStorage.savePamphlet(withSongs);
    setPamphlets([...pamphlets, withSongs]);
    setSelectedId(withSongs.id);
  };

  const handleDeletePamphlet = (id: string) => {
    pamphletStorage.deletePamphlet(id);
    const updated = pamphlets.filter((p) => p.id !== id);
    setPamphlets(updated);
    if (selectedId === id) {
      setSelectedId(updated.length > 0 ? updated[0].id : null);
    }
    setDeleteTarget(null);
  };

  const handleRenamePamphlet = (id: string, newName: string) => {
    if (!newName.trim()) {
      setEditingNameId(null);
      return;
    }

    const pamphlet = pamphlets.find((p) => p.id === id);
    if (!pamphlet) return;

    const updated = { ...pamphlet, name: newName.trim() };
    pamphletStorage.savePamphlet(updated);
    setPamphlets(pamphlets.map((p) => (p.id === id ? updated : p)));
    setEditingNameId(null);
  };

  const handleUpdateSong = (index: number, song: Song) => {
    if (!selectedPamphlet) return;

    const updatedSongs = [...selectedPamphlet.songs];
    updatedSongs[index] = song;
    const updated = { ...selectedPamphlet, songs: updatedSongs };
    setPamphlets(pamphlets.map((p) => (p.id === selectedId ? updated : p)));
  };

  const handleRemoveSong = (index: number) => {
    if (!selectedPamphlet) return;

    const updatedSongs = selectedPamphlet.songs.filter((_, i) => i !== index);
    const updated = { ...selectedPamphlet, songs: updatedSongs };
    pamphletStorage.savePamphlet(updated);
    setPamphlets(pamphlets.map((p) => (p.id === selectedId ? updated : p)));
  };

  const handleAddSong = () => {
    if (!selectedPamphlet) return;

    const newSong: Song = { title: "", lyrics: "" };
    const updated = {
      ...selectedPamphlet,
      songs: [...selectedPamphlet.songs, newSong],
    };
    pamphletStorage.savePamphlet(updated);
    setPamphlets(pamphlets.map((p) => (p.id === selectedId ? updated : p)));
  };

  const handleGenerate = async () => {
    if (!selectedPamphlet || selectedPamphlet.songs.length === 0) return;

    const encoded = encodeSongs(selectedPamphlet.songs);
    const url = `${window.location.origin}/sanghefte?data=${encoded}`;

    setShareUrl(url);

    if (url.length > LIMITS.qrCapacity) {
      setQrError(
        `Sangheftet er for stort for QR-kode (${url.length} tegn, maks ${LIMITS.qrCapacity}). Bruk lenken i stedet.`,
      );
      setQrCodeUrl("");
      setShowQR(true);
      return;
    }

    setQrError(null);
    try {
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
      });
      setQrCodeUrl(qrDataUrl);
      setShowQR(true);
    } catch {
      setQrError("Kunne ikke generere QR-kode.");
      setShowQR(true);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silently fail
    }
  };

  const handleOpenPamphlet = () => {
    if (!selectedPamphlet || selectedPamphlet.songs.length === 0) return;
    const encoded = encodeSongs(selectedPamphlet.songs);
    router.push(`/sanghefte?data=${encoded}`);
  };

  return (
    <div className="min-h-screen bg-amber-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6">
          <BackLink className="mb-2" />
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-amber-900">
            Sanghefte 2.0 - Rediger
          </h1>
        </header>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left sidebar - Pamphlet list */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <h2 className="text-sm font-semibold text-amber-800 mb-3">
              Dine Sanghefter
            </h2>

            {pamphlets.length === 0 ? (
              <p className="text-amber-700 text-sm mb-4">
                Ingen sanghefter ennå
              </p>
            ) : (
              <ul className="space-y-1 mb-4">
                {pamphlets.map((pamphlet) => (
                  <li key={pamphlet.id}>
                    {editingNameId === pamphlet.id ? (
                      <input
                        type="text"
                        defaultValue={pamphlet.name}
                        onBlur={(e) =>
                          handleRenamePamphlet(pamphlet.id, e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleRenamePamphlet(
                              pamphlet.id,
                              e.currentTarget.value,
                            );
                          } else if (e.key === "Escape") {
                            setEditingNameId(null);
                          }
                        }}
                        className="w-full px-3 py-2 rounded border border-amber-300 bg-white text-amber-900"
                      />
                    ) : (
                      <div
                        className={`flex items-center justify-between px-3 py-2 rounded ${
                          pamphlet.id === selectedId
                            ? "bg-amber-600 text-white"
                            : "hover:bg-amber-100"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedId(pamphlet.id)}
                          className="flex-1 text-left"
                        >
                          <div className="font-medium truncate">
                            {pamphlet.name}
                          </div>
                          <div
                            className={`text-xs ${pamphlet.id === selectedId ? "text-amber-200" : "text-amber-600"}`}
                          >
                            {pamphlet.songs.length}{" "}
                            {pamphlet.songs.length === 1 ? "sang" : "sanger"}
                          </div>
                        </button>
                        <div className="flex gap-1 ml-2">
                          <button
                            type="button"
                            onClick={() => setEditingNameId(pamphlet.id)}
                            className={`p-1 rounded ${pamphlet.id === selectedId ? "hover:bg-amber-700" : "hover:bg-amber-200"}`}
                            title="Endre navn"
                          >
                            <span className="text-sm">✏️</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(pamphlet)}
                            className={`p-1 rounded ${pamphlet.id === selectedId ? "hover:bg-amber-700" : "hover:bg-red-100"}`}
                            title="Slett"
                          >
                            <span className="text-sm">🗑️</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}

            <div className="space-y-2">
              <Button
                variant="primary"
                size="sm"
                fullWidth
                onClick={() => setShowCreateModal(true)}
              >
                + Nytt Sanghefte
              </Button>
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                onClick={handleLoadExamples}
              >
                Last Inn Eksempler
              </Button>
            </div>
          </aside>

          {/* Right panel - Editor */}
          <main className="flex-1">
            {selectedPamphlet ? (
              <div className="bg-white rounded-lg shadow-lg border border-amber-200 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-serif font-bold text-amber-900">
                    Redigerer: {selectedPamphlet.name}
                  </h2>
                </div>

                {selectedPamphlet.songs.length === 0 ? (
                  <p className="text-amber-700 text-center py-8">
                    Ingen sanger ennå. Legg til en sang for å komme i gang.
                  </p>
                ) : (
                  <div className="space-y-4 mb-6">
                    {selectedPamphlet.songs.map((song, index) => (
                      <SongCard
                        key={`${selectedPamphlet.id}-${index}`}
                        song={song}
                        index={index}
                        onUpdate={(updated) => handleUpdateSong(index, updated)}
                        onRemove={() => handleRemoveSong(index)}
                      />
                    ))}
                  </div>
                )}

                <Button
                  variant="ghost"
                  onClick={handleAddSong}
                  className="w-full mb-6"
                >
                  + Legg Til Sang
                </Button>

                <div className="border-t border-amber-200 pt-4 mb-4">
                  <ProgressBar currentLength={currentLength} />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    onClick={handleGenerate}
                    disabled={selectedPamphlet.songs.length === 0}
                    className="flex-1"
                  >
                    Generer Sanghefte
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleOpenPamphlet}
                    disabled={selectedPamphlet.songs.length === 0}
                    className="flex-1"
                  >
                    Åpne Forhåndsvisning
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg border border-amber-200 p-8 text-center">
                <p className="text-amber-700 mb-4">
                  Velg et sanghefte fra listen, eller opprett et nytt.
                </p>
                <Button
                  variant="primary"
                  onClick={() => setShowCreateModal(true)}
                >
                  Opprett Nytt Sanghefte
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Create Modal */}
      <CreatePamphletModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreatePamphlet}
      />

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <DeleteConfirmModal
          isOpen={!!deleteTarget}
          pamphletName={deleteTarget.name}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => handleDeletePamphlet(deleteTarget.id)}
        />
      )}

      {/* QR Modal */}
      <Modal
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        title="Del Sanghefte"
      >
        {qrError && (
          <div className="mb-4 p-3 bg-amber-100 text-amber-800 rounded text-sm">
            {qrError}
          </div>
        )}

        {qrCodeUrl && !qrError && (
          <div className="flex justify-center mb-4">
            <Image
              src={qrCodeUrl}
              alt="QR-kode"
              width={250}
              height={250}
              unoptimized
            />
          </div>
        )}

        <p className="text-sm text-gray-600 mb-4 break-all">{shareUrl}</p>

        <div className="flex gap-2">
          <Button
            variant="primary"
            onClick={copyToClipboard}
            className="flex-1"
          >
            {copied ? "Kopiert!" : "Kopier Lenke"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => setShowQR(false)}
            className="flex-1"
          >
            Lukk
          </Button>
        </div>
      </Modal>
    </div>
  );
}
