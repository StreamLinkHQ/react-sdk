import { useRef } from "react";
import { HiDotsVertical } from "react-icons/hi";
import { useClickOutside } from "../../hooks/useClickOutside";
import { DropdownOption } from "../../types";


type DropdownProps = {
  options: DropdownOption[];
  isOpen: boolean;
  toggleDropdown: () => void;
};

const Dropdown = ({ options, isOpen, toggleDropdown }: DropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => {
    if (isOpen) {
      toggleDropdown();
    }
  });

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div>
        <button
          type="button"
          className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-2 py-1 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
          onClick={toggleDropdown}
        >
          <HiDotsVertical className="text-lg" />
        </button>
      </div>

      {isOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
          role="menu"
        >
          <div className="py-1" role="none">
            {options.map((option, index) => (
              <button
                key={index}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                role="menuitem"
                onClick={() => {
                  option.action();
                  toggleDropdown();
                }}
              >
                {option.icon && <span className="mr-2">{option.icon}</span>}
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
