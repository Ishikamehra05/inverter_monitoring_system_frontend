"use client";
import { useState } from "react";
import { Pagination } from "../../pagination";
import { IoIosAdd, IoIosArrowUp } from "react-icons/io";
import AddInverterModal from "@/components/monitors/modals/AddInverterModal";
import EditInverterModal from "@/components/monitors/modals/EditInverterModal";
import DeleteInverterModal from "@/components/monitors/modals/DeleteInverterModal";
import { useRouter, useSearchParams } from "next/navigation";
import { navigateMonitor } from "@/utils/monitorNavigation";
import {
  useAddInverter,
  useEditDevice,
  useDeleteDevice,
  usePlantDevices,
} from "@/hooks/api/useDevices";
import { toast } from "sonner";
// ---------- Types ----------
export type Device = {
  id: string;
  name: string;
  type: string;
  sn: string;
  power: number;
  today: number;
  total: number;
  hours: number;
  online: boolean;
};

type SortKey = keyof Pick<
  Device,
  "name" | "type" | "sn" | "power" | "today" | "total" | "hours"
>;

type SortOrder = "asc" | "desc";
type SortIconProps = {
  column: SortKey;
  activeKey: SortKey;
  order: SortOrder;
};

type DeviceTabProps = {
  plantId: string;
};

type DeviceTableProps = {
  devices: Device[];
  onEdit: (deviceId: string, name: string) => void;
  onDelete: (deviceId: string) => void;
};

const SortIcon = ({ column, activeKey, order }: SortIconProps) => {
  if (activeKey !== column) {
    return (
      <span className="ml-1 text-gray-300">
        <IoIosArrowUp className="h-3 w-3" />
      </span>
    );
  }

  return (
    <span className="ml-1">
      <IoIosArrowUp
        className={`h-3 w-3 transition-transform ${
          order === "desc" ? "rotate-180" : ""
        }`}
      />
    </span>
  );
};

// ---------- Device Table ----------
const DeviceTable = ({ devices, onEdit, onDelete }: DeviceTableProps) => {
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const sortedDevices = [...devices].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];

    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    }

    return sortOrder === "asc"
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPlantId = searchParams.get("plantId");

  const handleDeviceClick = (deviceId: number | string) => {
    const numericDeviceId =
      typeof deviceId === "string" ? deviceId.replace("device-", "") : deviceId;

    const targetEndUserId = searchParams.get("targetEndUserId");

    let url = `/monitor/plants/plant-detail/device-detail?plantId=${currentPlantId}&deviceId=${numericDeviceId}`;

    if (targetEndUserId) {
      url += `&targetEndUserId=${targetEndUserId}` + `&fromService=true`;
    }

    navigateMonitor(router, searchParams, url);
  };
  return (
    <div className="mt-4 rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-md">
          <thead className="bg-gray-100 text-black sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2 text-left">Status</th>

              <th
                onClick={() => handleSort("name")}
                className="px-3 py-4 text-left cursor-pointer hover:bg-gray-200"
              >
                <div className="flex items-center gap-1 whitespace-nowrap">
                  <span>Name</span>
                  <SortIcon
                    column="name"
                    activeKey={sortKey}
                    order={sortOrder}
                  />
                </div>
              </th>

              <th
                onClick={() => handleSort("type")}
                className="px-3 py-4 text-left cursor-pointer hover:bg-gray-200"
              >
                <div className="flex items-center gap-1 whitespace-nowrap">
                  <span>Type</span>
                  <SortIcon
                    column="type"
                    activeKey={sortKey}
                    order={sortOrder}
                  />
                </div>
              </th>

              <th
                onClick={() => handleSort("sn")}
                className="px-3 py-4 text-left cursor-pointer hover:bg-gray-200"
              >
                <div className="flex items-center gap-1 whitespace-nowrap">
                  <span>S/N</span>
                  <SortIcon column="sn" activeKey={sortKey} order={sortOrder} />
                </div>
              </th>

              <th
                onClick={() => handleSort("power")}
                className="px-3 py-4 text-left cursor-pointer hover:bg-gray-200"
              >
                <div className="flex items-center gap-1 whitespace-nowrap">
                  <span>Current Power</span>
                  <SortIcon
                    column="power"
                    activeKey={sortKey}
                    order={sortOrder}
                  />
                </div>
              </th>

              <th
                onClick={() => handleSort("today")}
                className="px-3 py-4 text-left cursor-pointer hover:bg-gray-200"
              >
                <div className="flex items-center gap-1 whitespace-nowrap">
                  <span>E-Today</span>
                  <SortIcon
                    column="today"
                    activeKey={sortKey}
                    order={sortOrder}
                  />
                </div>
              </th>

              <th
                onClick={() => handleSort("total")}
                className="px-3 py-4 text-left cursor-pointer hover:bg-gray-200"
              >
                <div className="flex items-center gap-1 whitespace-nowrap">
                  <span>E-Total</span>
                  <SortIcon
                    column="total"
                    activeKey={sortKey}
                    order={sortOrder}
                  />
                </div>
              </th>

              <th
                onClick={() => handleSort("hours")}
                className="px-3 py-4 text-left cursor-pointer hover:bg-gray-200"
              >
                <div className="flex items-center gap-1 whitespace-nowrap">
                  <span>H-Total</span>
                  <SortIcon
                    column="hours"
                    activeKey={sortKey}
                    order={sortOrder}
                  />
                </div>
              </th>

              <th className="px-3 py-4 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {sortedDevices.map((device) => (
              <tr
                key={device.id}
                className="border-t border-gray-300 hover:bg-blue-50 whitespace-nowrap text-black transition"
              >
                <td className="px-3 py-4">
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      device.online ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                </td>

                <td className="px-3 py-4">
                  <button
                    className="text-blue-600 hover:underline cursor-pointer"
                    onClick={() => handleDeviceClick(device.id)}
                  >
                    {device.name}
                  </button>
                </td>

                <td className="px-3 py-4">{device.type}</td>
                <td className="px-3 py-4">{device.sn}</td>
                <td className="px-3 py-4">{device.power.toFixed(2)} kW</td>
                <td className="px-3 py-4">{device.today.toFixed(2)} kWh</td>
                <td className="px-3 py-4">{device.total.toFixed(2)} MWh</td>
                <td className="px-3 py-4">{device.hours.toFixed(2)} h</td>
                <td className="px-3 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(device.id, device.name)}
                      className="text-blue-600 text-sm hover:underline"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => onDelete(device.id)}
                      className="text-red-600 text-sm hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ---------- Device Tab ----------
const DeviceTab = ({ plantId }: DeviceTabProps) => {
  const searchParams = useSearchParams();
  const selectedEndUserId = searchParams.get("targetEndUserId");

  const serviceParams = selectedEndUserId
    ? {
        fromService: true,
        targetEndUserId: selectedEndUserId,
      }
    : {};
  const addInverter = useAddInverter(plantId, serviceParams);
  const editDevice = useEditDevice(plantId, serviceParams);
  const deleteDevice = useDeleteDevice(plantId, serviceParams);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [open, setOpen] = useState(false);

  // ---------- Server-side pagination: fetch with page & pageSize ----------
  const devicesQuery = usePlantDevices(plantId, {
    ...serviceParams,
    page: currentPage,
    pageSize,
  });

  const apiData = devicesQuery.data;

  // Map API items to Device[]
  const devices: Device[] =
    apiData?.items?.map((item: any) => ({
      id: item.id,
      name: item.name,
      type: item.type,
      sn: item.sn,
      power: item.power?.value ?? item.power ?? 0,
      today: item.today?.value ?? item.today ?? 0,
      total: item.total?.value ?? item.total ?? 0,
      hours: item.hours?.value ?? item.hours ?? 0,
      online: item.online,
    })) ?? [];

  // Use backend pagination metadata for total count
  const totalItems = apiData?.pagination?.totalItems ?? 0;

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | null>(
    null,
  );

  const handleAddInverter = async (serialNumber: string) => {
    // Validation
    if (!serialNumber.trim()) {
      toast.error("Serial number is required.");
      return;
    }

    if (/[^a-zA-Z0-9\s\-_]/.test(serialNumber)) {
      toast.error("Serial number cannot contain special characters.");
      return;
    }

    if (serialNumber.trim().length < 5) {
      toast.error("Please enter a valid serial number.");
      return;
    }

    try {
      await addInverter.mutateAsync(serialNumber.trim());

      toast.success("Inverter added successfully.");

      setMessageType("success");

      setTimeout(() => {
        setOpen(false);
        setMessage("");
        setMessageType(null);
      }, 1000);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to add inverter.";

      toast.error(errorMessage);

      setMessage(errorMessage);
      setMessageType("error");
    }
  };

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const handleEditDevice = async (deviceId: string, name: string) => {
    // Validation
    if (!name.trim()) {
      toast.error("Device name is required.");
      return;
    }

    if (/[^a-zA-Z0-9\s\-_]/.test(name)) {
      toast.error("Device name cannot contain special characters.");
      return;
    }

    if (name.trim().length < 3) {
      toast.error("Device name must be at least 3 characters.");
      return;
    }

    try {
      await editDevice.mutateAsync({
        deviceId,
        name: name.trim(),
      });

      toast.success("Device updated successfully.");

      setMessage("Device updated successfully.");
      setMessageType("success");
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update device.";

      toast.error(errorMessage);

      setMessage(errorMessage);
      setMessageType("error");
    }
  };

  const openEditModal = (deviceId: string) => {
    const device = devices.find((d) => d.id === deviceId);

    if (!device) return;

    setSelectedDevice(device);
    setEditOpen(true);
  };

  const handleDeleteDevice = async (deviceId: string) => {
    if (!deviceId) {
      toast.error("No inverter selected.");
      return;
    }

    try {
      await deleteDevice.mutateAsync(deviceId);

      toast.success("Inverter deleted successfully.");

      setDeleteOpen(false);
      setSelectedDevice(null);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete inverter.",
      );
    }
  };

  const openDeleteModal = (deviceId: string) => {
    const device = devices.find((d) => d.id === deviceId);

    if (!device) return;

    setSelectedDevice(device);
    setDeleteOpen(true);
  };

  return (
    <>
      <div className="mt-4 space-y-3">
        <div className="flex justify-end">
          <button
            onClick={() => setOpen(true)}
            className="border rounded p-2 sm:px-3 sm:py-2 cursor-pointer transition-all duration-200 bg-blue-500 text-white hover:bg-blue-600 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:outline-none"
          >
            <span className="flex items-center gap-2">
              <IoIosAdd className="h-4 w-4" />
              <p>Add Inverter</p>
            </span>
          </button>
        </div>

        <DeviceTable
          devices={devices}
          onEdit={(deviceId) => openEditModal(deviceId)}
          onDelete={(deviceId) => openDeleteModal(deviceId)}
        />

        <Pagination
          totalItems={totalItems}
          pageSize={pageSize}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          setPageSize={setPageSize}
        />
      </div>
      <AddInverterModal
        key={open ? "open" : "closed"}
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleAddInverter}
        loading={addInverter.isPending}
        message={message}
        messageType={messageType}
      />

      <EditInverterModal
        open={editOpen}
        device={selectedDevice}
        onClose={() => {
          setEditOpen(false);
          setSelectedDevice(null);
        }}
        onSubmit={async (name) => {
          if (!selectedDevice) return;

          await handleEditDevice(selectedDevice.id, name);

          setEditOpen(false);
        }}
      />

      <DeleteInverterModal
        open={deleteOpen}
        device={selectedDevice}
        loading={deleteDevice.isPending}
        onClose={() => {
          setDeleteOpen(false);
          setSelectedDevice(null);
        }}
        onConfirm={() => handleDeleteDevice(selectedDevice!.id)}
      />
    </>
  );
};


export default DeviceTab;

