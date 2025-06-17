import { FiSearch } from "react-icons/fi";

export default function SearchBar({ isNavExpanded }: { isNavExpanded: boolean }) {
  return (
    <div
      className="flex items-center bg-[#0D1919] text-[#7B9999] rounded-md px-3 py-2"
      style={{
        boxShadow: "0 0 0 1px rgba(45, 56, 56, 1)",
      }}
    >
      <FiSearch />
      {isNavExpanded && (
        <input
          type="text"
          placeholder="Search..."
          className="ml-2 bg-transparent outline-none w-full placeholder-[#7B9999]"
        />
      )}
    </div>
  );
}
