export const Arrow = ({ color }: { color: string }) => (
  <div className="flex justify-center items-center py-1">
    <div className="flex flex-col items-center gap-0">
      <div className="w-px h-5" style={{ backgroundColor: color, opacity: 0.4 }} />
      <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
        <path d="M5 6L0 0H10L5 6Z" fill={color} fillOpacity={0.4} />
      </svg>
    </div>
  </div>
);
