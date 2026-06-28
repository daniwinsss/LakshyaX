import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface Interactive3DCardProps {
  children: React.ReactNode;
  className?: string;
}

export function Interactive3DCard({ children, className = "" }: Interactive3DCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 40 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 40 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ["100%", "0%"]);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ["100%", "0%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
      className="relative w-full h-full"
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className={`w-full h-full relative ${className}`}
      >
        {/* The Card Background and Content */}
        {children}

        {/* Dynamic Glare Effect */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden"
          style={{ opacity: isHovered ? 1 : 0, transition: "opacity 0.4s ease" }}
        >
          <motion.div
            className="absolute inset-0 z-50 w-[200%] h-[200%] -top-1/2 -left-1/2"
            style={{
              background: "radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%)",
              x: glareX,
              y: glareY,
            }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
