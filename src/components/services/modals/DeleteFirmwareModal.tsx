type DeleteFirmwareModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
};

export default function DeleteFirmwareModal({
  open,
  onClose,
  onConfirm,
  loading,
}: DeleteFirmwareModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[380px] rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold">
          Delete Firmware
        </h2>

        <p className="mt-3 text-sm text-gray-600">
          Are you sure you want to delete this firmware package?
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="h-9 px-4 rounded border"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="h-9 px-4 rounded bg-red-500 text-white"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}