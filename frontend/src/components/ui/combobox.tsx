"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ComboboxProps {
  options: { label: string; value: string }[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function Combobox({ options, value, onChange, placeholder, disabled, className }: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")
  const [isSelected, setIsSelected] = React.useState(false)

  // Get display value for the selected option
  const selectedOption = options.find(option => option.value === value)
  const displayValue = selectedOption ? selectedOption.label : ""

  // Filter options based on input value
  const filteredOptions = React.useMemo(() => {
    if (inputValue.length < 2 || isSelected) return []
    return options.filter(option =>
      option.label.toLowerCase().includes(inputValue.toLowerCase())
    )
  }, [options, inputValue, isSelected])

  // Update input value when component receives new value
  React.useEffect(() => {
    if (displayValue) {
      setInputValue(displayValue)
      setIsSelected(true)
    } else if (value === "" || value === "0") {
      setInputValue("")
      setIsSelected(false)
    }
  }, [displayValue, value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // If a value is already selected, don't allow editing
    if (isSelected) return
    
    const newValue = e.target.value
    setInputValue(newValue)
    setOpen(newValue.length >= 2)
  }

  const handleSelect = (option: { label: string; value: string }) => {
    onChange(option.value)
    setInputValue(option.label)
    setIsSelected(true)
    setOpen(false)
  }

  const handleInputFocus = () => {
    if (inputValue.length >= 2 && !isSelected) {
      setOpen(true)
    }
  }

  const handleInputBlur = () => {
    // Delay closing to allow clicking on options
    setTimeout(() => {
      setOpen(false)
    }, 200)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // If a value is selected, prevent backspace/delete
    if (isSelected && (e.key === 'Backspace' || e.key === 'Delete')) {
      e.preventDefault()
      return
    }
  }

  const handleClear = () => {
    setInputValue("")
    setIsSelected(false)
    onChange("")
    setOpen(false)
  }

  return (
    <div className="relative">
      <div className="relative">
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn("w-full", isSelected ? "pr-8" : "", className)}
          readOnly={isSelected}
        />
        {isSelected && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </div>
      
      {open && filteredOptions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredOptions.map((option) => (
            <div
              key={option.value}
              className="px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center"
              onMouseDown={(e) => {
                e.preventDefault()
                handleSelect(option)
              }}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  value === option.value ? "opacity-100" : "opacity-0"
                )}
              />
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
