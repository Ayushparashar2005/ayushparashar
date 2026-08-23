export interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function ToggleSwitch({ label, checked, onChange }: ToggleSwitchProps) {
  return (
    <div className="flex flex-col items-center gap-1 select-none">
      <span className="text-[10px] font-mono font-bold tracking-wider text-white mb-1 drop-shadow-md">{label}</span>
      <div 
        className="relative w-12 h-6 bg-[#1a202c] border-[1.5px] border-[#0a0f1a] rounded-sm shadow-[inset_0_3px_5px_rgba(0,0,0,0.8)] cursor-pointer overflow-hidden flex items-center"
        onClick={() => onChange(!checked)}
      >
        {/* State Text */}
        <div className="absolute inset-0 flex justify-between px-2 items-center text-[9px] font-mono font-bold">
           <span className="text-cyan-400 opacity-80">ON</span>
           <span className="text-gray-400 opacity-80">OFF</span>
        </div>
        
        {/* Toggle Slider */}
        <div 
          className={`absolute top-0 bottom-0 w-6 bg-gradient-to-r from-[#555] via-[#999] to-[#555] border-x border-[#333] shadow-[0_2px_4px_rgba(0,0,0,0.5)] transition-transform duration-100 ease-in-out ${checked ? 'translate-x-6' : 'translate-x-0'}`}
        >
           {/* Slider ridged grip */}
           <div className="absolute inset-0 flex items-center justify-center gap-[1px]">
             <div className="w-[1px] h-4 bg-[#333]" />
             <div className="w-[1px] h-4 bg-[#333]" />
             <div className="w-[1px] h-4 bg-[#333]" />
           </div>
        </div>
      </div>
    </div>
  );
}
