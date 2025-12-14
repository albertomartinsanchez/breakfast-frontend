import React from 'react'
import { Search } from 'lucide-react'
import './SearchInput.css'

export default function SearchInput({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="search-input">
      <Search size={18} className="search-icon" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="search-field"
      />
    </div>
  )
}