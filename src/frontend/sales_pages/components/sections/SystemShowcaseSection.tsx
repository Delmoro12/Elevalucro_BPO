"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Monitor, Smartphone, BarChart3, Eye, Shield, Zap } from "lucide-react";

interface ScreenDemo {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  icon: React.ReactNode;
  position: "left" | "center" | "right";
  delay: number;
}

const screenDemos: ScreenDemo[] = [
  {
    id: "dashboard",
    title: "Dashboard Executivo",
    subtitle: "Visão completa da saúde financeira em tempo real",
    image: "/images/dashboard-executivo.png",
    icon: <BarChart3 className="h-6 w-6" />,
    position: "center",
    delay: 0
  },
  {
    id: "mobile",
    title: "Registros Financeiros",
    subtitle: "Envie suas movimentações através do painel, por importação de planilhas ou integração com seu sistema",
    image: "/images/registros-financeiros.png",
    icon: <Smartphone className="h-6 w-6" />,
    position: "right",
    delay: 0.2
  },
  {
    id: "reports",
    title: "Gestão Financeira",
    subtitle: "Acompanhe em tempo real suas entradas e saídas e realize aprovações de pagamentos",
    image: "/images/gestao-financeira.png",
    icon: <Eye className="h-6 w-6" />,
    position: "left",
    delay: 0.4
  },
  {
    id: "audit",
    title: "Auditoria Completa",
    subtitle: "Transparência total em cada movimento através de histórico de rotinas executadas por nossa equipe",
    image: "/images/auditoria-completa.png",
    icon: <Shield className="h-6 w-6" />,
    position: "center",
    delay: 0.6
  }
];

export default function SystemShowcaseSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentScreen, setCurrentScreen] = useState(0);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Parallax transforms with better control
  const backgroundY = useTransform(smoothProgress, [0, 1], ["0%", "30%"]);
  const titleY = useTransform(smoothProgress, [0, 0.2], ["0%", "-50%"]);
  const titleOpacity = useTransform(smoothProgress, [0, 0.2], [1, 0]);

  // Screen transitions with extended freeze zones for longer visibility
  const screen1Y = useTransform(smoothProgress, [0, 0.12], ["100%", "0%"]);
  const screen1Scale = useTransform(smoothProgress, [0, 0.12, 0.38, 0.5], [0.8, 1.2, 1.2, 0.8]);
  const screen1Opacity = useTransform(smoothProgress, [0, 0.12, 0.38, 0.5], [0, 1, 1, 0]);

  const screen2Y = useTransform(smoothProgress, [0.28, 0.35], ["100%", "0%"]);
  const screen2Scale = useTransform(smoothProgress, [0.28, 0.35, 0.63, 0.72], [0.8, 1.2, 1.2, 0.8]);
  const screen2Opacity = useTransform(smoothProgress, [0.28, 0.35, 0.63, 0.72], [0, 1, 1, 0]);

  const screen3Y = useTransform(smoothProgress, [0.50, 0.60], ["100%", "0%"]);
  const screen3Scale = useTransform(smoothProgress, [0.50, 0.60, 0.87, 0.92], [0.8, 1.2, 1.2, 0.8]);
  const screen3Opacity = useTransform(smoothProgress, [0.50, 0.60, 0.87, 0.92], [0, 1, 1, 0]);

  const screen4Y = useTransform(smoothProgress, [0.75, 0.85], ["100%", "0%"]);
  const screen4Scale = useTransform(smoothProgress, [0.75, 0.85, 1], [0.8, 1.3, 1.3]);
  const screen4Opacity = useTransform(smoothProgress, [0.75, 0.85, 1], [0, 1, 1]);

  const transforms = [
    { y: screen1Y, scale: screen1Scale, opacity: screen1Opacity },
    { y: screen2Y, scale: screen2Scale, opacity: screen2Opacity },
    { y: screen3Y, scale: screen3Scale, opacity: screen3Opacity },
    { y: screen4Y, scale: screen4Scale, opacity: screen4Opacity }
  ];

  // Update current screen based on scroll with extended timing
  useEffect(() => {
    const unsubscribe = smoothProgress.on("change", (value) => {
      if (value < 0.38) setCurrentScreen(0);
      else if (value < 0.63) setCurrentScreen(1);
      else if (value < 0.87) setCurrentScreen(2);
      else setCurrentScreen(3);
    });

    return unsubscribe;
  }, [smoothProgress]);

  return (
    <section ref={containerRef} className="relative h-[300vh] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Seamless background continuation */}
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-emerald-300/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Sticky content container */}
      <div className="sticky top-0 h-screen flex items-center justify-center">
        <div className="relative w-full max-w-7xl mx-auto px-4">
          
          {/* Main title */}
          <motion.div 
            className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10 text-center"
            style={{ y: titleY, opacity: titleOpacity }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500/20 text-emerald-300 text-sm font-medium mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
            >
              <Zap className="h-4 w-4" />
              Interface exclusiva
            </motion.div>
            <motion.h2 
              className="text-3xl md:text-5xl lg:text-7xl font-bold text-white mb-4 px-4"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Veja o sistema em <span className="text-emerald-300">ação</span>
            </motion.h2>
            <motion.p 
              className="text-lg md:text-xl text-slate-300/90 max-w-2xl mx-auto px-4"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              Cada tela pensada para simplificar sua gestão financeira
            </motion.p>
          </motion.div>

          {/* Screen showcase */}
          <div className="relative h-full flex items-center justify-center">
            {screenDemos.map((screen, index) => {
              const transform = transforms[index];
              const isActive = currentScreen === index;
              
              return (
                <motion.div
                  key={screen.id}
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    y: transform.y,
                    opacity: transform.opacity,
                  }}
                >
                  <div className={`relative mx-auto ${
                    screen.position === 'left' ? 'md:mr-auto md:ml-20' : 
                    screen.position === 'right' ? 'md:ml-auto md:mr-20' : 
                    'md:mx-auto'
                  }`}>
                    
                    {/* Content card */}
                    <motion.div 
                      className={`absolute ${
                        screen.position === 'left' ? 'md:-right-80 md:top-1/2 md:-translate-y-1/2 -bottom-20 left-1/2 -translate-x-1/2' :
                        screen.position === 'right' ? 'md:-left-80 md:top-1/2 md:-translate-y-1/2 -bottom-20 left-1/2 -translate-x-1/2' :
                        'md:-top-32 md:left-1/2 md:-translate-x-1/2 -bottom-20 left-1/2 -translate-x-1/2'
                      } z-10`}
                      initial={{ opacity: 0, x: screen.position === 'left' ? 50 : screen.position === 'right' ? -50 : 0, y: screen.position === 'center' ? 50 : 0 }}
                      animate={{ 
                        opacity: isActive ? 1 : 0,
                        x: 0,
                        y: 0
                      }}
                      transition={{ delay: screen.delay + 0.3 }}
                    >
                      <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-emerald-500/20 shadow-2xl max-w-xs w-80">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-300">
                            {screen.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-white text-sm md:text-base">{screen.title}</h3>
                          </div>
                        </div>
                        <p className="text-xs md:text-sm text-slate-300/90">{screen.subtitle}</p>
                      </div>
                    </motion.div>

                    {/* Screen image with enhanced effects */}
                    <motion.div
                      className="relative w-80 h-52 md:w-[600px] md:h-96"
                      initial={{ rotateY: 15, rotateX: 5 }}
                      animate={{ 
                        rotateY: isActive ? 0 : 15,
                        rotateX: isActive ? 0 : 5,
                      }}
                      transition={{ duration: 0.8 }}
                      style={{
                        scale: transform.scale
                      }}
                    >
                      {/* Glow effect */}
                      <motion.div 
                        className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-xl"
                        animate={{
                          scale: isActive ? [1, 1.1, 1] : 1,
                          opacity: isActive ? [0.3, 0.6, 0.3] : 0.2,
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      
                      {/* Screen frame */}
                      <div className="relative z-10 bg-slate-800 rounded-2xl p-2 border border-slate-600 shadow-2xl transform-gpu">
                        <div className="bg-slate-900 rounded-xl overflow-hidden">
                          <motion.img
                            src={screen.image}
                            alt={screen.title}
                            className="w-full h-full object-cover"
                            initial={{ scale: 1.2 }}
                            animate={{ scale: isActive ? 1 : 1.1 }}
                            transition={{ duration: 0.8 }}
                          />
                        </div>
                      </div>

                      {/* Floating elements */}
                      {isActive && (
                        <>
                          <motion.div
                            className="absolute -top-4 -right-4 w-8 h-8 bg-emerald-400 rounded-full opacity-80"
                            animate={{
                              y: [0, -20, 0],
                              scale: [1, 1.2, 1],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                          <motion.div
                            className="absolute -bottom-4 -left-4 w-6 h-6 bg-blue-400 rounded-full opacity-60"
                            animate={{
                              y: [0, 15, 0],
                              scale: [1, 0.8, 1],
                            }}
                            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                          />
                        </>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>


        </div>
      </div>
    </section>
  );
}