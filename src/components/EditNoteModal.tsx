import {
  useState,
  useEffect,
  useCallback,
} from 'react';
import { IconTrash } from '@tabler/icons-react';

import { useModalInteraction } from '../hooks/useModalInteraction';
import Button from './Button';

const EditNoteModal = (
  {
    isOpen,
    onClose,
    onSave,
    initialNote,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onSave: (note: string) => void;
    initialNote: string;
  }
) => {
  const [note, setNote] = useState(initialNote);
  const { modalRef, handleBackdropClick } = useModalInteraction({
    isOpen,
    onClose,
  });

  useEffect(() => {
    setNote(initialNote);
  }, [initialNote]);

  const handleSave = useCallback(() => {
    onSave(note);
    onClose();
  }, [note, onSave, onClose]);

  const handleDelete = useCallback(() => {
    onSave('');
    onClose();
  }, [onSave, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={modalRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Edit Note</h2>
        <textarea
          className="w-full h-full p-2 border border-gray-300 rounded-md mb-4"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
          <Button variant="default" onClick={handleDelete}>
            <IconTrash className="mr-2" /> Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

EditNoteModal.displayName = 'EditNoteModal';

export default EditNoteModal;
