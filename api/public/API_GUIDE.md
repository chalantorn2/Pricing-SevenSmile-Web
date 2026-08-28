# Seven Smile — Public API Guide

Read-only API for tours, suppliers, packages and files.
Give this file to any site that needs to consume the data.

## Base URL

```
https://contactrate.sevensmiletourandticket.com/api/public/
```

## Authentication

Every request needs the API key. Two ways — pick one:

**Header (recommended)**
```
X-API-Key: sevensmile_2026_001_2026
```

**Query string** (for quick tests / browser)
```
?api_key=sevensmile_2026_001_2026
```

Missing or wrong key → `401`.
Only `GET` is allowed → anything else returns `405`.
CORS is open (`Access-Control-Allow-Origin: *`), so browser fetch works from any domain.

## Response shape

All endpoints return the same envelope:

```json
{
  "success": true,
  "data": [ ... ],
  "count": 12,
  "timestamp": "2026-07-12T10:30:00+07:00"
}
```

On error:

```json
{ "success": false, "error": "Invalid or missing API key" }
```

---

## Endpoints

### 1. Tours — `tours.php`

Tours with the supplier's contact info joined in.

```
GET /api/public/tours.php
```

| Param | Example | Meaning |
|---|---|---|
| `id` | `?id=19` | One tour |
| `supplier_id` | `?supplier_id=7` | All tours of one supplier |
| `search` | `?search=phi phi` | Match tour name, supplier name or boat name |
| `destination` | `?destination=Krabi` | Exact destination province |
| `departure_from` | `?departure_from=Phuket` | Substring match (a tour can list several) |
| `tour_type` | `?tour_type=one_day_trip` | `one_day_trip`, `private`, `show_ticket`, `activity`, `package` |
| `duration_type` | `?duration_type=full_day` | `full_day`, `half_day_am`, `half_day_pm`, `multi_day`, `flexible` |
| `vessel_type` | `?vessel_type=speedboat` | `speedboat`, `catamaran`, `longtail`, … |
| `price_mode` | `?price_mode=per_person` | `per_person`, `per_group`, `per_boat`, `per_vehicle` |
| `active` | `?active=1` | Active only (omit to get both, for mirroring) |
| `frequent` | `?frequent=1` | Only the tours the office sells often |
| `since` | `?since=2026-08-01` | Only tours changed on/after that date (incremental sync) |
| `page`, `limit` | `?page=2&limit=50` | Opt-in pagination — **omit `limit` and you get every tour**, as before |

Sorted with the frequently-used tours first, then most recently updated.

Fields returned:

**Core** — `id`, `supplier_id`, `tour_name`, `departure_from`, `destination`, `pier`,
`tour_type`, `adult_price`, `child_price`, `start_date`, `end_date`, `notes`,
`park_fee_included`, `park_fee_adult`, `park_fee_child`, `map_url`,
`created_at`, `updated_at`

**Duration** — `duration_type`, `duration_hours`, `start_time`, `end_time`, `time_note`

**Pricing detail** — `price_mode`, `child_age_min`, `child_age_max`, `infant_price`,
`infant_age_max`, `single_supplement`, `min_pax`, `max_pax`

**Meals** — `meals_included[]`, `meal_style`, `meal_venue`, `halal_available`,
`vegetarian_available`, `meal_note`

**Boat / vehicle** — `vessel_type`, `vessel_name`, `vessel_capacity`, `vessel_detail`,
`guide_included`, `guide_languages[]`

**Pickup** — `transfer_included`, `transfer_type`, `pickup_time_from`, `pickup_time_to`,
`meeting_point`

**Availability** — `operating_days[]`, `booking_lead_hours`, `is_active`,
`last_verified_at`, `is_frequent`

**Supplier** — `supplier_name`, `address`, `phone`, `phone_2` … `phone_5`,
`line`, `facebook`, `whatsapp`, `website`, `email`

`meals_included`, `guide_languages` and `operating_days` come back as real arrays.
An empty array means the field was never filled in — we never store an explicit
"none".

`halal_available`, `vegetarian_available`, `guide_included` and `transfer_included`
are three-state: `"1"` yes, `"0"` no, `null` **nobody has recorded it yet**. Do not
render `null` as "no".

Example:
```json
{
  "id": 19,
  "supplier_id": 7,
  "tour_name": "4 Islands Speed Boat",
  "departure_from": "Krabi",
  "destination": "Krabi",
  "pier": "Nopparat Thara Pier",
  "tour_type": "one_day_trip",
  "adult_price": "500.00",
  "child_price": "400.00",
  "start_date": "2025-05-15",
  "end_date": "2026-05-15",
  "park_fee_included": "0",
  "duration_type": "full_day",
  "duration_hours": "8.0",
  "start_time": "09:00:00",
  "end_time": "17:00:00",
  "price_mode": "per_person",
  "child_age_min": "4",
  "child_age_max": "11",
  "min_pax": "2",
  "meals_included": ["lunch", "drinking_water"],
  "meal_style": "buffet",
  "halal_available": "1",
  "vegetarian_available": null,
  "vessel_type": "speedboat",
  "vessel_capacity": "35",
  "guide_languages": ["th", "en"],
  "transfer_included": "1",
  "transfer_type": "join",
  "pickup_time_from": "08:30:00",
  "pickup_time_to": "08:45:00",
  "operating_days": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
  "is_active": "1",
  "is_frequent": "0",
  "supplier_name": "Orchid",
  "phone": "0984541233"
}
```

**`adult_price`, `child_price`, `infant_price` and `single_supplement` are NET
(cost) prices from the supplier, not selling prices.** A consumer may store them,
but must never render them on a customer-facing page — add your own markup first.

Still lives in `notes` and has no column yet: per-zone pickup times and surcharges,
inclusion / exclusion lists, seasonal rates, and monsoon closure periods.

### 2. Suppliers — `suppliers.php`

Suppliers with full contact info, tour count, and their files (contact rate sheets, QR codes).

```
GET /api/public/suppliers.php
```

| Param | Example | Meaning |
|---|---|---|
| `id` | `?id=7` | One supplier |
| `search` | `?search=orchid` | Match supplier name |
| `type` | `?type=transfer` | `tour` or `transfer` — these are different companies |

Each supplier includes a `files` array. Every file has a ready-to-use `file_url`.

```json
{
  "id": 7,
  "name": "Orchid",
  "type": "tour",
  "address": "20/1 หมู่ที่ 2 ตำบลอ่าวนาง อำเภอเมืองกระบี่ จ.กระบี่ 81000",
  "phone": "0984541233",
  "phone_2": "",
  "line": "",
  "facebook": "https://www.facebook.com/...",
  "whatsapp": "",
  "website": "",
  "email": null,
  "tour_count": 5,
  "files": [
    {
      "id": 5,
      "original_name": "contact-rate.png",
      "file_category": "contact_rate",
      "file_type": "image",
      "label": "Contact Rate",
      "file_url": "https://contactrate.sevensmiletourandticket.com/api/uploads/suppliers/images/xxx.png"
    }
  ]
}
```

`file_category` for supplier files: `contact_rate`, `qr_code`, `general`.

### 3. Files — `files.php`

Tour images / brochures, and supplier files.

```
GET /api/public/files.php
```

| Param | Example | Meaning |
|---|---|---|
| `tour_id` | `?tour_id=30` | Files of that tour (owned **or** shared with it) |
| `supplier_id` | `?supplier_id=7` | Files of that supplier instead of tour files |
| `category` | `?category=gallery` | Filter by category |

`category` values:
- tour files: `gallery`, `brochure` (Seven Smile's own), `brochure_supplier`, `general`
- supplier files: `contact_rate`, `qr_code`, `general`

Every row has a `source` field (`"tour"` or `"supplier"`) and a full `file_url`.
Without `supplier_id`, the endpoint returns tour files only.

```json
{
  "id": 6,
  "tour_id": 30,
  "tour_name": "Phi Phi-Bamboo-Pileh-Maya (Speed boat)",
  "original_name": "PhiPhi_Bamboo_Island_1.jpg",
  "file_type": "image",
  "file_category": "gallery",
  "source": "tour",
  "file_url": "https://contactrate.sevensmiletourandticket.com/api/uploads/tours/images/xxx.jpg"
}
```

### 4. Package Tours — `packages.php`

Multi-day packages with day-by-day items.

```
GET /api/public/packages.php
```

| Param | Example | Meaning |
|---|---|---|
| `id` | `?id=3` | One package |

Each package has an `items` array (`day_number`, `time_slot`, `tour_id`, `tour_name`,
`custom_name`, `price`, `unit`, `notes`).

### 5. Hotels — `hotels.php`

Hotels with their gallery, room types, net rates and notices. **This site is the
master record for hotel data** — staff add and edit hotels here, and consuming sites
mirror them.

```
GET /api/public/hotels.php
```

| Param | Example | Meaning |
|---|---|---|
| `id` | `?id=42` | One hotel by our id |
| `slug` | `?slug=the-zign-hotel-pattaya` | One hotel by slug |
| `since` | `?since=2026-07-01` | Only hotels changed on/after that date (incremental sync) |
| `destination` | `?destination=Pattaya` | Substring match on destination |
| `search` | `?search=kokotel` | Match name, destination or short description |
| `stars` | `?stars=4` | Exact star rating |
| `featured` | `?featured=1` | Featured only |
| `active` | `?active=1` | Active only (omit to get both, for mirroring) |
| `page`, `limit` | `?page=2&limit=25` | Pagination (limit max 200, default 100) |

Hotel fields: `id`, `source_id`, `name`, `slug`, `destination`, `stars`,
`description`, `short_description`, `rating`, `review_count`, `main_image`,
`logo`, `amenities[]`, `check_in_time`, `check_out_time`, `address`, `contact_phone`,
`contact_email`, `website`, `is_featured`, `is_active`, `rate_validity`,
`child_policy`, `rate_terms`, `created_at`, `updated_at`

Plus four nested arrays:

| Array | Fields |
|---|---|
| `images` | `image_url`, `category`, `caption`, `sort_order` |
| `room_types` | `name`, `description`, `max_guests`, `bed_type`, `room_size`, `amenities[]`, `sort_order` |
| `rates` | `id`, `room_type`, `period_label`, `period_start`, `period_end`, `meal_plan` (`RO`/`RB`/null), `price`, `currency`, `sort_order`, `is_active` |
| `notices` | `id`, `type` (`stop_sale`/`promotion`), `room_type` (null = whole hotel), `date_start`, `date_end`, `title`, `detail`, `promo_price`, `currency`, `is_active` |

```json
{
  "id": 36,
  "name": "The Rich Residence Sukhumvit Nana",
  "slug": "the-rich-residence-sukhumvit-nana",
  "destination": "Watthana, Bangkok, Thailand",
  "stars": 4,
  "images": [
    {
      "image_url": "https://contactrate.sevensmiletourandticket.com/api/uploads/hotels/36_6a1e859c30928.webp",
      "category": "2-Bedroom Superior Suite",
      "caption": "",
      "sort_order": 0
    }
  ],
  "room_types": [
    { "name": "Twin Room", "max_guests": 2, "bed_type": "Single", "room_size": "35.0" }
  ],
  "rates": [
    { "id": 1, "room_type": "Standard", "period_label": "01 Nov 25 - 25 Dec 25",
      "meal_plan": "RO", "price": 3500, "currency": "THB", "is_active": 1 }
  ],
  "notices": []
}
```

**`rates` are NET (cost) prices, and `notices` include internal stop-sale reasons.**
A consumer may store them, but must never render them on a customer-facing page. Add
your own markup before showing any price to a customer.

Notes for mirroring:
- `is_active` is returned on the hotel and on every nested row, so a consumer can
  mirror inactive records rather than losing them. Filter on your own side.
- `images` and `room_types` carry no stable ids — replace them per hotel on each pull.
- `rates` and `notices` do carry our ids; reuse them as primary keys to keep identity.
- Use `?since=` for routine pulls and a full pull when you need to catch deletions.

---

## Usage examples

**JavaScript (fetch)**
```js
const API = "https://contactrate.sevensmiletourandticket.com/api/public";
const KEY = "sevensmile_2026_001_2026";

const res = await fetch(`${API}/tours.php?supplier_id=7`, {
  headers: { "X-API-Key": KEY },
});
const { success, data } = await res.json();
if (success) console.log(data);
```

**PHP**
```php
$ch = curl_init("https://contactrate.sevensmiletourandticket.com/api/public/suppliers.php");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["X-API-Key: sevensmile_2026_001_2026"]);
$data = json_decode(curl_exec($ch), true);
```

**curl (quick test)**
```bash
curl -H "X-API-Key: sevensmile_2026_001_2026" \
  "https://contactrate.sevensmiletourandticket.com/api/public/tours.php?search=phi%20phi"
```

## Notes

- Read-only. No write endpoints exist.
- Prices and other numbers come back as strings from MySQL (e.g. `"500.00"`, `"35"`) — cast before doing math.
- A `null` means "not recorded", which is never the same as `0` or `false`.
- Empty contact fields may be `""` or `null` — check both.
- Image and PDF links (`file_url`) are public; no key needed to open them.
