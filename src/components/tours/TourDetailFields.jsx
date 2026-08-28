import {
  Clock,
  Users,
  UtensilsCrossed,
  Ship,
  BusFront,
  CalendarCheck,
} from "lucide-react";
import {
  DURATION_TYPES,
  PRICE_MODES,
  MEALS,
  MEAL_STYLES,
  VESSEL_TYPES,
  TRANSFER_TYPES,
  GUIDE_LANGUAGES,
  WEEKDAYS,
  isPerPersonPricing,
  toArray,
  toggleInArray,
  sortDays,
} from "../../utils/tour-details";

// The detail fields shared by the add form (TourMultiForm) and the edit form.
// Both screens render the same sections in the same order, so a tour looks the
// same wherever it is being filled in.
//
// `values` is the form row; `onChange(field, value)` writes one field back.
// Numbers and tri-state flags are kept as strings here and normalised by the API:
// "" means "not recorded" and is stored as NULL, which is different from 0.

const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";
const sectionHead =
  "flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide mb-2";
const sectionCard =
  "bg-white rounded-lg border border-gray-200 border-l-4 p-3 grid grid-cols-1 gap-x-4 gap-y-3";
const inputClass =
  "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500";
const hintClass = "font-normal text-gray-400";

// Multi-select rendered as toggle chips - faster to fill in than a list of
// checkboxes and it shows the whole set at a glance.
const ChipGroup = ({ options, selected, onToggle, columns = false }) => (
  <div className={`flex flex-wrap gap-1.5 ${columns ? "" : "items-center"}`}>
    {options.map((opt) => {
      const active = selected.includes(opt.value);
      return (
        <button
          key={opt.value}
          type="button"
          onClick={() => onToggle(opt.value)}
          aria-pressed={active}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
            active
              ? "border-brand-500 bg-brand-50 text-brand-700"
              : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          {opt.label}
        </button>
      );
    })}
  </div>
);

// Yes / No / not recorded. A blank is meaningful: it means nobody has answered
// this yet, and the detail view hides the row rather than showing "No".
const TriState = ({ value, onChange, yes = "Yes", no = "No" }) => (
  <select
    value={value === null || value === undefined ? "" : String(value)}
    onChange={(e) => onChange(e.target.value)}
    className={inputClass}
  >
    <option value="">Not recorded</option>
    <option value="1">{yes}</option>
    <option value="0">{no}</option>
  </select>
);

const TourDetailFields = ({ values, onChange, className = "" }) => {
  const v = values || {};
  const meals = toArray(v.meals_included);
  const languages = toArray(v.guide_languages);
  const days = toArray(v.operating_days);
  const perPerson = isPerPersonPricing(v.price_mode);

  const set = (field) => (e) => onChange(field, e.target.value);

  return (
    <div className={`space-y-5 ${className}`}>
      {/* Duration */}
      <section>
        <h5 className={`${sectionHead} text-brand-600`}>
          <Clock className="w-3.5 h-3.5" /> Duration &amp; times
        </h5>
        <div className={`${sectionCard} border-l-brand-500 md:grid-cols-2`}>
          <div>
            <label className={labelClass}>Duration</label>
            <select
              value={v.duration_type || ""}
              onChange={set("duration_type")}
              className={inputClass}
            >
              <option value="">Not specified</option>
              {DURATION_TYPES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>
              Hours <span className={hintClass}>— total, e.g. 8.5</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={v.duration_hours ?? ""}
              onChange={set("duration_hours")}
              placeholder="0"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Start time</label>
            <input
              type="time"
              value={(v.start_time || "").slice(0, 5)}
              onChange={set("start_time")}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>End time</label>
            <input
              type="time"
              value={(v.end_time || "").slice(0, 5)}
              onChange={set("end_time")}
              className={inputClass}
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>
              Timing note{" "}
              <span className={hintClass}>— when the times are not fixed</span>
            </label>
            <input
              type="text"
              value={v.time_note || ""}
              onChange={set("time_note")}
              placeholder="Lazy trip departs 10:30"
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Pricing detail */}
      <section>
        <h5 className={`${sectionHead} text-success-600`}>
          <Users className="w-3.5 h-3.5" /> Pricing detail
        </h5>
        <div className={`${sectionCard} border-l-success-500 md:grid-cols-3`}>
          <div className="md:col-span-3">
            <label className={labelClass}>How the price is charged</label>
            <select
              value={v.price_mode || ""}
              onChange={set("price_mode")}
              className={inputClass}
            >
              <option value="">Not specified</option>
              {PRICE_MODES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            {!perPerson && (
              <p className="mt-1 text-xs text-gray-500">
                The adult / child boxes above hold the whole-group price for this
                mode.
              </p>
            )}
          </div>

          {perPerson && (
            <>
              <div>
                <label className={labelClass}>
                  Child age <span className={hintClass}>— from</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="17"
                  value={v.child_age_min ?? ""}
                  onChange={set("child_age_min")}
                  placeholder="4"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Child age <span className={hintClass}>— to</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="17"
                  value={v.child_age_max ?? ""}
                  onChange={set("child_age_max")}
                  placeholder="11"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Infant up to <span className={hintClass}>— age</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="17"
                  value={v.infant_age_max ?? ""}
                  onChange={set("infant_age_max")}
                  placeholder="3"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Infant net price <span className={hintClass}>฿</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={v.infant_price ?? ""}
                  onChange={set("infant_price")}
                  placeholder="0"
                  className={`${inputClass} text-right`}
                />
              </div>
            </>
          )}

          <div>
            <label className={labelClass}>
              Single supplement <span className={hintClass}>฿</span>
            </label>
            <input
              type="number"
              min="0"
              value={v.single_supplement ?? ""}
              onChange={set("single_supplement")}
              placeholder="0"
              className={`${inputClass} text-right`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Min pax</label>
              <input
                type="number"
                min="0"
                value={v.min_pax ?? ""}
                onChange={set("min_pax")}
                placeholder="-"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Max pax</label>
              <input
                type="number"
                min="0"
                value={v.max_pax ?? ""}
                onChange={set("max_pax")}
                placeholder="-"
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Meals */}
      <section>
        <h5 className={`${sectionHead} text-warning-600`}>
          <UtensilsCrossed className="w-3.5 h-3.5" /> Meals
        </h5>
        <div className={`${sectionCard} border-l-warning-500 md:grid-cols-2`}>
          <div className="md:col-span-2">
            <label className={labelClass}>
              Included <span className={hintClass}>— tap what the price covers</span>
            </label>
            <ChipGroup
              options={MEALS}
              selected={meals}
              onToggle={(val) =>
                onChange("meals_included", toggleInArray(meals, val))
              }
            />
          </div>

          <div>
            <label className={labelClass}>Served as</label>
            <select
              value={v.meal_style || ""}
              onChange={set("meal_style")}
              className={inputClass}
            >
              <option value="">Not specified</option>
              {MEAL_STYLES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Eaten where</label>
            <input
              type="text"
              value={v.meal_venue || ""}
              onChange={set("meal_venue")}
              placeholder="Buffet on Phi Phi island"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Halal</label>
            <TriState
              value={v.halal_available}
              onChange={(val) => onChange("halal_available", val)}
              yes="Available"
              no="Not available"
            />
          </div>

          <div>
            <label className={labelClass}>Vegetarian</label>
            <TriState
              value={v.vegetarian_available}
              onChange={(val) => onChange("vegetarian_available", val)}
              yes="Available"
              no="Not available"
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Meal note</label>
            <input
              type="text"
              value={v.meal_note || ""}
              onChange={set("meal_note")}
              placeholder="Order one day ahead"
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Vessel */}
      <section>
        <h5 className={`${sectionHead} text-brand-600`}>
          <Ship className="w-3.5 h-3.5" /> Boat / vehicle &amp; guide
        </h5>
        <div className={`${sectionCard} border-l-brand-500 md:grid-cols-2`}>
          <div>
            <label className={labelClass}>Type</label>
            <select
              value={v.vessel_type || ""}
              onChange={set("vessel_type")}
              className={inputClass}
            >
              <option value="">Not specified</option>
              {VESSEL_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>
              Name <span className={hintClass}>— of the actual boat</span>
            </label>
            <input
              type="text"
              value={v.vessel_name || ""}
              onChange={set("vessel_name")}
              placeholder="MV KOON1"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Capacity (pax)</label>
            <input
              type="number"
              min="0"
              value={v.vessel_capacity ?? ""}
              onChange={set("vessel_capacity")}
              placeholder="-"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Detail</label>
            <input
              type="text"
              value={v.vessel_detail || ""}
              onChange={set("vessel_detail")}
              placeholder="2 decks, 2 toilets, 4 engines"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Guide</label>
            <TriState
              value={v.guide_included}
              onChange={(val) => onChange("guide_included", val)}
              yes="Guide included"
              no="Staff only"
            />
          </div>

          <div>
            <label className={labelClass}>Guide languages</label>
            <ChipGroup
              options={GUIDE_LANGUAGES}
              selected={languages}
              onToggle={(val) =>
                onChange("guide_languages", toggleInArray(languages, val))
              }
            />
          </div>
        </div>
      </section>

      {/* Pickup */}
      <section>
        <h5 className={`${sectionHead} text-brand-600`}>
          <BusFront className="w-3.5 h-3.5" /> Pickup &amp; transfer
        </h5>
        <div className={`${sectionCard} border-l-brand-500 md:grid-cols-2`}>
          <div>
            <label className={labelClass}>Hotel transfer</label>
            <TriState
              value={v.transfer_included}
              onChange={(val) => onChange("transfer_included", val)}
              yes="Included"
              no="Not included"
            />
          </div>

          <div>
            <label className={labelClass}>Transfer type</label>
            <select
              value={v.transfer_type || ""}
              onChange={set("transfer_type")}
              className={inputClass}
            >
              <option value="">Not specified</option>
              {TRANSFER_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>
              Pickup from <span className={hintClass}>— standard zone</span>
            </label>
            <input
              type="time"
              value={(v.pickup_time_from || "").slice(0, 5)}
              onChange={set("pickup_time_from")}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Pickup until</label>
            <input
              type="time"
              value={(v.pickup_time_to || "").slice(0, 5)}
              onChange={set("pickup_time_to")}
              className={inputClass}
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>
              Meeting point <span className={hintClass}>— when there is no pickup</span>
            </label>
            <input
              type="text"
              value={v.meeting_point || ""}
              onChange={set("meeting_point")}
              placeholder="Nopparat Thara Pier, ticket office"
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Availability */}
      <section>
        <h5 className={`${sectionHead} text-success-600`}>
          <CalendarCheck className="w-3.5 h-3.5" /> Availability
        </h5>
        <div className={`${sectionCard} border-l-success-500 md:grid-cols-2`}>
          <div className="md:col-span-2">
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
              <label className="block text-sm font-medium text-gray-700">
                Operating days
              </label>
              <div className="flex items-center gap-3 text-xs">
                <button
                  type="button"
                  onClick={() =>
                    onChange(
                      "operating_days",
                      WEEKDAYS.map((d) => d.value)
                    )
                  }
                  className="text-brand-600 hover:underline"
                >
                  Every day
                </button>
                <button
                  type="button"
                  onClick={() => onChange("operating_days", [])}
                  className="text-gray-500 hover:underline"
                >
                  Clear
                </button>
              </div>
            </div>
            <ChipGroup
              options={WEEKDAYS}
              selected={days}
              onToggle={(val) =>
                onChange("operating_days", sortDays(toggleInArray(days, val)))
              }
            />
          </div>

          <div>
            <label className={labelClass}>
              Book ahead <span className={hintClass}>— hours</span>
            </label>
            <input
              type="number"
              min="0"
              value={v.booking_lead_hours ?? ""}
              onChange={set("booking_lead_hours")}
              placeholder="24"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              Rate confirmed on{" "}
              <span className={hintClass}>— with the supplier</span>
            </label>
            <input
              type="date"
              value={v.last_verified_at || ""}
              onChange={set("last_verified_at")}
              className={inputClass}
            />
          </div>

          <div className="md:col-span-2 flex flex-wrap items-center gap-x-6 gap-y-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={v.is_active !== 0 && v.is_active !== "0" && v.is_active !== false}
                onChange={(e) => onChange("is_active", e.target.checked ? 1 : 0)}
                className="rounded border-gray-300 text-success-600 focus:ring-success-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Active — still being sold
              </span>
            </label>

            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={
                  v.is_frequent === 1 ||
                  v.is_frequent === "1" ||
                  v.is_frequent === true
                }
                onChange={(e) =>
                  onChange("is_frequent", e.target.checked ? 1 : 0)
                }
                className="rounded border-gray-300 text-warning-600 focus:ring-warning-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Frequently used — pin to the top of the list
              </span>
            </label>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TourDetailFields;
