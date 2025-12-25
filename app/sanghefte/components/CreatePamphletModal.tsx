import { useState } from "react";
import { Button } from "../../components/Button";
import { Modal } from "../../components/Modal";

type CreatePamphletModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
};

export function CreatePamphletModal({
  isOpen,
  onClose,
  onCreate,
}: CreatePamphletModalProps) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim());
      setName("");
      onClose();
    }
  };

  const handleClose = () => {
    setName("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nytt Sanghefte">
      <form onSubmit={handleSubmit}>
        <label
          className="block text-sm font-medium text-amber-800 mb-2"
          htmlFor="pamphlet-name"
        >
          Navn på sanghefte
        </label>
        <input
          id="pamphlet-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="F.eks. Julesanger 2024"
          className="w-full px-3 py-2 border border-amber-300 rounded bg-white text-amber-900 mb-4"
        />

        <div className="flex gap-2">
          <Button type="submit" variant="primary" className="flex-1">
            Opprett
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            className="flex-1"
          >
            Avbryt
          </Button>
        </div>
      </form>
    </Modal>
  );
}
