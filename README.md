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

Search Google Places and export the results.

| Option                | Description                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------ |
| `-f, --fields <list>` | Comma-separated fields to export (see `leadjet fields`). Default: `name,address,phone,website,rating`. |
| `-l, --limit <n>`     | Max leads (paginates 20 at a time, up to 200). Default `20`.                                           |
| `-o, --out <file>`    | Write to a file instead of stdout. Format is inferred from the extension.                              |
| `--format <fmt>`      | `json` (default), `csv`, or `ndjson`.                                                                  |
| `--region <code>`     | ISO region code to bias results, e.g. `FR`, `CA`.                                                      |
| `--language <code>`   | Language code, e.g. `fr`, `en`.                                                                        |
| `--key <key>`         | Use this API key instead of the saved one.                                                             |

```bash
leadjet find "boulangeries à Lyon" --fields name,phone,maps --limit 50 --region FR
leadjet find "dentists in Austin" -o dentists.json
```

Output goes to **stdout** so you can pipe it; progress and messages go to stderr.

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
