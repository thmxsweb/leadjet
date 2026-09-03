# leadjet

Find business leads from **Google Places** and export exactly the fields you want — as JSON, CSV, or NDJSON. Ships as an npm CLI and as standalone binaries (no Node required).

[![CI](https://github.com/thmxsweb/leadjet/actions/workflows/ci.yml/badge.svg)](https://github.com/thmxsweb/leadjet/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/leadjet.svg)](https://www.npmjs.com/package/leadjet)
[![license](https://img.shields.io/github/license/thmxsweb/leadjet)](./LICENSE)

## Install

**npm** (needs Node 18.17+):

```bash
npm install -g leadjet
```

**Standalone binary** (no Node): download from the [Releases](https://github.com/thmxsweb/leadjet/releases) page — `leadjet-win.exe`, `leadjet-macos`, `leadjet-linux`. On Windows, the installer places `leadjet` in `C:\Program Files (x86)\Leadjet` and adds it to your `PATH`.

## Quick start

```bash
# 1. Set your Google Places API key once (stored in your user config).
leadjet config set places-key AIza...

# 2. Find leads and print them.
leadjet find "plumbers in Bordeaux"

# 3. Choose fields and export to a file.
leadjet find "hair salons in Montreal" --fields name,phone,website,rating -o leads.csv
```

Get a key in [Google Cloud](https://console.cloud.google.com/) and enable **Places API (New)**.

## Commands

### `leadjet find <query...>`

Find businesses and export them. Two sources:

- **`places`** — Google Places (New). Best coverage and ratings; needs an API key.
- **`osm`** — OpenStreetMap (Nominatim + Overpass). **Free, no key.** Great for
  finding businesses that have no website yet (they sort first).

If you don't pass `--source`, leadjet uses `places` when a key is set, otherwise `osm`.

| Option                | Description                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------ |
| `-s, --source <src>`  | `places` (Google, needs key) or `osm` (OpenStreetMap, free).                                           |
| `-f, --fields <list>` | Comma-separated fields to export (see `leadjet fields`). Default: `name,address,phone,website,rating`. |
| `-l, --limit <n>`     | Max leads (paginates 20 at a time, up to 200). Default `20`.                                           |
| `-o, --out <file>`    | Write to a file instead of stdout. Format is inferred from the extension.                              |
| `--format <fmt>`      | `json` (default), `csv`, or `ndjson`.                                                                  |
| `--country <name>`    | Target country by name or ISO code, e.g. `Canada`, `CA`, `France`.                                    |
| `--region <name>`     | Target region / state / province, e.g. `Quebec`, `QC`, `Île-de-France`.                               |
| `--city <name>`       | Target city, e.g. `Montreal`, `Paris`, `Lyon`.                                                        |
| `--category <cat>`    | OSM only: `any`, `shops`, `food`, `craft`, `services`, `beauty`.                                       |
| `--language <code>`   | Language code, e.g. `fr`, `en`.                                                                        |
| `--key <key>`         | Use this API key instead of the saved one (Places).                                                   |

#### Targeting a location

Combine `--country`, `--region`, and `--city` to aim at exactly one place. The
same flags work for both sources:

```bash
# Google Places
leadjet find "restaurants" --city Montreal --region QC --country CA --limit 50
leadjet find "boulangeries" --city Paris --region "Île-de-France" --country FR

# OpenStreetMap (free, no key) — needs at least one of country/region/city
leadjet find "plumbers" --source osm --city Lyon --country FR --append leads.ndjson
leadjet find "coiffeurs" --source osm --city "Saint-Jean-sur-Richelieu" --country CA
```

You can also save a default target so you don't repeat it:

```bash
leadjet config set country Canada
leadjet config set region Quebec
leadjet config set city Montreal
leadjet config set source osm
```

Output goes to **stdout** so you can pipe it; progress and messages go to stderr.

#### Building a lead dataset (`--append`)

To grow one clean dataset across many searches, use `--append`. New leads are
added and **duplicates are skipped** (by Google Place ID, falling back to
name + address). `place_id` is included automatically so the dataset stays
de-dupable. Append works with `json` or `ndjson` (NDJSON recommended).

```bash
leadjet find "bakeries in Lyon"     --append leads.ndjson
leadjet find "cafes in Lyon"        --append leads.ndjson
leadjet find "restaurants in Lyon"  --append leads.ndjson
# → leads.ndjson keeps growing, no duplicates
```

**Which format?** For feeding another tool, **NDJSON** is best (append-friendly,
streamable, one record per line — ideal for bulk DB import). **JSON** is best for
a single programmatic import; **CSV** is best for spreadsheets and human review.

#### Proxies

Route requests through HTTP(S) proxies to avoid rate limits or IP blocks — one
proxy, or a rotating list (round-robin, one proxy per page request).

```bash
# One proxy for this command
leadjet find "cafes in Nice" --proxy http://user:pass@host:8080

# Rotate through a file (one proxy per line; # comments allowed)
leadjet find "cafes in Nice" --proxies-file proxies.txt

# Or save a rotating list once
leadjet config set proxies "http://host1:8080,http://user:pass@host2:8080"
leadjet find "cafes in Nice"     # uses the saved proxies automatically
```

Precedence: `--proxy` › `--proxies-file` › saved `proxies`. Credentials are
masked whenever the config is printed.

### `leadjet fields`

List every field you can export (name, address, phone, website, rating, reviews, maps, type, status, lat, lng, place_id).

### `leadjet config`

```bash
leadjet config set places-key <KEY>     # your Google Places API key
leadjet config set fields name,phone    # default fields for `find`
leadjet config set region FR            # default region
leadjet config set format csv           # default output format
leadjet config get places-key           # masked
leadjet config list                     # all settings (key masked)
leadjet config path                     # where the config lives
```

## Where your data lives

Settings are stored per-user in your OS config directory:

- **Windows:** `%APPDATA%\leadjet\config.json` (Roaming)
- **macOS:** `~/Library/Application Support/leadjet/config.json`
- **Linux:** `~/.config/leadjet/config.json`

The API key is written with `0600` permissions and masked whenever printed.

## Fields → CSV

`leadjet find ... --fields name,phone,website --format csv` produces a header row of your chosen fields and one row per lead, with proper CSV escaping. Missing values are empty.

## Develop

```bash
pnpm install
pnpm dev -- find "cafes in Nice"   # run from source (tsx)
pnpm check                         # typecheck + lint + format + test + build
pnpm build:binaries                # build win/macOS/linux executables into ./release
```

## License

[MIT](./LICENSE) © thmxsweb
