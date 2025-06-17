import { Listbox, Transition, Portal } from '@headlessui/react';
import { useState, useRef, useEffect, Fragment } from 'react';
import { FiChevronDown } from 'react-icons/fi';

export default function ModelSelector() {
   const options = [
    { label: "DeepSeek", model : "deepseek/deepseek-r1-0528-qwen3-8b:free" },
    { label: "Nvidia", model : "nvidia/llama-3.1-nemotron-70b-instruct" },
    { label: "GPT-4o-Mini", model : "gpt-4o-mini"},
    { label: "Anthropic", model : "claude-sonnet-4-20250514"},
    { label: "Gemini", model : "Not necessary"}
  ];
  const [selectedModel, setSelectedModel] = useState(options[0]?.label);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  return (
    <Listbox value={selectedModel} onChange={setSelectedModel}>
      {({ open: isOpen }) => {
        useEffect(() => {
          if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropdownStyle({
              position: 'fixed',
              top: rect.top - 4, // margin between dropdown and button
              left: rect.left,
              width: rect.width,
              transform: 'translateY(-100%)', // position above button
              zIndex: 1000,
            });
          }
        }, [isOpen]);

        return (
          <div className="relative w-40">
            <Listbox.Button
              ref={buttonRef}
              className="relative w-full cursor-pointer rounded-md bg-transparent py-1.5 pl-3 pr-8 text-left text-[#A2BEBE] text-sm hover:border-cyan-500 transition"
            >
              {selectedModel}
              <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                <FiChevronDown className="w-5 h-5 text-[#A2BEBE]" />
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
                  className="max-h-48 overflow-auto rounded-md py-1 text-sm shadow-xl focus:outline-none 
                 bg-[rgba(13,25,25,0.6)] backdrop-blur-xs border border-white/5"
                >
                  {options.map((model,id) => (
                    <Listbox.Option
                      key={id}
                      value={model.label}
                      className={({ active }) =>
                        `cursor-pointer select-none py-2 px-3 ${active ? 'bg-[#0DC5C5] text-[#0D1919]' : 'text-[#A2BEBE]'}`
                      }
                    >
                      {model.label}
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
