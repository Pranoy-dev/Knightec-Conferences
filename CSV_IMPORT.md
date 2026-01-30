# Importing conferences (CSV or JSON)

This replaces **all** existing conferences (and their ratings) with data from your file.

## Quick start

1. Put your file somewhere (e.g. `./data/conferences.json` or `./data/conferences.csv`).
2. From the `knightecconf` folder, run:

**JSON:**
```bash
npm run import-conferences-json -- path/to/your-file.json
```

**CSV:**
```bash
npm run import-conferences -- path/to/your-file.csv
```

Or with Node directly:
```bash
node scripts/import-conferences-from-json.js path/to/your-file.json
node scripts/import-conferences-from-csv.js path/to/your-file.csv
```

3. Ensure `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

---

## JSON format

Your file can be:

- **An array of objects:** `[ { "name": "...", "location": "...", ... }, ... ]`
- **An object with an array:** `{ "conferences": [ ... ] }` or `{ "events": [ ... ] }` or `{ "data": [ ... ] }`

Keys are **case-insensitive**. You can use `name` or `eventName`, `start_date` or `startDate`, etc.

**Required fields per item:** `name`, `location`, `category`, `price`  
**Optional:** `currency`, `start_date`, `end_date`, `event_link`, `notes`, `status`, `reason_to_go`, `office`, `assigned_to`

Example (see `scripts/conferences-import-template.json`):

```json
[
  {
    "name": "Tech Summit 2025",
    "location": "Stockholm",
    "category": "AI",
    "price": 1500,
    "currency": "SEK",
    "start_date": "2025-03-15",
    "end_date": "2025-03-16",
    "event_link": "https://example.com/event",
    "status": "Interested",
    "reason_to_go": "Learn AI",
    "office": "Stockholm",
    "assigned_to": "john@example.com"
  }
]
```

---

## CSV format

## CSV format

- **First row must be headers.** Column names are case-insensitive; spaces and dashes are treated as underscores.
- **Required columns:** `name`, `location`, `category`, `price`
- **Optional columns:** `currency`, `start_date`, `end_date`, `event_link`, `notes`, `status`, `reason_to_go`, `office`, `assigned_to`

### Column details

| Column        | Description                                      | Example                    |
|---------------|--------------------------------------------------|----------------------------|
| name          | Conference/event name                            | Tech Summit 2025           |
| location      | City or venue                                    | Stockholm                  |
| category      | Category name (must exist in categories table)   | AI                         |
| price         | Number (use `.` for decimals)                    | 1500                       |
| currency      | Default: SEK                                     | SEK, EUR                   |
| start_date    | Start date                                       | 2025-03-15                 |
| end_date      | End date                                         | 2025-03-16                 |
| event_link    | URL                                              | https://example.com/event  |
| notes         | Free text                                        |                            |
| status        | One of: Interested, Planned, Booked, Attended    | Interested                 |
| reason_to_go  | Free text                                        |                            |
| office        | Office **name** (must exist in offices table)    | Stockholm                  |
| assigned_to   | Person **email** (must exist in people table)    | john@example.com          |

Use double quotes for fields that contain commas, e.g. `"Stockholm, Sweden"`.

A sample file is in `scripts/conferences-import-template.csv`.

## What the script does

1. **Deletes all conferences** in the database (ratings are removed automatically by cascade).
2. **Parses your CSV** and validates required fields.
3. **Resolves** `office` by name and `assigned_to` by email to IDs; unknown values are left empty.
4. **Inserts** all valid rows as new conferences.

Rows with missing required fields are skipped and reported; the rest are imported.
