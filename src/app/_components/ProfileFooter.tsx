"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { FiLogOut } from "react-icons/fi";
import { motion } from "framer-motion";
import SignInModal from "~/app/_components/SignInModal";
import ConfirmSignOutModal from "~/app/_components/ConfirmSignOutModal"; // adjust path

export default function ProfileFooter({ isNavExpanded }: { isNavExpanded: boolean }) {
  const { data: session, status } = useSession();
  const [modalOpen, setModalOpen] = useState(false);
  const [signOutModalOpen, setSignOutModalOpen] = useState(false);

  const displayName =
    session?.user?.name?.length > 14
      ? session.user.name.slice(0, 12) + "…"
      : session?.user?.name ?? "User";

  const displayEmail =
    session?.user?.email?.length && session.user.email.length > 18
      ? session.user.email.slice(0, 14) + "…"
      : session?.user?.email ?? "user@sensy.ai";

  return (
    <>
      <div className="p-4 border-gray-700 flex items-center gap-3 mb-2">
        {status === "loading" && (
          <motion.div
            aria-label="Loading"
            className="w-10 h-10 rounded-full border-4 border-teal-500 border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 1,
            }}
          />
        )}

        {status !== "loading" && session && (
          <>
            {session.user.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || "Profile"}
                className="w-10 h-10 rounded-full object-cover border border-gray-500"
              />
            ) : (
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-white text-lg">
                {/* default icon placeholder */}
              </div>
            )}
          </>
        )}

        {isNavExpanded && (
          <>
            {status === "loading" ? (
              <div className="text-teal-600 font-semibold text-sm">Loading...</div>
            ) : session ? (
              <div className="flex items-center justify-between flex-1">
                <div className="text-white truncate">
                  <div className="font-semibold text-[#E3E3E6] text-sm truncate">{displayName}</div>
                  <div className="text-[#A2BEBE] text-xs truncate">{displayEmail}</div>
                </div>
                <button
                  title="Logout"
                  onClick={() => setSignOutModalOpen(true)} // Open confirm modal here
                  className="text-[#A2BEBE] hover:text-red-500 transition-colors p-1 ml-2 cursor-pointer"
                >
                  <FiLogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setModalOpen(true)}
      className="cursor-pointer flex justify-center items-center w-full h-10 text-sm text-white font-semibold rounded-lg py-2 px-3 mb-2"
      style={{
        backgroundImage:
          "linear-gradient(90deg, rgba(7, 115, 115, 1) 0%, rgba(1, 82, 82, 1) 100%)",
      }}
    >
                Login
              </button>
            )}
          </>
        )}
      </div>

      {/* Sign In Modal */}
      {modalOpen && <SignInModal onClose={() => setModalOpen(false)} />}

      {/* Confirm Sign Out Modal */}
      {signOutModalOpen && (
        <ConfirmSignOutModal
          onConfirm={() => {
            signOut();
            setSignOutModalOpen(false);
          }}
          onCancel={() => setSignOutModalOpen(false)}
        />
      )}
    </>
  );
}
