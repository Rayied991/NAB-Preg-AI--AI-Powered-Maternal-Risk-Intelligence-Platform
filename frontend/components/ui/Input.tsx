interface InputProps {
  placeholder?: string;
}

export default function Input({
  placeholder,
}: InputProps) {
  return (
    <input
      placeholder={placeholder}
      className="
        bg-zinc-900
        border border-zinc-700
        rounded-xl
        px-4 py-3
        text-white
        outline-none
        w-full
      "
    />
  );
}