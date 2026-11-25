'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, X, Loader2 } from 'lucide-react';

export interface SearchableOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface SearchableSelectProps {
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  options: SearchableOption[];
  value: string;
  onChange: (value: string, selectedOption?: SearchableOption) => void;
  disabled?: boolean;
  isLoading?: boolean;
  required?: boolean;
  error?: string;
  className?: string;
}

export function SearchableSelect({
  label,
  placeholder = 'Pilih salah satu...',
  searchPlaceholder = 'Cari...',
  options = [],
  value,
  onChange,
  disabled = false,
  isLoading = false,
  required = false,
  error,
  className = '',
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const selectedOption = useMemo(
    () => options.find((opt) => String(opt.value) === String(value)),
    [options, value]
  );

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase().trim();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(query) ||
        (opt.sublabel && opt.sublabel.toLowerCase().includes(query))
    );
  }, [options, searchQuery]);

  const handleSelect = (option: SearchableOption) => {
    onChange(option.value, option);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="text-[11px] font-black uppercase tracking-wider text-neutral-600 dark:text-neutral-300 block mb-1.5">
          {label} {required && <span className="text-pink-500">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled || isLoading}
        onClick={() => !disabled && !isLoading && setIsOpen(!isOpen)}
        className={`w-full p-3.5 bg-white dark:bg-neutral-900 rounded-xl border text-left flex items-center justify-between gap-2 transition-all outline-none text-xs font-bold ${
          disabled
            ? 'opacity-50 cursor-not-allowed bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700'
            : isOpen
            ? 'border-pink-500 ring-2 ring-pink-500/10'
            : error
            ? 'border-rose-400'
            : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
        }`}
      >
        <span className={`truncate ${selectedOption ? 'text-neutral-900 dark:text-white' : 'text-neutral-400 font-normal'}`}>
          {isLoading
            ? 'Memuat data...'
            : selectedOption
            ? selectedOption.label
            : placeholder}
        </span>

        <div className="flex items-center gap-1.5 shrink-0 text-neutral-400">
          {isLoading ? (
            <Loader2 size={15} className="animate-spin text-pink-500" />
          ) : (
            <>
              {selectedOption && !disabled && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={handleClear}
                  className="hover:text-neutral-700 dark:hover:text-neutral-200 p-0.5 rounded transition-colors"
                >
                  <X size={14} />
                </span>
              )}
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-pink-500' : ''}`}
              />
            </>
          )}
        </div>
      </button>

      {error && <p className="text-[10px] text-rose-500 font-bold mt-1">{error}</p>}

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100">
          {/* Search Input */}
          <div className="p-2.5 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
            <div className="relative flex items-center">
              <Search size={14} className="absolute left-3 text-neutral-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-bold outline-none focus:border-pink-500 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-neutral-400 hover:text-neutral-600 p-0.5"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 scrollbar-thin">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-xs text-neutral-400 font-medium">
                Tidak ada data yang cocok dengan "{searchQuery}"
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={`w-full px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-pink-500 text-white shadow-sm'
                        : 'text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="truncate">{opt.label}</p>
                      {opt.sublabel && (
                        <p className={`text-[10px] truncate ${isSelected ? 'text-pink-100' : 'text-neutral-400 font-normal'}`}>
                          {opt.sublabel}
                        </p>
                      )}
                    </div>
                    {isSelected && <Check size={14} strokeWidth={3} className="shrink-0" />}
                  </button>
                );
              })
            )}
          </div>

          {filteredOptions.length > 0 && (
            <div className="px-3 py-1.5 bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800 text-[10px] text-neutral-400 font-medium text-right">
              Menampilkan {filteredOptions.length} pilihan
            </div>
          )}
        </div>
      )}
    </div>
  );
}

