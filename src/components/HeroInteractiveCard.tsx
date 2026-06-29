import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Star, Coins, Flame, ShieldAlert } from 'lucide-react';

export function HeroInteractiveCard() {
  const [user, setUser] = useState<{coins: number, streak: number, level: number, xp: number} | null>(null);

  useEffect(() => {
    fetch('/api/user').then(res => res.json()).then(setUser).catch(() => {});
  }, []);

  const cardRef = useRef<HTMLDivElement>(null);
  
  // 3D Tilt State
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x, { stiffness: 100, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 100, damping: 20 });
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  // Combat State
  const [hp, setHp] = useState(42);
  const [isShaking, setIsShaking] = useState(false);
  const [damageNumbers, setDamageNumbers] = useState<{id: number, val: number, x: number, y: number}[]>([]);
  const [slashes, setSlashes] = useState<{id: number, x: number, y: number, angle: number, length: number}[]>([]);
  const nextId = useRef(0);
  const lastMousePos = useRef<{x: number, y: number} | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);

    // Slash calculation
    if (lastMousePos.current) {
      const dx = mouseX - lastMousePos.current.x;
      const dy = mouseY - lastMousePos.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // If moved fast enough, trigger a slash
      if (dist > 15) {
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        const newSlashId = nextId.current++;
        const prevX = lastMousePos.current.x;
        const prevY = lastMousePos.current.y;
        setSlashes(prev => [...prev, { id: newSlashId, x: prevX, y: prevY, angle, length: dist * 1.5 }]);
        lastMousePos.current = { x: mouseX, y: mouseY };
        
        setTimeout(() => {
          setSlashes(prev => prev.filter(s => s.id !== newSlashId));
        }, 400);
      }
    } else {
      lastMousePos.current = { x: mouseX, y: mouseY };
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    lastMousePos.current = null;
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hp <= 0) return;
    
    // Calculate local click position for damage number spawn
    const rect = e.currentTarget.getBoundingClientRect();
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;

    const damage = Math.floor(Math.random() * 10) + 5;
    const newHp = Math.max(0, hp - damage);
    setHp(newHp);

    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 300);

    const newId = nextId.current++;
    setDamageNumbers(prev => [...prev, { id: newId, val: damage, x: localX, y: localY }]);
    
    setTimeout(() => {
      setDamageNumbers(prev => prev.filter(n => n.id !== newId));
    }, 1000);
  };

  return (
    <motion.div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{ 
        rotateX, 
        rotateY, 
        transformStyle: "preserve-3d" 
      }}
      animate={isShaking ? { x: [-5, 5, -5, 5, 0] } : { y: [0, -10, 0] }}
      transition={
        isShaking 
          ? { duration: 0.3 } 
          : { y: { repeat: Infinity, duration: 4, ease: "easeInOut" } }
      }
      className="w-full relative bg-[#171510]/90 border border-yellow-500/15 rounded-[2rem] p-6 sm:p-7 shadow-2xl backdrop-blur-md overflow-hidden group perspective-1000"
    >
      {/* Damage Numbers Overlay */}
      <AnimatePresence>
        {/* Slash Trails */}
        {slashes.map(slash => (
          <motion.div
            key={`slash-${slash.id}`}
            initial={{ opacity: 0.8, scaleY: 1 }}
            animate={{ opacity: 0, scaleY: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute pointer-events-none z-40 bg-white rounded-full"
            style={{ 
              left: slash.x, 
              top: slash.y, 
              width: slash.length, 
              height: 4, 
              rotate: `${slash.angle}deg`,
              transformOrigin: "left center",
              boxShadow: "0 0 10px 3px rgba(250, 204, 21, 0.6)"
            }}
          />
        ))}

        {/* Damage Numbers */}
        {damageNumbers.map(num => (
          <motion.div
            key={num.id}
            initial={{ opacity: 1, y: num.y, x: num.x, scale: 0.5 }}
            animate={{ opacity: 0, y: num.y - 100, scale: 1.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute pointer-events-none z-50 text-red-500 font-black font-display text-3xl"
            style={{ textShadow: '0 0 10px rgba(255,0,0,0.5)' }}
          >
            -{num.val}
          </motion.div>
        ))}
      </AnimatePresence>

      <div style={{ transform: "translateZ(30px)" }}>
        {/* Header inside Mockup */}
        <div className="flex justify-between items-center w-full border-b border-yellow-500/10 pb-5 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 group-hover:bg-yellow-500/20 transition-colors">
              <Star className="text-yellow-500 animate-pulse" size={18}/>
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-[#b8b3a0] uppercase tracking-wider">GAME STATUS</div>
              <div className="text-sm font-black text-[#fdfcf9] flex items-center gap-1.5">
                Lvl {user ? user.level : 12} Paladin <span className="text-xs font-bold text-yellow-500">(Daniyal)</span>
              </div>
            </div>
          </div>
          <div className="text-[10px] sm:text-xs font-mono px-3 py-1 bg-red-950/80 text-red-400 rounded-full flex items-center gap-1.5 border border-red-500/20 font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            BOSS ROOM ACTIVE
          </div>
        </div>

        {/* Main combat interface card mockup */}
        <div className="flex flex-col items-center justify-center py-4 relative">
          {/* Pulsing boss symbol glow */}
          <motion.div 
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="w-48 h-48 bg-gradient-to-br from-yellow-500/15 to-red-600/10 rounded-full blur-2xl absolute group-hover:from-red-500/20 group-hover:to-red-600/20 transition-all duration-500"
          />
          
          <div className="text-center z-10 w-full relative">
            <span className="text-[10px] font-black text-yellow-500/80 uppercase tracking-widest mb-1.5 block font-mono">TARGET ACQUIRED</span>
            <h3 className={`text-2xl sm:text-3xl font-black font-display text-[#fdfcf9] mb-3 transition-colors ${hp <= 0 ? 'text-red-500/50 line-through' : ''}`}>
              Assignment Dragon
            </h3>
            
            {/* Boss HP Bar */}
            <div className="flex items-center justify-center gap-3 mb-5 max-w-xs mx-auto">
              <span className="text-xs font-mono font-bold text-[#b8b3a0]">HP</span>
              <div className="flex-1 h-3.5 bg-black/40 border border-yellow-500/15 rounded-full overflow-hidden p-0.5">
                <motion.div 
                  initial={{ width: '42%' }}
                  animate={{ width: `${hp}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={`h-full rounded-full ${hp > 20 ? 'bg-gradient-to-r from-red-500 via-yellow-500 to-amber-500' : 'bg-red-600 animate-pulse'}`}
                />
              </div>
              <span className="text-xs font-mono font-bold text-red-400 w-8 text-right">{hp}%</span>
            </div>

            {/* Hexagon Nodes representation */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-500 text-xs font-bold font-mono">1</div>
              <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-500 text-xs font-bold font-mono">2</div>
              <div className="w-8 h-8 rounded-lg bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center text-yellow-300 text-xs font-bold font-mono animate-pulse">3</div>
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-white/20 text-xs font-bold font-mono">4</div>
            </div>

            {/* Active Quest info box */}
            <div className="bg-[#100c08]/90 border border-yellow-500/10 rounded-2xl p-4 text-left max-w-sm mx-auto group-hover:border-yellow-500/30 transition-colors">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black text-yellow-500 uppercase tracking-wider font-mono">CURRENT SIDE QUEST</span>
                <span className="text-[10px] font-bold text-[#b8b3a0] font-mono">+450 XP</span>
              </div>
              <div className="text-xs font-bold text-[#fdfcf9] mb-1">Complete "Draft Section 1"</div>
              <p className="text-[11px] text-[#b8b3a0] leading-normal font-medium">Deals critical strike damage to target dragon when clicked.</p>
            </div>
          </div>
        </div>
        
        {/* Stats Footer inside mockup */}
        <div className="mt-5 pt-4 border-t border-yellow-500/10 grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-xs text-[#b8b3a0] font-bold">Gold Pool</div>
            <div className="text-sm font-black text-yellow-400 font-mono flex items-center justify-center gap-1 mt-0.5">
              <Coins size={12} /> {user ? user.coins : "1,240"}
            </div>
          </div>
          <div>
            <div className="text-xs text-[#b8b3a0] font-bold">Active streak</div>
            <div className="text-sm font-black text-yellow-500 font-mono flex items-center justify-center gap-1 mt-0.5">
              <Flame size={12} /> {user ? user.streak : 8} Days
            </div>
          </div>
          <div>
            <div className="text-xs text-[#b8b3a0] font-bold">Danger Level</div>
            <div className="text-sm font-black text-red-400 font-mono flex items-center justify-center gap-1 mt-0.5">
              <ShieldAlert size={12} /> Critical
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
