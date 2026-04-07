'use client'

import { useState, useRef, useEffect } from 'react'

interface TypeaheadProps {
  items: { id: number; label: string }[]
  value: string
  onChange: (value: string) => void
  onSelect: (item: { id: number; label: string } | null) => void
  placeholder?: string
  createLabel?: string
  onCreateNew?: (label: string) => void
}

export default function Typeahead({
  items,
  value,
  onChange,
  onSelect,
  placeholder = 'Search...',
  createLabel = 'Add new',
  onCreateNew,
}: TypeaheadProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filtered = items.filter(item =>
    item.label.toLowerCase().includes(value.toLowerCase())
  )

  const showCreateOption = value.trim().length > 0 && !filtered.some(item => item.label === value)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true)
        setSelectedIndex(0)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        const maxIndex = filtered.length + (showCreateOption ? 1 : 0) - 1
        setSelectedIndex(prev => (prev < maxIndex ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < filtered.length) {
          onSelect(filtered[selectedIndex])
          setIsOpen(false)
          setSelectedIndex(-1)
        } else if (selectedIndex === filtered.length && showCreateOption) {
          if (onCreateNew) {
            onCreateNew(value.trim())
          }
          setIsOpen(false)
          setSelectedIndex(-1)
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setSelectedIndex(-1)
        break
    }
  }

  function handleSelect(item: { id: number; label: string }) {
    onSelect(item)
    onChange(item.label)
    setIsOpen(false)
    setSelectedIndex(-1)
  }

  function handleCreateNew() {
    if (onCreateNew) {
      onCreateNew(value.trim())
    }
    setIsOpen(false)
    setSelectedIndex(-1)
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setIsOpen(true)
          setSelectedIndex(-1)
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {isOpen && (filtered.length > 0 || showCreateOption) && (
        <div
          ref={dropdownRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg"
        >
          {filtered.length === 0 && showCreateOption && (
            <button
              onClick={handleCreateNew}
              className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm text-gray-700"
            >
              + {createLabel} '{value}'
            </button>
          )}
          {filtered.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => handleSelect(item)}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                selectedIndex === idx ? 'bg-blue-100 text-gray-900' : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              {item.label}
            </button>
          ))}
          {showCreateOption && filtered.length > 0 && (
            <button
              onClick={handleCreateNew}
              className={`w-full text-left px-3 py-2 text-sm border-t border-gray-200 transition-colors ${
                selectedIndex === filtered.length ? 'bg-blue-100 text-gray-900' : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              + {createLabel} '{value}'
            </button>
          )}
        </div>
      )}
    </div>
  )
}
