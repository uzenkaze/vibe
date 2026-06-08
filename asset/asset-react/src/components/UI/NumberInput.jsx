import { useState, useEffect } from 'react';
import { formatKRW } from '../../utils/format';

export default function NumberInput({ value, onChange, placeholder, style, className, disabled, min, max, rightAlign }) {
  const [focused, setFocused] = useState(false);
  const [localVal, setLocalVal] = useState(value ?? '');

  // 부모로부터 값이 변경되었을 때 (단, 포커스 상태가 아닐 때만) 동기화
  useEffect(() => {
    if (!focused) {
      setLocalVal(value ?? '');
    }
  }, [value, focused]);

  // 포커스 중일 때는 숫자 그대로, 블러 상태일 때는 콤마 포맷팅 적용
  const displayValue = focused 
    ? localVal 
    : (localVal !== '' && localVal !== null && localVal !== undefined && localVal !== 0 ? formatKRW(localVal) : (localVal === 0 ? '0' : ''));

  const handleChange = (e) => {
    const raw = e.target.value.replace(/[^0-9-]/g, '');
    setLocalVal(raw);
    
    // 상태 업데이트 (문자열이 비어있으면 0으로 처리)
    const num = raw === '' || raw === '-' ? 0 : Number(raw);
    if (onChange) onChange(num);
  };

  const handleFocus = (e) => {
    setFocused(true);
    e.target.select();
  };

  const handleBlur = (e) => {
    setFocused(false);
    let raw = e.target.value.replace(/[^0-9-]/g, '');
    let num = raw === '' || raw === '-' ? 0 : Number(raw);
    
    if (min !== undefined && num < min) num = min;
    if (max !== undefined && num > max) num = max;

    if (onChange) onChange(num);
    setLocalVal(num);
  };

  return (
    <input
      type="text"
      inputMode="numeric"
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
