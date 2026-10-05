# Vela exercise data sources

## RepDB free tier

Vela's bundled exercise catalogue and pose illustrations come from the [RepDB exercise dataset](https://github.com/RepDB/exercise-dataset), schema version 3.

[Exercise data by RepDB (repdb.co)](https://repdb.co)

The free-tier licence permits personal and commercial in-app use with attribution. It prohibits republishing the content as a standalone dataset or API and prohibits using the images as generative-AI input or conditioning material. The `premium-samples/` preview animations are evaluation-only and are deliberately excluded from Vela. See the [canonical RepDB free-tier licence](https://github.com/RepDB/exercise-dataset/blob/main/LICENSE-DATA.md) for the complete terms.

## What Vela stores

- `src/products/Vela/data/generated/exercises.json` contains the normalized in-app catalogue.
- `public/vela/exercises/repdb/` contains only flat WebP files referenced by the free-tier JSON.
- RepDB descriptions, instructions, tips and anatomical fields remain source-authored.
- Movement patterns, broad muscle groups, equipment classes, progression types and curation tiers are deterministic Vela-derived fields.
- Historical Vela IDs are mapped during import so existing workout logs and deep links continue to resolve.

## Updating the catalogue

1. Clone or update the official RepDB repository outside this repository.
2. Review its README, schema version and licence for changes.
3. Run `npm run vela:import-exercises -- --source /absolute/path/to/exercise-dataset`.
4. Review the generated diff, especially equipment mappings and historical IDs.
5. Run `npm test -- --watchAll=false`, `npm run type-check`, and `npm run build`.

The importer rejects unexpected schema versions, invalid records and missing referenced images. It also removes stale files from the dedicated RepDB media directory. Never point the importer at `premium-samples/` and never add those previews to production.
