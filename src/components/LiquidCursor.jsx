import { useEffect, useState } from "react";

export default function LiquidCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;
    setEnabled(true);
    const move = (e) => setPos({ x: e.clientX, y: e.clientY });
    const over = (e) => {
      const el = e.target;
      setHovering(!!(el && el.closest && el.closest("button,a,[data-cursor]")));
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      className="pointer-events-none fixed z-[9999] hidden md:block rounded-full border border-accent mix-blend-difference transition-[width,height,opacity] duration-150"
      style={{
        transform: `translate(${pos.x - (hovering ? 18 : 10)}px, ${pos.y - (hovering ? 18 : 10)}px)`,
        width: hovering ? 36 : 20,
        height: hovering ? 36 : 20,
        backgroundColor: hovering ? "rgba(212,255,0,0.15)" : "transparent",
      }}
    />
  );
}