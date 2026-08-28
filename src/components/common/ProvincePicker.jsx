import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { THAI_PROVINCES } from "../../utils/provinces";
import { useI18n } from "../../i18n";

// Province picker backed by a fixed list (THAI_PROVINCES) to prevent typos.
// - multiple=false: exactly one province (Destination)
// - multiple=true:  many provinces as tags (Departure from)
// quickPicks renders one-tap chips below the input.
const ProvincePicker = ({
  value,
  onChange,
  multiple = false,
  quickPicks = [],
  placeholder,
}) => {
  const { t } = useI18n();
  const resolvedPlaceholder = placeholder || t("tour.placeholder.province");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const boxRef = useRef(null);

  // Normalize value to an array regardless of mode
  const selected = multiple ? value || [] : value ? [value] : [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const onDoc = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const matches = query.trim()
    ? THAI_PROVINCES.filter(
        (p) =>
          p.toLowerCase().includes(query.trim().toLowerCase()) &&
          !selected.includes(p)
      ).slice(0, 8)
    : [];

  const commit = (province) => {
    if (!province) return;
    if (multiple) {
      if (!selected.includes(province)) onChange([...selected, province]);
    } else {
      onChange(province);
    }
    setQuery("");
    setOpen(false);
    setActiveIndex(-1);
  };

  const remove = (province) => {
    if (multiple) {
      onChange(selected.filter((p) => p !== province));
    } else {
      onChange("");
    }
  };

  // Single mode: once a province is chosen, hide the input (enforces max 1).
  // Clear it via the tag's X to pick a different one.
  const showInput = multiple || selected.length === 0;

  const availableQuickPicks = quickPicks.filter((p) => !selected.includes(p));

  return (
    <div className="relative" ref={boxRef}>
      <div className="flex flex-wrap items-center gap-2 px-2 py-1.5 border border-gray-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500 min-h-[38px]">
        {selected.map((p) => (
          <span
            key={p}
            className="inline-flex items-center gap-1 bg-brand-50 text-brand-700 text-xs font-medium px-2 py-1 rounded"
          >
            {p}
            <button
              type="button"
              onClick={() => remove(p)}
              className="text-brand-600 hover:text-brand-800"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {showInput && (
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              setActiveIndex(-1);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (activeIndex >= 0 && matches[activeIndex])
                  commit(matches[activeIndex]);
                else if (matches.length === 1) commit(matches[0]);
              } else if (e.key === "ArrowDown") {
                e.preventDefault();
                if (matches.length)
                  setActiveIndex((i) => (i + 1) % matches.length);
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                if (matches.length)
                  setActiveIndex(
                    (i) => (i - 1 + matches.length) % matches.length
                  );
              } else if (e.key === "Escape") {
                setOpen(false);
                setActiveIndex(-1);
              } else if (
                e.key === "Backspace" &&
                !query &&
                multiple &&
                selected.length
              ) {
                remove(selected[selected.length - 1]);
              }
            }}
            placeholder={selected.length === 0 ? resolvedPlaceholder : t("common.addAnother")}
            className="flex-1 min-w-[100px] text-sm border-0 bg-transparent p-1 focus:ring-0 focus:outline-none"
          />
        )}
      </div>

      {open && matches.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {matches.map((p, i) => (
            <div
              key={p}
              onClick={() => commit(p)}
              onMouseEnter={() => setActiveIndex(i)}
              className={`px-3 py-2 cursor-pointer text-sm ${
                activeIndex === i
                  ? "bg-brand-50 text-brand-700"
                  : "hover:bg-gray-50"
              }`}
            >
              {p}
            </div>
          ))}
        </div>
      )}

      {availableQuickPicks.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {availableQuickPicks.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => commit(p)}
              className="text-xs text-gray-500 border border-gray-200 rounded-full px-2.5 py-0.5 hover:bg-white hover:border-gray-300"
            >
              + {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProvincePicker;
