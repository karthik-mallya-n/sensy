import { Listbox, Transition, Portal } from "@headlessui/react";
import { useState, useRef, useEffect, Fragment } from "react";
import { FiChevronDown } from "react-icons/fi";
import { useOption } from "./OptionsContext";
import { options } from "./Options";

export default function ModelSelector() {
  
  const { selectedOption, setSelectedOption } = useOption();
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  return (
    <Listbox value={selectedOption} onChange={setSelectedOption}>
      {({ open: isOpen }) => {
        useEffect(() => {
          if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropdownStyle({
              position: "fixed",
              top: rect.top - 4, // margin between dropdown and button
              left: rect.left,
              width: rect.width,
              transform: "translateY(-100%)", // position above button
              zIndex: 1000,
            });
          }
        }, [isOpen]);

        return (
          <div className="relative w-40">
            <Listbox.Button
              ref={buttonRef}
              className="relative w-full cursor-pointer rounded-md bg-transparent py-1.5 pr-8 pl-3 text-left text-sm text-[#A2BEBE] transition hover:border-cyan-500"
            >
              {selectedOption}
              <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                <FiChevronDown className="h-5 w-5 text-[#A2BEBE]" />
              </span>
            </Listbox.Button>

            <Portal>
              <Transition
                as={Fragment}
                show={isOpen}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Listbox.Options
                  static
                  style={dropdownStyle}
                  className="max-h-48 overflow-auto rounded-md border border-white/5 bg-[rgba(13,25,25,0.6)] py-1 text-sm shadow-xl backdrop-blur-xs focus:outline-none"
                >
                  {options.map((option, id) => (
                    <Listbox.Option
                      key={id}
                      value={option.label}
                      className={({ active }) =>
                        `cursor-pointer px-3 py-2 select-none ${active ? "bg-[#0DC5C5] text-[#0D1919]" : "text-[#A2BEBE]"}`
                      }
                    >
                      {option.label}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </Portal>
          </div>
        );
      }}
    </Listbox>
  );
}
