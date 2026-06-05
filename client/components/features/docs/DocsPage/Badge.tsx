export const Badge = ({ label, className }: { label: string; className: string }) => (
  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${className}`}>
    {label.toUpperCase()}
  </span>
);
