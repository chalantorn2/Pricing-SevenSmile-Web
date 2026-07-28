import { useState, useEffect, useRef } from "react";
import { Search, X, Phone, MessageCircle, ChevronRight, Plus } from "lucide-react";
import { suppliersService } from "../../services/api-service";

const SupplierAutocomplete = ({
  onSelect,
  onCreateNew,
  value = null,
  placeholder = "Search or select a Supplier...",
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

  // Whether the "Create new" row is currently offered
  const canCreate = !!onCreateNew && query.trim().length >= 2;
  // Total navigable items = results + optional create row
  const navCount = results.length + (canCreate ? 1 : 0);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen || navCount === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % navCount);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + navCount) % navCount);
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelect(selectedIndex);
        } else if (canCreate && selectedIndex === results.length) {
          handleCreateNew();
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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
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
          className={`w-full pl-9 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors ${
            disabled ? "bg-gray-100 cursor-not-allowed" : ""
          }`}
        />

        {/* Loading Spinner */}
        {loading && (
          <div className="absolute right-9 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-500"></div>
          </div>
        )}

        {/* Clear Button */}
        {query && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (results.length > 0 || loading || canCreate) && (
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
              className={`px-4 py-2.5 cursor-pointer transition-colors ${
                selectedIndex === index
                  ? "bg-brand-50 text-brand-700"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{agent.name}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-0.5 text-xs text-gray-500">
                    {[
                      agent.phone,
                      agent.phone_2,
                      agent.phone_3,
                      agent.phone_4,
                      agent.phone_5,
                    ]
                      .filter((phone) => phone) // keep only non-empty values
                      .map((phone, i) => (
                        <span key={i} className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {phone}
                        </span>
                      ))}
                    {agent.line && (
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {agent.line}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
              </div>
            </div>
          ))}

          {/* Loading State */}
          {loading && (
            <div className="px-4 py-3 text-center text-gray-500">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-500 mx-auto mb-2"></div>
              <p className="text-sm">Searching...</p>
            </div>
          )}

          {/* Create New row */}
          {canCreate && !loading && (
            <button
              type="button"
              onClick={handleCreateNew}
              onMouseEnter={() => setSelectedIndex(results.length)}
              className={`w-full flex items-center gap-2 px-4 py-2.5 text-left border-t transition-colors ${
                selectedIndex === results.length
                  ? "bg-success-50 text-success-700"
                  : "text-success-700 hover:bg-success-50"
              }`}
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="text-sm">
                Create new supplier:{" "}
                <span className="font-medium">"{query.trim()}"</span>
              </span>
            </button>
          )}
        </div>
      )}

      {/* Helper Text */}
      <div className="mt-1 text-xs text-gray-500">
        Type at least 2 characters to search
        {onCreateNew && ", or create a new one"}
      </div>
    </div>
  );
};

export default SupplierAutocomplete;
