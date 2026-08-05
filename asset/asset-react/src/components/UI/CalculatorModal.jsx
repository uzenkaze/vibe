import { useState, useEffect } from 'react';

export default function CalculatorModal({ onClose }) {
  const [display, setDisplay] = useState('0');
  const [prevVal, setPrevVal] = useState(null);
  const [op, setOp] = useState(null);
  const [overwrite, setOverwrite] = useState(false);
  const [historyText, setHistoryText] = useState('');

  // 자유 드래그 이동 상태 (화면 우측 상단 기본 위치)
  const [pos, setPos] = useState(() => ({
    x: Math.max(20, window.innerWidth - 360),
    y: 70
  }));
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - pos.x,
      y: e.clientY - pos.y
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const newX = Math.max(10, Math.min(window.innerWidth - 330, e.clientX - dragOffset.x));
      const newY = Math.max(10, Math.min(window.innerHeight - 400, e.clientY - dragOffset.y));
      setPos({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // 키보드 입력 지원
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        inputNum(e.key);
      } else if (e.key === '.') {
        inputDot();
      } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
        let opSymbol = e.key;
        if (opSymbol === '*') opSymbol = '×';
        if (opSymbol === '/') opSymbol = '÷';
        chooseOp(opSymbol);
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        calculate();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [display, prevVal, op, overwrite]);

  const inputNum = (num) => {
    if (display === '0' || overwrite) {
      setDisplay(num);
      setOverwrite(false);
    } else {
      if (display.replace('-', '').length >= 12) return;
      setDisplay(display + num);
    }
  };

  const inputDot = () => {
    if (overwrite) {
      setDisplay('0.');
      setOverwrite(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPrevVal(null);
    setOp(null);
    setOverwrite(false);
    setHistoryText('');
  };

  const handleBackspace = () => {
    if (overwrite) {
      setDisplay('0');
      setOverwrite(false);
      return;
    }
    if (display.length === 1 || (display.length === 2 && display.startsWith('-'))) {
      setDisplay('0');
    } else {
      setDisplay(display.slice(0, -1));
    }
  };

  const toggleSign = () => {
    if (display === '0') return;
    if (display.startsWith('-')) {
      setDisplay(display.slice(1));
    } else {
      setDisplay('-' + display);
    }
  };

  const chooseOp = (operator) => {
    const current = parseFloat(display);
    if (isNaN(current)) return;

    if (prevVal !== null && op && !overwrite) {
      const res = computeResult(prevVal, current, op);
      setDisplay(String(res));
      setPrevVal(res);
      setHistoryText(`${formatNum(res)} ${operator}`);
    } else {
      setPrevVal(current);
      setHistoryText(`${formatNum(current)} ${operator}`);
    }
    setOp(operator);
    setOverwrite(true);
  };

  const calculate = () => {
    if (prevVal === null || !op || overwrite) return;
    const current = parseFloat(display);
    if (isNaN(current)) return;

    const res = computeResult(prevVal, current, op);
    setHistoryText(`${formatNum(prevVal)} ${op} ${formatNum(current)} =`);
    setDisplay(String(res));
    setPrevVal(null);
    setOp(null);
    setOverwrite(true);
  };

  const computeResult = (a, b, operator) => {
    let result = 0;
    switch (operator) {
      case '+': result = a + b; break;
      case '-': result = a - b; break;
      case '×': result = a * b; break;
      case '÷': result = b !== 0 ? a / b : 0; break;
      default: return b;
    }
    return Math.round(result * 100000000) / 100000000;
  };

  const formatNum = (numStr) => {
    if (numStr === null || numStr === undefined) return '';
    const parts = String(numStr).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  return (
    <div 
      className="floating-calc-widget" 
      style={{ 
        position: 'fixed',
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        width: 320,
        padding: '1.1rem', 
        borderRadius: '24px',
        background: 'var(--card)',
        border: '1.5px solid var(--card-border)',
        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.4), 0 0 15px rgba(6, 182, 212, 0.15)',
        zIndex: 9999,
        backdropFilter: 'blur(20px)',
        userSelect: isDragging ? 'none' : 'auto'
      }}
    >
      {/* Header (드래그 핸들) */}
      <div 
        onMouseDown={handleMouseDown}
        style={{ 
          display: 'flex', 
          justify: 'space-between', 
          alignItems: 'center', 
          marginBottom: '0.85rem',
          cursor: isDragging ? 'grabbing' : 'grab',
          paddingBottom: '0.4rem',
          borderBottom: '1px solid var(--border)'
        }}
        title="드래그하여 원하는 위치로 이동할 수 있습니다."
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div style={{
            width: 26, height: 26, borderRadius: '8px',
            background: 'var(--teal-dim)', color: 'var(--teal)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.9rem'
          }}>
            🧮
          </div>
          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            계산기
          </span>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            (드래그 이동 가능)
          </span>
        </div>
        <button 
          onClick={onClose} 
          style={{ 
            width: 26,
            height: 26,
            borderRadius: '50%',
            border: 'none',
            background: 'var(--input-bg)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            marginLeft: 'auto'
          }}
          className="btn-close-hover"
          title="계산기 닫기"
          aria-label="닫기"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Display Screen */}
      <div style={{
        background: 'var(--input-bg)',
        borderRadius: '16px',
        padding: '0.75rem 0.9rem',
        marginBottom: '0.85rem',
        textAlign: 'right',
        border: '1.5px solid var(--input-border)'
      }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', minHeight: '1.1rem', fontWeight: 600 }}>
          {historyText}
        </div>
        <div style={{ 
          fontSize: display.length > 9 ? '1.2rem' : '1.6rem', 
          fontWeight: 900, 
          color: 'var(--text-primary)', 
          fontFamily: "'Plus Jakarta Sans', monospace",
          wordBreak: 'break-all',
          lineHeight: 1.2
        }}>
          {formatNum(display)}
        </div>
      </div>

      {/* Buttons Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0.45rem'
      }}>
        <button onClick={handleClear} className="calc-btn btn-func" style={{ background: 'var(--coral-dim)', color: 'var(--coral)', fontWeight: 800 }}>AC</button>
        <button onClick={handleBackspace} className="calc-btn btn-func">⌫</button>
        <button onClick={toggleSign} className="calc-btn btn-func">±</button>
        <button onClick={() => chooseOp('÷')} className={`calc-btn btn-op ${op === '÷' ? 'active' : ''}`}>÷</button>

        <button onClick={() => inputNum('7')} className="calc-btn btn-num">7</button>
        <button onClick={() => inputNum('8')} className="calc-btn btn-num">8</button>
        <button onClick={() => inputNum('9')} className="calc-btn btn-num">9</button>
        <button onClick={() => chooseOp('×')} className={`calc-btn btn-op ${op === '×' ? 'active' : ''}`}>×</button>

        <button onClick={() => inputNum('4')} className="calc-btn btn-num">4</button>
        <button onClick={() => inputNum('5')} className="calc-btn btn-num">5</button>
        <button onClick={() => inputNum('6')} className="calc-btn btn-num">6</button>
        <button onClick={() => chooseOp('-')} className={`calc-btn btn-op ${op === '-' ? 'active' : ''}`}>-</button>

        <button onClick={() => inputNum('1')} className="calc-btn btn-num">1</button>
        <button onClick={() => inputNum('2')} className="calc-btn btn-num">2</button>
        <button onClick={() => inputNum('3')} className="calc-btn btn-num">3</button>
        <button onClick={() => chooseOp('+')} className={`calc-btn btn-op ${op === '+' ? 'active' : ''}`}>+</button>

        <button onClick={() => inputNum('0')} className="calc-btn btn-num" style={{ gridColumn: 'span 2' }}>0</button>
        <button onClick={inputDot} className="calc-btn btn-num">.</button>
        <button onClick={calculate} className="calc-btn btn-equal" style={{ background: 'var(--teal)', color: '#fff', fontWeight: 900 }}>=</button>
      </div>
    </div>
  );
}
