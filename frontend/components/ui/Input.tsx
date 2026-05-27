interface InputProps {
  placeholder?: string;
}

/**
 * Shared Input Component
 * 
 * Group Project Documentation:
 * Upgraded standard text input fields to support theme properties:
 * - Changed background from static `bg-zinc-900` to `bg-input-bg`.
 * - Changed border from `border-zinc-700` to `border-border-custom`.
 * - Changed text color to `text-text-primary` and placeholder style to `placeholder:text-text-muted`.
 */
export default function Input({
  placeholder,
}: InputProps) {
  return (
    <input
      placeholder={placeholder}
      className="
        bg-input-bg
        border border-border-custom
        rounded-xl
        px-4 py-3
        text-text-primary
        placeholder:text-text-muted
        outline-none
        w-full
        transition-all
        duration-300
      "
    />
  );
}