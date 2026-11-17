import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown, FaTimes } from 'react-icons/fa';

export default function SearchableCombobox({
  options = [], // array of { value, label, subLabel } or string
  value = '',
  onChange,
  placeholder = 'Select option...',
  icon = null,
  emptyText = 'No matches found',
  required = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Normalize options into uniform { value, label, subLabel }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt, subLabel: '' };
    }
    return {
      value: opt.value,
      label: opt.label || opt.value,
      subLabel: opt.subLabel || ''
    };
  });

  // Find currently selected item
  const selectedItem = normalizedOptions.find((opt) => opt.value === value);

  // Internal input text state
  const [searchTerm, setSearchTerm] = useState(selectedItem ? selectedItem.label : '');
  const [isFocused, setIsFocused] = useState(false);

  // Sync searchTerm with value changes, but ONLY when the user is NOT actively typing inside
  useEffect(() => {
    if (!isFocused) {
      if (selectedItem) {
        setSearchTerm(selectedItem.label);
      } else {
        setSearchTerm('');
      }
    }
  }, [value, selectedItem, isFocused]);

  // Click outside listener
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
        setIsFocused(false);
        // On blur/outside click, restore to current value or empty
        if (selectedItem) {
          setSearchTerm(selectedItem.label);
        } else {
          setSearchTerm('');
        }
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [selectedItem]);

  // Filter options based on search query
  const filtered = normalizedOptions.filter((opt) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      opt.label.toLowerCase().includes(term) ||
      (opt.subLabel && opt.subLabel.toLowerCase().includes(term))
    );
  });

  const handleSelect = (item) => {
    onChange(item.value);
    setSearchTerm(item.label);
    setIsOpen(false);
    setIsFocused(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="searchable-combobox-container" ref={wrapperRef}>
      <div className="searchable-combobox-input-wrapper">
        {icon && <span className="searchable-combobox-icon-left">{icon}</span>}
        <input
          ref={inputRef}
          type="text"
          className="searchable-combobox-input"
          style={{
            paddingLeft: icon ? '38px' : '14px',
            paddingRight: searchTerm ? '58px' : '36px'
          }}
          placeholder={placeholder}
          value={searchTerm}
          autoComplete="off"
          onFocus={() => {
            setIsFocused(true);
            setIsOpen(true);
          }}
          onBlur={() => {
            // Delay to allow clicking on dropdown options
            setTimeout(() => {
              if (document.activeElement !== inputRef.current) {
                setIsFocused(false);
              }
            }, 150);
          }}
          onChange={(e) => {
            const nextVal = e.target.value;
            setSearchTerm(nextVal);
            setIsOpen(true);
            // If the user completely erases or clears the text, notify parent immediately
            if (!nextVal.trim()) {
              onChange('');
            } else {
              // Check if exact match with an existing option
              const exactMatch = normalizedOptions.find(
                (o) => o.label.toLowerCase().trim() === nextVal.toLowerCase().trim()
              );
              if (exactMatch) {
                onChange(exactMatch.value);
              }
            }
          }}
          required={required && !value}
        />

        <div className="searchable-combobox-controls-right">
          {searchTerm && (
            <button
              type="button"
              className="searchable-combobox-clear-btn"
              onClick={handleClear}
              title="Clear selection"
            >
              <FaTimes />
            </button>
          )}
          <button
            type="button"
            className={`searchable-combobox-toggle-btn ${isOpen ? 'is-open' : ''}`}
            onClick={() => {
              setIsOpen((prev) => !prev);
              if (!isOpen && inputRef.current) {
                inputRef.current.focus();
              }
            }}
            title="Toggle options"
          >
            <FaChevronDown />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="searchable-combobox-dropdown">
          {filtered.length > 0 ? (
            filtered.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <div
                  key={opt.value}
                  className={`searchable-combobox-option ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => handleSelect(opt)}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: isSelected ? 700 : 500 }}>{opt.label}</span>
                    {opt.subLabel && (
                      <span className="searchable-combobox-option-sub">{opt.subLabel}</span>
                    )}
                  </div>
                  {isSelected && (
                    <span style={{ color: '#0d9488', fontSize: '0.85rem', fontWeight: 800 }}>✓</span>
                  )}
                </div>
              );
            })
          ) : (
            <div className="searchable-combobox-empty">{emptyText}</div>
          )}
        </div>
      )}
    </div>
  );
}

