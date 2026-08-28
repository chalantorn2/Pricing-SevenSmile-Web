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
import { useI18n } from "../../i18n";

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
const ChipGroup = ({ options, selected, onToggle, columns = false }) => {
  const { t } = useI18n();
  return <div className={`flex flex-wrap gap-1.5 ${columns ? "" : "items-center"}`}>
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
          {t(`tour.option.${opt.value}`)}
        </button>
      );
    })}
  </div>;
};

// Yes / No / not recorded. A blank is meaningful: it means nobody has answered
// this yet, and the detail view hides the row rather than showing "No".
const TriState = ({ value, onChange, yes, no }) => {
  const { t } = useI18n();
  return (
  <select
    value={value === null || value === undefined ? "" : String(value)}
    onChange={(e) => onChange(e.target.value)}
    className={inputClass}
  >
    <option value="">{t("tour.notRecorded")}</option>
    <option value="1">{yes || t("tour.option.yes")}</option>
    <option value="0">{no || t("tour.option.no")}</option>
  </select>
  );
};

const TourDetailFields = ({ values, onChange, className = "" }) => {
  const { t } = useI18n();
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
          <Clock className="w-3.5 h-3.5" /> {t("tour.section.duration")}
        </h5>
        <div className={`${sectionCard} border-l-brand-500 md:grid-cols-2`}>
          <div>
            <label className={labelClass}>{t("tour.field.duration")}</label>
            <select
              value={v.duration_type || ""}
              onChange={set("duration_type")}
              className={inputClass}
            >
              <option value="">{t("tour.notSpecified")}</option>
              {DURATION_TYPES.map((d) => (
                <option key={d.value} value={d.value}>
                  {t(`tour.option.${d.value}`)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>
              {t("tour.field.hours")}
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
            <label className={labelClass}>{t("tour.field.startTime")}</label>
            <input
              type="time"
              value={(v.start_time || "").slice(0, 5)}
              onChange={set("start_time")}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>{t("tour.field.endTime")}</label>
            <input
              type="time"
              value={(v.end_time || "").slice(0, 5)}
              onChange={set("end_time")}
              className={inputClass}
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>
              {t("tour.field.timingNote")}
            </label>
            <input
              type="text"
              value={v.time_note || ""}
              onChange={set("time_note")}
              placeholder={t("tour.placeholder.timingNote")}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Pricing detail */}
      <section>
        <h5 className={`${sectionHead} text-success-600`}>
          <Users className="w-3.5 h-3.5" /> {t("tour.section.pricing")}
        </h5>
        <div className={`${sectionCard} border-l-success-500 md:grid-cols-3`}>
          <div className="md:col-span-3">
            <label className={labelClass}>{t("tour.field.priceMode")}</label>
            <select
              value={v.price_mode || ""}
              onChange={set("price_mode")}
              className={inputClass}
            >
              <option value="">{t("tour.notSpecified")}</option>
              {PRICE_MODES.map((p) => (
                <option key={p.value} value={p.value}>
                  {t(`tour.option.${p.value}`)}
                </option>
              ))}
            </select>
            {!perPerson && (
              <p className="mt-1 text-xs text-gray-500">
                {t("tour.priceGroupHint")}
              </p>
            )}
          </div>

          {perPerson && (
            <>
              <div>
                <label className={labelClass}>
                  {t("tour.field.childAgeFrom")}
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
                  {t("tour.field.childAgeTo")}
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
                  {t("tour.field.infantAge")}
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
                  {t("tour.field.infantPrice")} <span className={hintClass}>฿</span>
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
              {t("tour.field.singleSupplement")} <span className={hintClass}>฿</span>
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
              <label className={labelClass}>{t("tour.field.minPax")}</label>
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
              <label className={labelClass}>{t("tour.field.maxPax")}</label>
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
          <UtensilsCrossed className="w-3.5 h-3.5" /> {t("tour.section.meals")}
        </h5>
        <div className={`${sectionCard} border-l-warning-500 md:grid-cols-2`}>
          <div className="md:col-span-2">
            <label className={labelClass}>
              {t("tour.field.included")}
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
            <label className={labelClass}>{t("tour.field.mealStyle")}</label>
            <select
              value={v.meal_style || ""}
              onChange={set("meal_style")}
              className={inputClass}
            >
              <option value="">{t("tour.notSpecified")}</option>
              {MEAL_STYLES.map((m) => (
                <option key={m.value} value={m.value}>
                  {t(`tour.option.${m.value}`)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>{t("tour.field.mealVenue")}</label>
            <input
              type="text"
              value={v.meal_venue || ""}
              onChange={set("meal_venue")}
              placeholder={t("tour.placeholder.mealVenue")}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>{t("tour.field.halal")}</label>
            <TriState
              value={v.halal_available}
              onChange={(val) => onChange("halal_available", val)}
              yes={t("tour.option.available")}
              no={t("tour.option.notAvailable")}
            />
          </div>

          <div>
            <label className={labelClass}>{t("tour.field.vegetarian")}</label>
            <TriState
              value={v.vegetarian_available}
              onChange={(val) => onChange("vegetarian_available", val)}
              yes={t("tour.option.available")}
              no={t("tour.option.notAvailable")}
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>{t("tour.field.mealNote")}</label>
            <input
              type="text"
              value={v.meal_note || ""}
              onChange={set("meal_note")}
              placeholder={t("tour.placeholder.mealNote")}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Vessel */}
      <section>
        <h5 className={`${sectionHead} text-brand-600`}>
          <Ship className="w-3.5 h-3.5" /> {t("tour.section.transport")}
        </h5>
        <div className={`${sectionCard} border-l-brand-500 md:grid-cols-2`}>
          <div>
            <label className={labelClass}>{t("tour.field.type")}</label>
            <select
              value={v.vessel_type || ""}
              onChange={set("vessel_type")}
              className={inputClass}
            >
              <option value="">{t("tour.notSpecified")}</option>
              {VESSEL_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(`tour.option.${option.value}`)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>
              {t("tour.field.nameActual")}
            </label>
            <input
              type="text"
              value={v.vessel_name || ""}
              onChange={set("vessel_name")}
              placeholder={t("tour.placeholder.vesselName")}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>{t("tour.field.capacity")}</label>
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
            <label className={labelClass}>{t("tour.field.detail")}</label>
            <input
              type="text"
              value={v.vessel_detail || ""}
              onChange={set("vessel_detail")}
              placeholder="2 decks, 2 toilets, 4 engines"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>{t("tour.field.guide")}</label>
            <TriState
              value={v.guide_included}
              onChange={(val) => onChange("guide_included", val)}
              yes={t("tour.option.guideIncluded")}
              no={t("tour.option.staffOnly")}
            />
          </div>

          <div>
            <label className={labelClass}>{t("tour.field.guideLanguages")}</label>
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
          <BusFront className="w-3.5 h-3.5" /> {t("tour.section.pickup")}
        </h5>
        <div className={`${sectionCard} border-l-brand-500 md:grid-cols-2`}>
          <div>
            <label className={labelClass}>{t("tour.field.hotelTransfer")}</label>
            <TriState
              value={v.transfer_included}
              onChange={(val) => onChange("transfer_included", val)}
              yes={t("tour.option.included")}
              no={t("tour.option.notIncluded")}
            />
          </div>

          <div>
            <label className={labelClass}>{t("tour.field.transferType")}</label>
            <select
              value={v.transfer_type || ""}
              onChange={set("transfer_type")}
              className={inputClass}
            >
              <option value="">{t("tour.notSpecified")}</option>
              {TRANSFER_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(`tour.option.${option.value}`)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>
              {t("tour.field.pickupFrom")}
            </label>
            <input
              type="time"
              value={(v.pickup_time_from || "").slice(0, 5)}
              onChange={set("pickup_time_from")}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>{t("tour.field.pickupUntil")}</label>
            <input
              type="time"
              value={(v.pickup_time_to || "").slice(0, 5)}
              onChange={set("pickup_time_to")}
              className={inputClass}
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>
              {t("tour.field.meetingPoint")}
            </label>
            <input
              type="text"
              value={v.meeting_point || ""}
              onChange={set("meeting_point")}
              placeholder={t("tour.placeholder.meetingPoint")}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Availability */}
      <section>
        <h5 className={`${sectionHead} text-success-600`}>
          <CalendarCheck className="w-3.5 h-3.5" /> {t("tour.section.availability")}
        </h5>
        <div className={`${sectionCard} border-l-success-500 md:grid-cols-2`}>
          <div className="md:col-span-2">
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
              <label className="block text-sm font-medium text-gray-700">
                {t("tour.field.operatingDays")}
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
                  {t("tour.option.everyDay")}
                </button>
                <button
                  type="button"
                  onClick={() => onChange("operating_days", [])}
                  className="text-gray-500 hover:underline"
                >
                  {t("tour.clear")}
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
              {t("tour.field.bookAhead")}
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
              {t("tour.field.rateConfirmed")}
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
                {t("tour.field.activeSelling")}
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
                {t("tour.field.frequent")}
              </span>
            </label>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TourDetailFields;
