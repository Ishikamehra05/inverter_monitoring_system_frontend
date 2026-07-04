"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useCreatePlant, useUpdatePlant } from "@/hooks/api/usePlants";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import dynamic from "next/dynamic";

type Plant = {
  id: string;
  name: string;
  type: string;
  installed: string;
  kwp: string;
  price: string;
  address: string;
  longitude: string;
  latitude: string;
};

interface Props {
  open: boolean;
  onClose: () => void;
  plant?: Plant | null;
}

export default function AddPlantDrawer({ open, onClose, plant }: Props) {
  const createPlant = useCreatePlant();
  const [mapOpen, setMapOpen] = useState(false);
  const updatePlant = useUpdatePlant();
  const searchParams = useSearchParams();
  const selectedEndUserId = searchParams.get("userid");
  const serviceParams = selectedEndUserId
    ? {
        fromService: true,
        targetEndUserId: selectedEndUserId,
      }
    : undefined;
  const initialForm = {
    plantName: "",
    installedDate: "",
    kwp: "",
    price: "",
    plantType: "On Grid",
    longitude: "",
    latitude: "",
    address: "",
  };

  const [form, setForm] = useState(initialForm);

  const LocationPicker = dynamic(() => import("./LocationPickerModal"), {
    ssr: false,
  });
  // const handleSubmit = async () => {
  //   try {
  //     await createPlant.mutateAsync({
  //       plantName: form.plantName,
  //       installedDate: form.installedDate,
  //       kwp: Number(form.kwp),
  //       price: Number(form.price),
  //       priceUnit: "₹ / kWh",
  //       plantType: form.plantType,
  //       longitude: form.longitude || undefined,
  //       latitude: form.latitude || undefined,
  //       address: form.address || undefined,
  //     });

  //     setForm(initialForm); // reset form
  //     onClose();

  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  const handleSubmit = async () => {
    // Validation
    if (!form.plantName.trim()) {
      toast.error("Plant name is required.");
      return;
    }

    if (!form.installedDate) {
      toast.error("Installation date is required.");
      return;
    }

    if (!form.plantType) {
      toast.error("Please select a plant type.");
      return;
    }

    if (!form.kwp || Number(form.kwp) <= 0) {
      toast.error("Please enter a valid KWP value.");
      return;
    }

    if (!form.price || Number(form.price) <= 0) {
      toast.error("Please enter a valid electricity price.");
      return;
    }

    if (form.latitude && isNaN(Number(form.latitude))) {
      toast.error("Latitude must be a valid number.");
      return;
    }

    if (form.longitude && isNaN(Number(form.longitude))) {
      toast.error("Longitude must be a valid number.");
      return;
    }

    const payload = {
      plantName: form.plantName.trim(),
      installedDate: form.installedDate,
      kwp: Number(form.kwp),
      price: Number(form.price),
      priceUnit: "₹ / kWh",
      plantType: form.plantType,
      longitude: form.longitude || undefined,
      latitude: form.latitude || undefined,
      address: form.address.trim() || undefined,
      selectedEndUserId: selectedEndUserId || undefined,
    };

    try {
      if (plant?.id) {
        await updatePlant.mutateAsync({
          plantId: plant.id,
          payload,
          serviceParams,
        });

        toast.success("Plant updated successfully.");
      } else {
        await createPlant.mutateAsync(payload);

        toast.success("Plant created successfully.");
      }

      setForm(initialForm);
      onClose();
    } catch (error: any) {
      toast.error(error?.message || "Failed to save plant. Please try again.");
    }
  };

  const setField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (!plant) return;

    setForm({
      plantName: plant.name ?? "",
      installedDate: plant.installed ?? "",
      kwp: plant.kwp ?? "",
      price: plant.price ?? "",
      plantType: plant.type ?? "On Grid",
      longitude: plant.longitude ?? "",
      latitude: plant.latitude ?? "",
      address: plant.address ?? "",
    });
  }, [plant]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/30 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-full sm:w-172 bg-white text-black z-50 shadow-xl flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b border-(--border) w-full">
              {/* <h2 className="text-lg font-semibold w-full">Add Plant</h2> */}
              <h2>{plant ? "Edit Plant" : "Add Plant"}</h2>
              <div className="flex gap-3 w-full">
                <button
                  onClick={handleSubmit}
                  disabled={createPlant.isPending}
                  className="flex-1 bg-blue-500 text-white py-1 rounded disabled:opacity-50"
                >
                  {createPlant.isPending || updatePlant.isPending
                    ? "Saving..."
                    : plant
                      ? "Update"
                      : "Ok"}
                  {/* {createPlant.isPending ? "Saving..." : "Ok"} */}
                </button>

                <button
                  onClick={onClose}
                  className="flex-1 border border-gray-300 py-1 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="p-5 space-y-4 overflow-y-auto">
              {/* Plant Name */}
              <div>
                <label className="text-sm font-medium">
                  <span className="text-red-500">*</span> Plant Name :
                </label>
                <input
                  type="text"
                  value={form.plantName}
                  onChange={(e) => setField("plantName", e.target.value)}
                  placeholder="Please enter a group name"
                  className="w-full border border-(--border) rounded px-3 py-2 mt-1"
                />
              </div>

              {/* Installed Date */}
              <div>
                <label className="text-sm font-medium">
                  <span className="text-red-500">*</span> Installed date :
                </label>
                <input
                  type="date"
                  value={form.installedDate}
                  onChange={(e) => setField("installedDate", e.target.value)}
                  className="w-full border border-(--border) rounded px-3 py-2 mt-1"
                />
              </div>

              {/* kWp */}
              <div>
                <label className="text-sm font-medium">
                  <span className="text-red-500">*</span> kWp :
                </label>
                <input
                  type="number"
                  value={form.kwp}
                  onChange={(e) => setField("kwp", e.target.value)}
                  placeholder="Please enter the kWp"
                  className="w-full border border-(--border) rounded px-3 py-2 mt-1"
                />
              </div>

              {/* Price */}
              <div>
                <label className="text-sm font-medium">
                  <span className="text-red-500">*</span> Price :
                </label>
                <div className="flex mt-1">
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setField("price", e.target.value)}
                    placeholder="Please enter price"
                    className="flex-1 border border-(--border) rounded-l px-3 py-2"
                  />
                  <select className="border border-(--border) rounded-r px-3">
                    <option>₹ / kWh</option>
                  </select>
                </div>
              </div>

              {/* Plant Type */}
              <div>
                <label className="text-sm font-medium">
                  <span className="text-red-500">*</span> Plant Type :
                </label>
                <select
                  value={form.plantType}
                  onChange={(e) => setField("plantType", e.target.value)}
                  className="w-full border border-(--border) rounded px-3 py-2 mt-1"
                >
                  <option>On Grid</option>
                  <option>Hybrid</option>
                  <option>Off Grid</option>
                </select>
              </div>

              {/* Longitude Latitude */}

              <div className="space-y-3">
                <label className="text-sm font-medium">
                  Longitude & Latitude :
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    step="any"
                    disabled
                    value={form.latitude}
                    placeholder="Latitude"
                    onChange={(e) => setField("latitude", e.target.value)}
                    className="border border-(--border) rounded px-3 py-2 bg-gray-50"
                  />

                  <input
                    type="number"
                    step="any"
                    disabled
                    value={form.longitude}
                    placeholder="Longitude"
                    onChange={(e) => setField("longitude", e.target.value)}
                    className="border border-(--border) rounded px-3 py-2 bg-gray-50"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    navigator.geolocation.getCurrentPosition((position) => {
                      setField("latitude", position.coords.latitude.toString());
                      setField(
                        "longitude",
                        position.coords.longitude.toString(),
                      );
                    });
                  }}
                  className="px-3 py-2 rounded bg-blue-500 text-white text-sm hover:bg-blue-800 transition"
                >
                  Use Current Location
                </button>

                <LocationPicker
                  latitude={Number(form.latitude) || 0}
                  longitude={Number(form.longitude) || 0}
                  onChange={(lat, lng) => {
                    setField("latitude", lat.toString());
                    setField("longitude", lng.toString());
                  }}
                />
              </div>

              {/* Address */}
              <div>
                <label className="text-sm font-medium">Address :</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setField("address", e.target.value)}
                  placeholder="Please enter a detailed address"
                  className="w-full border border-(--border) rounded px-3 py-2 mt-1"
                />
              </div>

              {/* Add Inverter */}
              {/* <div>
                <button className="bg-blue-500 text-white px-4 py-2 rounded">
                  + Add Inverter
                </button>
              </div> */}

              {/* Upload */}
              {/* <div>
                <label className="text-sm font-medium">Upload picture :</label>
                <button className="block mt-2 bg-blue-500 text-white px-4 py-2 rounded">
                  Select picture
                </button>
              </div> */}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
