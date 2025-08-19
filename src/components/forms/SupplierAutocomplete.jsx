import { useState, useEffect, useRef } from "react";
import { suppliersService } from "../../services/api-service";

const SupplierAutocomplete = ({
  onSelect,
  onCreateNew,
  value = null,
  placeholder = "ค้นหาหรือเลือก Supplier...",
  disabled = false,
  required = false,
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  // Pre-populate input if value is provided
  useEffect(() => {
    if (value) {
      setQuery(value.name || "");
    }
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

  // Search function with debouncing
  const searchSuppliers = async (searchQuery) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const searchResults = await suppliersService.searchSuppliers(searchQuery);
      setResults(searchResults);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle input change with debouncing
  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setSelectedIndex(-1);

    if (newQuery.trim()) {
      setIsOpen(true);
    }

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new debounce
    debounceRef.current = setTimeout(() => {
      searchSuppliers(newQuery);
    }, 300);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(
          (prev) => (prev - 1 + results.length) % results.length
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelect(selectedIndex);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle selection
  const handleSelect = (index) => {
    if (index < results.length) {
      // Select existing supplier
      const selectedAgent = results[index];
      setQuery(selectedAgent.name);
      setIsOpen(false);
      setSelectedIndex(-1);
      onSelect(selectedAgent);
    }
  };

  // Handle mouse selection
  const handleMouseSelect = (agent) => {
    setQuery(agent.name);
    setIsOpen(false);
    setSelectedIndex(-1);
    onSelect(agent);
  };

  // Handle create new
  const handleCreateNew = () => {
    setIsOpen(false);
    setSelectedIndex(-1);
    onCreateNew(query.trim());
  };

  // Clear selection
  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    onSelect(null);
    inputRef.current?.focus();
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
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            disabled ? "bg-gray-100 cursor-not-allowed" : ""
          }`}
        />

        {/* Create New Button */}
        {onCreateNew && query.length >= 2 && (
          <button
            type="button"
            onClick={handleCreateNew}
            className="absolute right-12 top-1/2 transform -translate-y-1/2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200 transition-colors"
            title="สร้าง Supplier ใหม่"
          >
            ➕ ใหม่
          </button>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Clear Button */}
        {query && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (results.length > 0 || loading) && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {/* Search Results */}
          {results.map((agent, index) => (
            <div
              key={agent.id}
              onClick={() => handleMouseSelect(agent)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`px-4 py-3 cursor-pointer transition-colors ${
                selectedIndex === index
                  ? "bg-blue-50 text-blue-700"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{agent.name}</p>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                    {agent.phone && (
                      <span className="flex items-center">
                        <span className="mr-1">📞</span>
                        {agent.phone}
                      </span>
                    )}
                    {agent.line && (
                      <span className="flex items-center">
                        <span className="mr-1">💬</span>
                        {agent.line}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-blue-600">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))}

          {/* Loading State */}
          {loading && (
            <div className="px-4 py-3 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm">กำลังค้นหา...</p>
            </div>
          )}
        </div>
      )}

      {/* Helper Text */}
      <div className="mt-1 text-xs text-gray-500">
        พิมพ์อย่างน้อย 2 ตัวอักษรเพื่อค้นหา Supplier
        {onCreateNew && " หรือคลิกปุ่ม ➕ ใหม่ เพื่อสร้าง"}
      </div>
    </div>
  );
};

export default SupplierAutocomplete;
