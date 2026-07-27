import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface SplashProps {
  onComplete: () => void;
}

export default function Splash({ onComplete }: SplashProps) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const xAxis = (window.innerWidth / 2 - e.pageX) / 100;
      const yAxis = (window.innerHeight / 2 - e.pageY) / 100;
      setOffset({ x: xAxis, y: yAxis });
    };

    window.addEventListener('mousemove', handleMouseMove);

    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 2500); // Start exit after 2.5s

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 4500); // End splash after 4.5s total

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="bg-background text-on-surface font-body-md overflow-hidden selection:bg-primary/30 h-screen w-screen relative">
      {/* Shader Background Container */}
      <div className="fixed inset-0 z-0 bg-[#0f141a]">
        <div className="absolute inset-0 bg-gradient-to-tr from-background/90 via-background/50 to-primary/5 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/50 to-primary/5 mix-blend-overlay"></div>
      </div>
      
      {/* Content Canvas */}
      <main className="relative z-10 w-full min-h-screen px-6 lg:px-24 py-12 flex flex-col justify-center">
        <div className="flex flex-col justify-center items-center w-full">
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.95, filter: 'blur(10px)' }}
            animate={
              isExiting 
                ? { opacity: 0, scale: 0.9, y: -20, filter: 'blur(10px)' } 
                : { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }
            }
            transition={
              isExiting 
                ? { duration: 1.5, ease: [0.32, 0, 0.67, 0] } 
                : { duration: 2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }
            }
            className="flex items-end gap-6"
          >
            <h1 
              className="font-headline-xl text-5xl md:text-7xl lg:text-8xl uppercase font-bold tracking-widest text-primary"
              style={{ textShadow: '0 0 30px rgba(81, 224, 132, 0.4)' }}
            >
              CENTRALFIT
            </h1>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
