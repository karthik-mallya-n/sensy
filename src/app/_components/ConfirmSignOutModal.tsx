"use client";

export default function ConfirmSignOutModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onCancel}
        className="fixed inset-0 z-40 backdrop-blur-xs"
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className="
            bg-[#0D1919]
            rounded-2xl 
            border border-[#2D3838]
            shadow-lg 
            p-6 
            w-full max-w-sm
            text-center
          "
        >
          <h3 className="text-white text-xl font-semibold mb-4">
            Are you sure you want to sign out?
          </h3>
          <div className="flex justify-center gap-4">
            <button
              onClick={onConfirm}
              className="cursor-pointer bg-[#B31C1C] hover:bg-[#8E0E0E] text-white px-4 py-2 rounded transition"
            >
              Yes
            </button>
            <button
              onClick={onCancel}
              className="cursor-pointer bg-[#394747] hover:bg-[#283B3B] text-white px-4 py-2 rounded transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
