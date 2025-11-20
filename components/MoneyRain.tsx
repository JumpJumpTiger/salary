import React, { useEffect, useState } from 'react';

const COINS = ['💰', '💴', '💵', '💎', '🧧'];

export const MoneyRain: React.FC = () => {
  const [elements, setElements] = useState<{ id: number; left: number; char: string; delay: number }[]>([]);

  useEffect(() => {
    const newElements = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      char: COINS[Math.floor(Math.random() * COINS.length)],
      delay: Math.random() * 2,
    }));
    setElements(newElements);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {elements.map((el) => (
        <div
          key={el.id}
          className="absolute top-[-50px] text-2xl animate-float opacity-20"
          style={{
            left: `${el.left}%`,
            animationDuration: `${3 + Math.random() * 2}s`,
            animationDelay: `${el.delay}s`,
            animationName: 'fall', // We'll define a custom CSS keyframe in style
          }}
        >
          {el.char}
        </div>
      ))}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; }
          10% { opacity: 0.6; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};