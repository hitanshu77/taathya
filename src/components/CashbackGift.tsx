import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, X, Sparkles, Percent } from "lucide-react";
import confetti from "canvas-confetti";
import { Button } from "./ui/button";

export const CashbackGift = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    if (isOpen) return;
    setIsOpen(true);
    triggerConfetti();
  };

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 50 };

    const random = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: random(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: random(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              rotate: [0, -10, 10, -10, 10, 0]
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ 
              scale: { duration: 0.5 },
              rotate: { 
                duration: 2,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
                repeatDelay: 1
              }
            }}
            whileHover={{ scale: 1.1 }}
            className="fixed bottom-8 right-8 z-50 cursor-pointer"
            onClick={handleOpen}
          >
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-amber-400 to-orange-600 rounded-full blur-lg opacity-40 group-hover:opacity-75 transition duration-500 animate-pulse" />
              
              <div className="relative h-20 w-20 bg-gradient-to-br from-amber-300 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl border-4 border-warm-white/20">
                <Gift className="h-10 w-10 text-warm-white drop-shadow-md" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsOpen(false)}
               className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              className="relative z-10 w-full max-w-sm"
            >
              <div className="relative bg-warm-white rounded-3xl p-1 shadow-2xl border border-gray-200 overflow-hidden">
                {/* Close button */}
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                  className="absolute top-4 right-4 z-30 text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-full hover:bg-slate-100"
                >
                  <X size={18} />
                </button>

                <div className="relative bg-warm-white rounded-[20px] p-0 overflow-hidden">
                  {/* Ribbon Lines - Grid layout relative to parent */}
                  <div className="absolute top-0 bottom-0 left-8 w-8 bg-primary shadow-sm z-0"></div>
                  <div className="absolute left-0 right-0 top-16 h-8 bg-primary shadow-sm z-0"></div>
                  
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-100 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-60" />
                  
                  <div className="relative z-10 flex flex-col items-center text-center p-8 pt-10">
                    <div className="h-16 w-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg mb-6 rotate-3 transform border-2 border-warm-white">
                      <Percent className="h-8 w-8 text-warm-white" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">
                      Congratulations!
                    </h3>
                    
                    <div className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent text-4xl font-extrabold mb-2">
                      0.5% Cashback
                    </div>
                    
                    <p className="text-slate-600 font-medium mb-8">
                      Get an exclusive 0.5% cashback on<br/>your loan amount instantly.
                    </p>
                    
                    <Button 
                      className="w-full bg-slate-900 hover:bg-slate-800 text-warm-white font-semibold py-6 rounded-xl shadow-xl shadow-slate-200 transition-all hover:scale-[1.02]"
                      onClick={() => console.log("Claimed")}
                    >
                      <Sparkles className="mr-2 h-4 w-4 text-amber-400" /> Calculate Your Cashback
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
