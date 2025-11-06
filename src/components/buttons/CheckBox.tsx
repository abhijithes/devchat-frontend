import React, { useState, useEffect } from "react";

interface DvcCheckBoxProps {
  label?: string;
  value?: string;
  checked?: boolean;
  onChange?: (value: string, checked: boolean) => void;
  disabled?: boolean;
}

const DvcCheckBox: React.FC<DvcCheckBoxProps> = ({
  label = "",
  value = "",
  checked = false,
  onChange,
  disabled = false,
}) => {
  const [status, setStatus] = useState(checked);

  // keep sync with external checked prop
  useEffect(() => {
    setStatus(checked);
  }, [checked]);

  const handleChange = () => {
    if (disabled) return;
    const newStatus = !status;
    setStatus(newStatus);
    if (onChange) onChange(value, newStatus);
  };

  return (
    <label
      className={`flex items-center gap-3 cursor-pointer select-none ${
        disabled ? "opacity-60 cursor-not-allowed" : ""
      }`}
    >
      <div
        onClick={handleChange}
        className={`relative w-5 h-5 flex items-center justify-center rounded-md border-2 transition-all duration-200 
        ${
          status
            ? "bg-green-600 border-green-600"
            : "border-gray-400 hover:border-zinc-700"
        }
        `}
      >
        {status && (
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
      {label && <span className="text-sm text-gray-800">{label}</span>}
    </label>
  );
};

export default DvcCheckBox;
