// src/chat/components/ToggleSwitch.tsx

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  activeColor?: string;
}

const ToggleSwitch = ({ checked, onChange, activeColor }: ToggleProps) => {
  return (
    <div
      onClick={onChange}
      className={`w-14 h-8 rounded-full flex items-center px-1 cursor-pointer transition-all 
        ${checked ? activeColor || "bg-green-400" : "bg-gray-300"}`}
    >
      <div
        className={`w-6 h-6 bg-black rounded-full transition-all 
        ${checked ? "translate-x-6" : "translate-x-0"}`}
      />
    </div>
  );
};

export default ToggleSwitch;
