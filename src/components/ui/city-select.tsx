
import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { useCityData } from '@/hooks/useCityData';

interface CitySelectProps {
  value: string;
  onValueChange: (value: string) => void;
  state: string;
  placeholder?: string;
  disabled?: boolean;
}

export const CitySelect = ({ 
  value, 
  onValueChange, 
  state, 
  placeholder = "Digite ou selecione a cidade",
  disabled = false 
}: CitySelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const { searchCities, standardizeCity } = useCityData();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (inputValue && state) {
      const results = searchCities(inputValue, state);
      setFilteredCities(results);
      setSelectedIndex(-1);
    } else {
      setFilteredCities([]);
    }
  }, [inputValue, state, searchCities]);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);
    
    if (newValue.length >= 2) {
      const results = searchCities(newValue, state);
      setFilteredCities(results);
    } else {
      setFilteredCities([]);
    }
  };

  const handleInputBlur = () => {
    // Delay para permitir seleção por clique
    setTimeout(() => {
      if (inputValue && state) {
        const standardized = standardizeCity(inputValue, state);
        setInputValue(standardized);
        onValueChange(standardized);
      }
      setIsOpen(false);
    }, 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && filteredCities.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredCities.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredCities.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && filteredCities[selectedIndex]) {
          selectCity(filteredCities[selectedIndex]);
        } else if (inputValue && state) {
          const standardized = standardizeCity(inputValue, state);
          setInputValue(standardized);
          onValueChange(standardized);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const selectCity = (city: string) => {
    setInputValue(city);
    onValueChange(city);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  if (!state) {
    return (
      <Input
        value=""
        placeholder="Selecione um estado primeiro"
        disabled={true}
        className="bg-gray-50"
      />
    );
  }

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full"
        autoComplete="off"
      />
      
      {isOpen && filteredCities.length > 0 && (
        <div 
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto mt-1"
        >
          {filteredCities.map((city, index) => (
            <div
              key={city}
              className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                index === selectedIndex ? 'bg-blue-50 text-blue-600' : ''
              }`}
              onMouseDown={() => selectCity(city)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              {city}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
