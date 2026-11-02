import { Eye, EyeOff } from 'lucide-react';

export default function GlassInput({
  icon: Icon,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  autoComplete,
  minLength,
  togglePassword = false,
  showPassword = false,
  onTogglePassword,
  className = '',
  ...props
}) {
  return (
    <div
      className={`relative border-b border-white/60 focus-within:border-white focus-within:shadow-[0_1px_0_0_#ffffff] transition-all ${className}`}
    >
      <input
        type={togglePassword ? (showPassword ? 'text' : 'password') : type}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        minLength={minLength}
        className="glass-input w-full bg-transparent pr-12 pl-0 pb-2.5 pt-1 text-[15px] font-normal text-white placeholder:text-white/85 placeholder:font-normal focus:outline-none tracking-normal caret-white border-none outline-none shadow-none"
        {...props}
      />
      {togglePassword ? (
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute right-0 bottom-2.5 text-white/80 hover:text-white transition cursor-pointer p-0.5"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOff className="h-4.5 w-4.5" strokeWidth={1.5} />
          ) : Icon ? (
            <Icon className="h-4.5 w-4.5" strokeWidth={1.5} />
          ) : (
            <Eye className="h-4.5 w-4.5" strokeWidth={1.5} />
          )}
        </button>
      ) : Icon ? (
        <Icon
          className="absolute right-0 bottom-2.5 h-4.5 w-4.5 text-white/80 pointer-events-none"
          strokeWidth={1.5}
        />
      ) : null}
    </div>
  );
}
