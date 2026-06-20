"use client";

import { X, CheckCircle } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function UpgradeDetailsModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">

      <div className="w-full max-w-5xl bg-white rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center border-b border-gray-300 px-4 sm:px-6 py-4">
          <h2 className="text-lg font-medium">Upgrade Info</h2>

          <button onClick={onClose}>
            <X className="text-gray-500 hover:text-black" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6">

          {/* DEVICE INFO */}
          <div className="border border-gray-300 rounded-md p-4 space-y-4">

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">SN:</span>{" "}
                <span className="font-medium">2524-87026701P</span>
              </div>

              <div>
                <span className="text-gray-500">Model:</span>{" "}
                <span className="font-medium">PSIS-3K6</span>
              </div>

              <div>
                <span className="text-gray-500">Device Status:</span>{" "}
                <span className="font-medium text-green-600">Online</span>
              </div>
            </div>

            <p className="text-sm text-gray-600">Version before upgrade :</p>

            {/* TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border border-gray-300">MDSP</th>
                    <th className="p-2 border border-gray-300">SDSP</th>
                    <th className="p-2 border border-gray-300">DCDC</th>
                    <th className="p-2 border border-gray-300">CSB</th>
                    <th className="p-2 border border-gray-300">Communication Module</th>
                    <th className="p-2 border border-gray-300">AFCI</th>
                  </tr>
                </thead>

                <tbody>
                  <tr className="text-center">
                    <td className="p-2 border border-gray-300 font-medium">
                      030100-01_410203
                    </td>
                    <td className="p-2 border border-gray-300 font-medium">
                      030101-00_010000
                    </td>
                    <td className="p-2 border border-gray-300">---</td>
                    <td className="p-2 border border-gray-300">---</td>
                    <td className="p-2 border border-gray-300 font-medium">
                      050400-09_011810
                    </td>
                    <td className="p-2 border border-gray-300">---</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* PROGRESS SECTION */}
          <div className="border border-gray-300 rounded-md p-6 space-y-5">

            <h3 className="text-blue-600 font-medium">
              Version Upgrade Progress
            </h3>

            <div className="text-sm">
              <p className="text-gray-500">Current Status:</p>
              <p className="font-medium">Upgrade Completed</p>
            </div>

            {/* PROGRESS BAR */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Current Progress:</p>

              <div className="flex items-center gap-3">
                <div className="w-full bg-gray-200 h-2 rounded">
                  <div className="bg-blue-500 h-2 rounded w-full"></div>
                </div>
                <span className="text-sm">100%</span>
              </div>
            </div>

            {/* STATUS LIST */}
            <div className="space-y-3 text-sm">

              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-500" size={16} />

                <span>
                  Sequence 1-G9500-030100-03_410601-Upgrade Successfully
                </span>

                <span className="text-gray-500 ml-auto">
                  Finished Time: 2026-01-13 11:32:53
                </span>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-500" size={16} />
                <span className="font-medium">Upgrade Completed</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}