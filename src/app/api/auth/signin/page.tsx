"use client";

import { signIn } from "next-auth/react";

export default function SignInModal({ onClose }: { onClose: () => void }) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"
      />

      {/* Modal box */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md">
          <h2 className="text-2xl mb-6 text-center">Sign in</h2>

          <button
            onClick={() => signIn("google")}
            className="w-full bg-blue-600 text-white py-2 rounded mb-4"
          >
            Sign in with Google
          </button>

          <button
            onClick={() => signIn("discord")}
            className="w-full bg-indigo-600 text-white py-2 rounded"
          >
            Sign in with Discord
          </button>

          <button
            onClick={onClose}
            className="mt-6 w-full text-center text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
