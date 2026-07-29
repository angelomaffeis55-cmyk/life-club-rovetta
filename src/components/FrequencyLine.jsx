import { useEffect, useRef } from "react";

export default function FrequencyLine() {
  const pathRef = useRef(null);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    let raf;
    let t = 0;
    let amp = 6;

    const onMove = (e) => {
      amp = 4 + (e.clientX / window.innerWidth) * 14;
    };
    window.addEventListener("mousemove", onMove);

    const render = () => {
      t += 0.04;
      const w = window.innerWidth;
      const pts = [];
      for (let i = 0; i <= 48; i++) {
        const x = (i / 48) * w;
        const y =
          12 +
          Math.sin(i * 0.45 + t) * amp +
          Math.sin(i * 0.18 + t * 1.6) * (amp * 0.4);
        pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
      }
      path.setAttribute("d", `M${pts.join(" L")}`);
      raf = requestAnimationFrame(render);
    };
    render();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-0 left-0 z-40 w-full h-6">
      <svg width="100%" height="24" preserveAspectRatio="none">
        <path ref={pathRef} d="" stroke="hsl(var(--accent))" strokeWidth="1.2" fill="none" opacity="0.45" />
      </svg>
    </div>
  );
}