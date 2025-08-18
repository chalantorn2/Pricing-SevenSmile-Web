import { useState, useEffect, useRef } from "react";

const AutocompleteInput = ({
  type, // 'departure_from' or 'pier'
  value = "",
  onChange,
  placeholder = "",
  className = "",
  disabled = false,
  required = false,
  ...props
}) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  // Sync with external value changes
  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions from API
  const fetchSuggestions = async (searchQuery) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const apiUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/autocomplete.php?type=${type}&query=${encodeURIComponent(searchQuery)}`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.success && data.data) {
        setSuggestions(data.data);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Autocomplete fetch error:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle input change with debouncing
  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setSelectedIndex(-1);

    // Call parent onChange immediately for form state
    onChange?.(newQuery);

    if (newQuery.trim() && newQuery.length >= 2) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
      setSuggestions([]);
    }

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new debounce
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(newQuery);
    }, 300);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) {
      // Pass through other keys to parent
      if (e.key === "Enter" && props.onKeyDown) {
        props.onKeyDown(e);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(
          (prev) => (prev - 1 + suggestions.length) % suggestions.length
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
      default:
        // Pass through other keys
        if (props.onKeyDown) {
          props.onKeyDown(e);
        }
    }
  };

  // Handle suggestion selection
  const handleSelect = (suggestion) => {
    const selectedValue = suggestion.value;
    setQuery(selectedValue);
    setIsOpen(false);
    setSelectedIndex(-1);
    onChange?.(selectedValue);
    inputRef.current?.focus();
  };

  // Handle focus
  const handleFocus = (e) => {
    if (query.length >= 2 && suggestions.length > 0) {
      setIsOpen(true);
    }
    if (props.onFocus) {
      props.onFocus(e);
    }
  };

  // Handle blur
  const handleBlur = (e) => {
    // Small delay to allow click on suggestions
    setTimeout(() => {
      setIsOpen(false);
      setSelectedIndex(-1);
    }, 150);

    if (props.onBlur) {
      props.onBlur(e);
    }
  };

  return (
    <div className="relative">
      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            disabled ? "bg-gray-100 cursor-not-allowed" : ""
          } ${className}`}
          {...props}
        />

        {/* Loading Spinner */}
        {loading && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && suggestions.length > 0 && !disabled && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.value}-${index}`}
              onClick={() => handleSelect(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`px-4 py-3 cursor-pointer transition-colors ${
                selectedIndex === index
                  ? "bg-blue-50 text-blue-700"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-900 flex-1">
                  {suggestion.value}
                </span>
                {suggestion.usage_count > 1 && (
                  <span className="text-xs text-gray-500 ml-2">
                    ใช้ {suggestion.usage_count} ครั้ง
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Helper Text */}
      {!disabled && (
        <div className="mt-1 text-xs text-gray-500">
          พิมพ์อย่างน้อย 2 ตัวอักษรเพื่อดูคำแนะนำ
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;
