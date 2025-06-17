"use client";

import { useSession } from "next-auth/react";
import { FiUser } from "react-icons/fi";
import LogInOut from "./LogInOut";
import { useRouter } from "next/navigation";

export default function ProfileFooter({ isNavExpanded }: { isNavExpanded: boolean }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  return (
    <div className="p-4 border-gray-700 flex items-center gap-3">
      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-white text-lg">
        <FiUser />
      </div>

      {isNavExpanded && (
        <div className="text-white">
          {session ? (
            <div>
              <div className="font-semibold text-[#E3E3E6] text-sm">{session.user.name}</div>
              <div className="text-[#A2BEBE] text-xs mb-1">{session.user?.email ?? "user@sensy.ai"}</div>
              <LogInOut
                isNavExpanded={isNavExpanded}
                text="Logout"
                clickMe={() => router.push("/api/auth/signout")}
              />
            </div>
          ) : (
            <div>
              <LogInOut
                isNavExpanded={isNavExpanded}
                text="Login"
                clickMe={() => router.push("/api/auth/signin")}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
