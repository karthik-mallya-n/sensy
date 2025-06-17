import { FiUser } from "react-icons/fi";

export default function ProfileFooter({ isNavExpanded }: { isNavExpanded: boolean }) {
  return (
    <div className="p-4 border-gray-700 flex items-center gap-3">
      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-white text-lg">
        <FiUser />
      </div>
      {isNavExpanded && (
        <div className="text-white">
          <div className="font-semibold text-[#E3E3E6] text-sm">User ID</div>
          <div className="text-[#A2BEBE] text-xs">user@sensy.ai</div>
        </div>
      )}
    </div>
  );
}
