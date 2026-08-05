import { useState, useEffect } from 'react'

export default function FormattedNumberInput({
  value,
  onChange,
  placeholder,
  className,
  style,
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false)
  const [displayValue, setDisplayValue] = useState('')

  useEffect(() => {
    const raw = value !== undefined && value !== null ? String(value).replace(/,/g, '') : ''
    if (isFocused) {
      setDisplayValue(raw)
    } else {
      const num = Number(raw)
      if (!raw || isNaN(num)) {
        setDisplayValue('')
      } else {
        setDisplayValue(num.toLocaleString())
      }
    }
  }, [value, isFocused])

  const handleChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    setDisplayValue(raw)
    onChange(raw)
  }

  const handleFocus = () => {
    setIsFocused(true)
    const raw = value !== undefined && value !== null ? String(value).replace(/,/g, '') : ''
    setDisplayValue(raw)
  }

  const handleBlur = () => {
    setIsFocused(false)
    const raw = value !== undefined && value !== null ? String(value).replace(/,/g, '') : ''
    const num = Number(raw)
    if (!raw || isNaN(num)) {
      setDisplayValue('')
    } else {
      setDisplayValue(num.toLocaleString())
    }
  }

  return (
    <input
      {...props}
      type="text"
      inputMode="numeric"
      className={className}
      style={{ textAlign: 'right', fontWeight: 800, ...style }}
      placeholder={placeholder}
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
    />
  )
}
