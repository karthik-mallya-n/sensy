import { FiMenu } from "react-icons/fi";
import { FaChevronLeft } from "react-icons/fa";

export default function SidebarToggleButton({
  showNavbar,
  isNavExpanded,
  toggleNavbar,
}: {
  showNavbar: boolean;
  isNavExpanded: boolean;
  toggleNavbar: () => void;
}) {
  return (
    <button
      onClick={toggleNavbar}
      className={`fixed top-6 left-6 z-30 p-1.5 w-8 h-8 rounded-md flex items-center justify-center text-white shadow-lg transition-colors duration-200
      ${showNavbar && isNavExpanded
        ? "bg-[#162020] hover:bg-[#2D3838] border border-transparent"
        : "bg-[#0D1919] hover:bg-[#0E2626] border border-[#2D3838]"
      }`}
      title={showNavbar ? "Collapse Sidebar" : "Open Sidebar"}
      style={{ outline: "none" }}
    >
      {showNavbar && isNavExpanded ? <FaChevronLeft /> : <FiMenu />}
    </button>
  );
}
