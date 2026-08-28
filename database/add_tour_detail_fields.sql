-- add_tour_detail_fields.sql
-- Phase 1 of the tour data-model expansion: everything that is one value per tour
-- becomes a real column. What was previously readable only by a human parsing
-- `tours.notes` ("Tue, Thu, Sun", "Exclude: Towel, Fins", "(Catamaran 2 storeys)")
-- can now be filtered, sorted and served over the API.
--
-- Deliberately NOT in this migration (they are one-to-many and need child tables):
--   pickup zones with their own time + surcharge, seasonal rate rows,
--   inclusion/exclusion lists, itinerary stops, monsoon closure periods.
-- `days`/`nights` are also left out on purpose: multi-day itineraries are built
-- in the package_tours module, not on a single supplier rate row.
--
-- Every column is nullable so the existing rows stay valid. NULL means "not filled
-- in yet" and must not be rendered as "no" — only an explicit 0 means no.
-- Run once; ignore "duplicate column" if re-run.

ALTER TABLE `tours`
  -- ---- Duration -----------------------------------------------------------
  -- Answers "full day or half day, and how many hours".
  ADD COLUMN `duration_type`   varchar(20)   DEFAULT NULL COMMENT 'full_day | half_day_am | half_day_pm | multi_day | flexible',
  ADD COLUMN `duration_hours`  decimal(4,1)  DEFAULT NULL COMMENT 'total hours, e.g. 8.5',
  ADD COLUMN `start_time`      time          DEFAULT NULL COMMENT 'programme start / departure from pier',
  ADD COLUMN `end_time`        time          DEFAULT NULL COMMENT 'programme end / back at pier',
  ADD COLUMN `time_note`       varchar(255)  DEFAULT NULL COMMENT 'free text when the timing is not fixed',

  -- ---- Pricing detail -----------------------------------------------------
  -- All prices in this system are NET rates from the supplier.
  ADD COLUMN `price_mode`      varchar(20)   DEFAULT NULL COMMENT 'per_person | per_group | per_boat | per_vehicle',
  ADD COLUMN `child_age_min`   tinyint(3) UNSIGNED DEFAULT NULL COMMENT 'child price applies from this age',
  ADD COLUMN `child_age_max`   tinyint(3) UNSIGNED DEFAULT NULL COMMENT 'child price applies up to this age',
  ADD COLUMN `infant_price`    decimal(10,2) DEFAULT NULL COMMENT 'net price for infants (often 0)',
  ADD COLUMN `infant_age_max`  tinyint(3) UNSIGNED DEFAULT NULL COMMENT 'infant up to this age',
  ADD COLUMN `single_supplement` decimal(10,2) DEFAULT NULL COMMENT 'surcharge for travelling / rooming alone',
  ADD COLUMN `min_pax`         smallint(5) UNSIGNED DEFAULT NULL COMMENT 'minimum pax for this rate to apply',
  ADD COLUMN `max_pax`         smallint(5) UNSIGNED DEFAULT NULL COMMENT 'maximum pax the tour takes',

  -- ---- Meals --------------------------------------------------------------
  ADD COLUMN `meals_included`  text          DEFAULT NULL COMMENT 'JSON array: breakfast, morning_snack, lunch, afternoon_snack, dinner, drinking_water, soft_drinks',
  ADD COLUMN `meal_style`      varchar(20)   DEFAULT NULL COMMENT 'buffet | set_menu | box | onboard | none',
  ADD COLUMN `meal_venue`      varchar(255)  DEFAULT NULL COMMENT 'where the meal is served',
  ADD COLUMN `halal_available` tinyint(1)    DEFAULT NULL COMMENT 'NULL = unknown, 0 = no, 1 = yes',
  ADD COLUMN `vegetarian_available` tinyint(1) DEFAULT NULL COMMENT 'NULL = unknown, 0 = no, 1 = yes',
  ADD COLUMN `meal_note`       varchar(255)  DEFAULT NULL,

  -- ---- Vessel / vehicle ---------------------------------------------------
  -- Currently encoded in the tour name, e.g. "... (Catamaran 2 storeys)", which
  -- makes "show me speedboat trips only" impossible without a LIKE scan.
  ADD COLUMN `vessel_type`     varchar(30)   DEFAULT NULL COMMENT 'speedboat | catamaran | longtail | big_boat | ferry | yacht | van | minibus | bus | none',
  ADD COLUMN `vessel_name`     varchar(150)  DEFAULT NULL COMMENT 'name of the actual boat, e.g. MV KOON1',
  ADD COLUMN `vessel_capacity` smallint(5) UNSIGNED DEFAULT NULL COMMENT 'passengers the vessel holds',
  ADD COLUMN `vessel_detail`   varchar(255)  DEFAULT NULL COMMENT 'engines, decks, toilets - what the supplier sells it on',
  ADD COLUMN `guide_included`  tinyint(1)    DEFAULT NULL COMMENT 'NULL = unknown, 0 = staff only, 1 = guide',
  ADD COLUMN `guide_languages` text          DEFAULT NULL COMMENT 'JSON array of language codes: th, en, zh, ru, ko, de, fr',

  -- ---- Pickup / transfer --------------------------------------------------
  -- Per-zone times and surcharges need their own table; this is the tour-wide window.
  ADD COLUMN `transfer_included` tinyint(1)  DEFAULT NULL COMMENT 'NULL = unknown, 0 = no, 1 = hotel transfer included',
  ADD COLUMN `transfer_type`   varchar(20)   DEFAULT NULL COMMENT 'join | private | meet_on_site',
  ADD COLUMN `pickup_time_from` time         DEFAULT NULL COMMENT 'earliest pickup in the standard zone',
  ADD COLUMN `pickup_time_to`  time          DEFAULT NULL COMMENT 'latest pickup in the standard zone',
  ADD COLUMN `meeting_point`   varchar(255)  DEFAULT NULL COMMENT 'where to meet when there is no pickup',

  -- ---- Availability -------------------------------------------------------
  ADD COLUMN `operating_days`  text          DEFAULT NULL COMMENT 'JSON array: mon..sun. Empty/NULL = not recorded, all seven = every day',
  ADD COLUMN `booking_lead_hours` smallint(5) UNSIGNED DEFAULT NULL COMMENT 'how many hours ahead the booking must be made',
  ADD COLUMN `is_active`       tinyint(1)    NOT NULL DEFAULT 1 COMMENT 'hide a tour without deleting it',
  ADD COLUMN `last_verified_at` date         DEFAULT NULL COMMENT 'date the rate was last confirmed with the supplier; separate from updated_at',

  -- ---- Frequently used ----------------------------------------------------
  -- Office-wide pin. Personal pins (per user) come later as tour_favorites.
  ADD COLUMN `is_frequent`     tinyint(1)    NOT NULL DEFAULT 0 COMMENT 'pinned as a tour the office sells often',
  ADD COLUMN `frequent_order`  int(11)       NOT NULL DEFAULT 0 COMMENT 'manual ordering among pinned tours';

ALTER TABLE `tours`
  ADD KEY `idx_is_frequent` (`is_frequent`, `frequent_order`),
  ADD KEY `idx_is_active` (`is_active`),
  ADD KEY `idx_duration_type` (`duration_type`),
  ADD KEY `idx_vessel_type` (`vessel_type`);
