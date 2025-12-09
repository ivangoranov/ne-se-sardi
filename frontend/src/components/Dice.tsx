import React, { useState } from 'react';

interface DiceProps {
  value: number | null;
  isRolling: boolean;
  canRoll: boolean;
  onRoll: () => void;
}

const Dice: React.FC<DiceProps> = ({ value, isRolling, canRoll, onRoll }) => {
  const [displayValue, setDisplayValue] = useState<number>(1);

  React.useEffect(() => {
    if (isRolling) {
      const interval = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 6) + 1);
      }, 100);
      return () => clearInterval(interval);
    } else if (value !== null) {
      setDisplayValue(value);
    }
  }, [isRolling, value]);

  const renderDots = (num: number) => {
    const dotPositions: Record<number, string[]> = {
      1: ['center'],
      2: ['top-left', 'bottom-right'],
      3: ['top-left', 'center', 'bottom-right'],
      4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
      6: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right'],
    };

    const positions = dotPositions[num] || [];

    const getPositionClass = (pos: string) => {
      switch (pos) {
        case 'top-left':
          return 'top-2 left-2';
        case 'top-right':
          return 'top-2 right-2';
        case 'center':
          return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
        case 'middle-left':
          return 'top-1/2 left-2 -translate-y-1/2';
        case 'middle-right':
          return 'top-1/2 right-2 -translate-y-1/2';
        case 'bottom-left':
          return 'bottom-2 left-2';
        case 'bottom-right':
          return 'bottom-2 right-2';
        default:
          return '';
      }
    };

    return positions.map((pos, idx) => (
      <div
        key={idx}
        className={`absolute w-4 h-4 bg-gray-800 rounded-full ${getPositionClass(pos)}`}
      />
    ));
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={`
          relative w-24 h-24 bg-white rounded-xl shadow-xl border-4 border-gray-300
          flex items-center justify-center
          ${isRolling ? 'animate-spin' : 'animate-bounce-once'}
          transition-transform duration-200
        `}
      >
        {renderDots(displayValue)}
      </div>
      <button
        onClick={onRoll}
        disabled={!canRoll || isRolling}
        className={`
          px-8 py-4 text-xl font-bold rounded-full shadow-lg
          transform transition-all duration-200
          ${
            canRoll && !isRolling
              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:scale-110 hover:shadow-xl cursor-pointer'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }
        `}
      >
        {isRolling ? '🎲 Въртя се...' : '🎲 Хвърли зара!'}
      </button>
    </div>
  );
};

export default Dice;
