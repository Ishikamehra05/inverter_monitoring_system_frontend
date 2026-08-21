"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  device: {
    id: string;
    name: string;
  } | null;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
};

const EditInverterModal = ({
  open,
  device,
  onClose,
  onSubmit,
}: Props) => {
  const [name, setName] = useState("");

  useEffect(() => {
    setName(device?.name ?? "");
  }, [device]);

  if (!open || !device) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg bg-white rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-blue-600">
            Edit Inverter
          </h2>

          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded-md px-3 py-2 text-black"
        />

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="border px-4 py-2 rounded"
          >
            Cancel
          </button>

          <button
            onClick={() => onSubmit(name)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditInverterModal;