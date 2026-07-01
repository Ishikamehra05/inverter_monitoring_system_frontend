"use client";

import { useEffect, useMemo, useState } from "react";
import { Settings, Trash2 } from "lucide-react";

import AddSubAccountModal from "@/components/services/modals/AddSubAccountModal";
import EditOperatorModal from "@/components/services/modals/EditOperatorModal";

import Pagination from "@/components/ui/Pagination";
import { useGetSubAccounts, useDeleteSubAccount } from "@/hooks/api/useUsers";
import { toast } from "sonner";
import DeleteConfirmationModal from "@/components/services/modals/deleteConfirmationModal";
import { getAuthSession } from "@/lib/auth/session";
import { useRouter } from "next/navigation";
import { UserRole } from "@/types/auth";

type SubAccount = {
  id: string;
  account: string;
  deviceCount: number;
  phone: string;
  email: string;
  timezone?: string;
};

// MOCK_SUBACCOUNTS removed as we now fetch from API

const PAGE_SIZE = 10;

export default function SubAccountPage() {
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<SubAccount | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    account: string;
  } | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const { role } = getAuthSession();

    if (role !== UserRole.SUPER_ADMIN) {
      router.replace("/services"); // or "/dashboard"
    }
  }, [router]);
  const [authorized, setAuthorized] = useState(false);
  useEffect(() => {
    const { role } = getAuthSession();

    if (role !== UserRole.SUPER_ADMIN) {
      router.replace("/services");
      return;
    }

    setAuthorized(true);
  }, [router]);

  if (!authorized) {
    return null;
  }
  const { data: subaccountsRaw = [], isLoading } = useGetSubAccounts();
  const deleteMutation = useDeleteSubAccount();

  const handleDeleteClick = (id: string, accountName: string) => {
    setDeleteTarget({ id, account: accountName });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success(`${deleteTarget.account} deleted successfully`);
      setDeleteTarget(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete subaccount");
    }
  };

  const apiSubaccounts: SubAccount[] = useMemo(() => {
    return subaccountsRaw.map((user: any) => ({
      id: String(user.id),
      account: user.account || "",
      deviceCount: user.deviceCount || 0,
      phone: user.phone || user.mobileNumber || "",
      email: user.email || "",
      timezone: user.timezone,
    }));
  }, [subaccountsRaw]);

  const totalPages = Math.ceil(apiSubaccounts.length / PAGE_SIZE) || 1;

  const paginatedData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return apiSubaccounts.slice(start, start + PAGE_SIZE);
  }, [page, apiSubaccounts]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 space-y-4 overflow-hidden">
        <h2 className="text-[18px] font-medium text-[#262626]">
          Sub Account List
        </h2>
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto border border-[#f0f0f0] rounded-lg">
          <table className="w-full text-[14px] border-collapse">
            <thead className="bg-[#fafafa] text-[#595959]">
              <tr>
                <th className="px-4 py-3 text-left border-b border-[#f0f0f0] font-medium">
                  Account
                </th>
                <th className="px-4 py-3 text-center border-b border-[#f0f0f0] font-medium">
                  Device Number
                </th>
                <th className="px-4 py-3 text-center border-b border-[#f0f0f0] font-medium">
                  Telephone
                </th>
                <th className="px-4 py-3 text-center border-b border-[#f0f0f0] font-medium">
                  Email
                </th>
                <th className="px-4 py-3 text-center border-b border-[#f0f0f0] font-medium">
                  Operation
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Loading subaccounts...
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No subaccounts found.
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-[#fafafa] transition-colors duration-300"
                  >
                    <td className="px-4 py-3 border-b border-[#f0f0f0]">
                      {row.account}
                    </td>
                    <td className="px-4 py-3 border-b border-[#f0f0f0] text-center">
                      {row.deviceCount}
                    </td>
                    <td className="px-4 py-3 border-b border-[#f0f0f0] text-center whitespace-nowrap">
                      {row.phone || "-"}
                    </td>
                    <td className="px-4 py-3 border-b border-[#f0f0f0] text-center truncate max-w-[200px]">
                      {row.email || "-"}
                    </td>
                    <td className="px-4 py-3 border-b border-[#f0f0f0] text-center">
                      <div className="inline-flex items-center justify-center gap-3">
                        <Settings
                          size={18}
                          className="text-[#40a9ff] cursor-pointer transition-colors duration-200 hover:text-[#1677ff]"
                          onClick={() => {
                            setSelected(row);
                            setEditOpen(true);
                          }}
                        />
                        <Trash2
                          size={18}
                          onClick={() => handleDeleteClick(row.id, row.account)}
                          className={`text-[#40a9ff] cursor-pointer transition-colors duration-200 hover:text-[#ff7875]`}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile/Tablet View - Card Layout */}
        <div className="lg:hidden p-4 space-y-4">
          {isLoading ? (
            <div className="text-center text-gray-500 py-8">
              Loading subaccounts...
            </div>
          ) : paginatedData.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No subaccounts found.
            </div>
          ) : (
            paginatedData.map((row, idx) => (
              <div
                key={idx}
                className="border border-[#f0f0f0] rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="font-medium text-[16px]">{row.account}</div>
                  <div className="flex items-center gap-3">
                    <Settings
                      size={18}
                      className="text-[#40a9ff] cursor-pointer transition-colors duration-200 hover:text-[#1677ff]"
                      onClick={() => {
                        setSelected(row);
                        setEditOpen(true);
                      }}
                    />
                    <Trash2
                      size={18}
                      onClick={() => handleDeleteClick(row.id, row.account)}
                      className={`text-[#40a9ff] cursor-pointer transition-colors duration-200 hover:text-[#ff7875]`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[14px]">
                  <div className="text-[#595959]">Device Number:</div>
                  <div className="text-[#262626]">{row.deviceCount}</div>

                  <div className="text-[#595959]">Telephone:</div>
                  <div className="text-[#262626]">{row.phone || "-"}</div>

                  <div className="text-[#595959]">Email:</div>
                  <div className="text-[#262626] truncate">
                    {row.email || "-"}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button
          onClick={() => setAddOpen(true)}
          className="w-full sm:w-auto h-9 px-5 text-white text-[14px] font-medium rounded-md border border-[#1677ff] bg-gradient-to-b from-[#1890ff] to-[#1677ff] shadow-[0_2px_0_rgba(0,0,0,0.045)] hover:from-[#40a9ff] transition-all"
        >
          Add Subaccount
        </button>

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      {addOpen && <AddSubAccountModal onClose={() => setAddOpen(false)} />}

      {editOpen && selected && (
        <EditOperatorModal
          userId={selected.id}
          userName={selected.account}
          phone={selected.phone}
          email={selected.email}
          timezone={selected.timezone ?? "UTC+05:30"}
          onClose={() => {
            setEditOpen(false);
            setSelected(null);
          }}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmationModal
          accountName={deleteTarget.account}
          isLoading={deleteMutation.isPending}
          onClose={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
