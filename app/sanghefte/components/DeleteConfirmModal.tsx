import { Button } from "../../components/Button";
import { Modal } from "../../components/Modal";

type DeleteConfirmModalProps = {
  isOpen: boolean;
  pamphletName: string;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteConfirmModal({
  isOpen,
  pamphletName,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Slett Sanghefte">
      <p className="text-amber-900 mb-6">
        Er du sikker på at du vil slette{" "}
        <span className="font-medium">"{pamphletName}"</span>? Denne handlingen
        kan ikke angres.
      </p>

      <div className="flex gap-2">
        <Button variant="danger" onClick={handleConfirm} className="flex-1">
          Slett
        </Button>
        <Button variant="ghost" onClick={onClose} className="flex-1">
          Avbryt
        </Button>
      </div>
    </Modal>
  );
}
