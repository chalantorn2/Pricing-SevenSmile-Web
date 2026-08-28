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
| `search` | `?search=phi phi` | Match tour name or supplier name |

Fields returned:

Tour: `id`, `supplier_id`, `tour_name`, `departure_from`, `destination`, `pier`, `tour_type`,
`adult_price`, `child_price`, `start_date`, `end_date`, `notes`,
`park_fee_included`, `park_fee_adult`, `park_fee_child`, `map_url`, `created_at`, `updated_at`

Supplier: `supplier_name`, `address`, `phone`, `phone_2` … `phone_5`,
`line`, `facebook`, `whatsapp`, `website`, `email`

Example:
```json
{
  "id": 19,
  "supplier_id": 7,
  "tour_name": "4 Islands Speed Boat",
  "departure_from": "Krabi",
  "pier": "Nopparat Thara Pier",
  "adult_price": "500.00",
  "child_price": "400.00",
  "start_date": "2025-05-15",
  "end_date": "2026-05-15",
  "park_fee_included": 0,
  "supplier_name": "Orchid",
  "phone": "0984541233"
}
```

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
- Prices are strings from MySQL `DECIMAL` (e.g. `"500.00"`) — cast before doing math.
- Empty contact fields may be `""` or `null` — check both.
- Image and PDF links (`file_url`) are public; no key needed to open them.
