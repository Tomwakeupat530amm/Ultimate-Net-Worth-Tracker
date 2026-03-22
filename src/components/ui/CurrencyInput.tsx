'use client'

import React, { useState, useEffect, useRef } from 'react'

interface CurrencyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    value: number
    onValueChange: (val: number) => void
}

export function CurrencyInput({ value, onValueChange, className, ...props }: CurrencyInputProps) {
    const [displayValue, setDisplayValue] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        // Only format and update if it structurally differs to prevent cursor jumping
        const currentNumeric = parseFloat(displayValue.replace(/[^0-9.]/g, '')) || 0
        if (value !== currentNumeric && value !== 0) {
            setDisplayValue(value.toLocaleString('en-US'))
        } else if (value === 0 && !displayValue) {
            setDisplayValue('')
        }
    }, [value, displayValue])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value
        // Strip non-numeric except dot
        const numericStr = rawValue.replace(/[^0-9.]/g, '')
        const numericValue = parseFloat(numericStr) || 0

        // Format display with commas
        const formatted = numericStr ? numericValue.toLocaleString('en-US') : ''
        setDisplayValue(formatted)

        onValueChange(numericValue)
    }

    return (
        <input
            {...props}
            ref={inputRef}
            type="text"
            value={displayValue}
            onChange={handleChange}
            className={className}
        />
    )
}
