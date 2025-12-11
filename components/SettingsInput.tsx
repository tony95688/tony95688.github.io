import React from 'react';

interface SettingsInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: 'text' | 'url' | 'password';
  required?: boolean;
  isValid?: boolean;
}

const SettingsInput: React.FC<SettingsInputProps> = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  type = 'text',
  required = false,
  isValid = true
}) => {
  return (
    <div className="mb-4">
      <label className="block text-xs font-bold text-discord-text-muted uppercase tracking-wide mb-2">
        {label} {required && <span className="text-discord-red">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-discord-element text-discord-text p-2.5 rounded text-sm focus:outline-none focus:ring-2 transition-all border ${
          isValid 
            ? 'border-transparent focus:ring-discord-blurple' 
            : 'border-discord-red focus:ring-discord-red'
        }`}
      />
      {!isValid && (
        <p className="text-discord-red text-xs mt-1">Invalid format</p>
      )}
    </div>
  );
};

export default SettingsInput;
