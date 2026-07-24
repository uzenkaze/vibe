import { useState, useEffect } from 'react';
import { formatKRW } from '../../utils/format';

export default function NumberInput({ value, onChange, placeholder, style, className, disabled, min, max, rightAlign, allowDecimal }) {
  const [focused, setFocused] = useState(false);
  const [localVal, setLocalVal] = useState(value ?? '');

  // 부모로부터 값이 변경되었을 때 (단, 포커스 상태가 아닐 때만) 동기화
  useEffect(() => {
    if (!focused) {
      setLocalVal(value ?? '');
    }
  }, [value, focused]);

  // 포커스 중일 때는 숫자 그대로, 블러 상태일 때는 포맷팅 적용
  const displayValue = focused 
    ? localVal 
    : (allowDecimal
        ? (localVal !== '' && localVal !== null && localVal !== undefined ? localVal : '')
        : (localVal !== '' && localVal !== null && localVal !== undefined && localVal !== 0 ? formatKRW(localVal) : (localVal === 0 ? '0' : ''))
      );

  const handleChange = (e) => {
    let raw = e.target.value;
    if (allowDecimal) {
      raw = raw.replace(/[^0-9.-]/g, '');
      const parts = raw.split('.');
      if (parts.length > 2) {
        raw = parts[0] + '.' + parts.slice(1).join('');
      }
      if (parts.length >= 2 && parts[1].length > 2) {
        raw = parts[0] + '.' + parts[1].substring(0, 2);
      }
      setLocalVal(raw);

      const num = raw === '' || raw === '-' || raw === '.' ? 0 : parseFloat(raw);
      if (onChange) onChange(num);
    } else {
      raw = raw.replace(/[^0-9-]/g, '');
      setLocalVal(raw);

      const num = raw === '' || raw === '-' ? 0 : Number(raw);
      if (onChange) onChange(num);
    }
  };

  const handleFocus = (e) => {
    setFocused(true);
    const target = e.target;
    setTimeout(() => {
      if (target) {
        target.select();
      }
    }, 0);
  };

  const handleBlur = (e) => {
    setFocused(false);
    let raw = String(e.target.value);
    let num;
    if (allowDecimal) {
      raw = raw.replace(/[^0-9.-]/g, '');
      num = raw === '' || raw === '-' || raw === '.' ? 0 : parseFloat(raw);
      num = Math.round(num * 100) / 100;
    } else {
      raw = raw.replace(/[^0-9-]/g, '');
      num = raw === '' || raw === '-' ? 0 : Number(raw);
    }

    if (min !== undefined && num < min) num = min;
    if (max !== undefined && num > max) num = max;

    if (onChange) onChange(num);
    setLocalVal(num);
  };

  return (
    <input
      type="text"
      inputMode={allowDecimal ? "decimal" : "numeric"}
      className={className}
      style={{ ...style, textAlign: rightAlign ? 'right' : (style?.textAlign || 'left') }}
      placeholder={placeholder}
      value={displayValue}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onChange={handleChange}
      disabled={disabled}
    />
  );
}
