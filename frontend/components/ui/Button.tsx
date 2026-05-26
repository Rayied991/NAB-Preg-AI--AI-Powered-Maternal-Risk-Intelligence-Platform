interface ButtonProps {
  children: React.ReactNode;
}

export default function Button({
  children,
}: ButtonProps) {
  return (
    <button className="
      bg-blue-600
      hover:bg-blue-700
      px-4 py-2
      rounded-xl
      text-white
    ">
      {children}
    </button>
  );
}