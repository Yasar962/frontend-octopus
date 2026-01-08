import { useEffect, useRef } from "react";

const InteractiveBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
    }));

    let mouse = { x: w / 2, y: h / 2 };
    let lastX = w / 2;
    let lastY = h / 2;
    let velocity = 0;

    window.onmousemove = (e) => {
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;

    velocity = Math.min(20, Math.sqrt(dx * dx + dy * dy));
    lastX = e.clientX;
    lastY = e.clientY;

    mouse.x = e.clientX;
    mouse.y = e.clientY;
    };


    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // Particles
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          p.x -= dx * 0.002;
          p.y -= dy * 0.002;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(56,139,253,0.6)";
        ctx.fill();
      });

      // Rotating rings
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.strokeStyle = "rgba(233,30,99,0.15)";
      ctx.lineWidth = 1.2;

      for (let i = 0; i < 3; i++) {
        ctx.rotate(Date.now() / (12000 - velocity * 300 + i * 2000));
        ctx.beginPath();
        ctx.arc(0, 0, 180 + i * 60, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      requestAnimationFrame(draw);
    };

    draw();

    return () => window.removeEventListener("resize", resize);
  }, []);

  return <canvas ref={canvasRef} className="interactive-bg" />;
};

export default InteractiveBackground;
