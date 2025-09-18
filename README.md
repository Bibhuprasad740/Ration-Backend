# Ration Backend (Express + TypeScript)

Simple Express backend (no auth) backing the Flutter client. Uses JSON file persistence at `server/data/db.json` with two collections: `vegetable` and `ration`.

## Setup

- Install deps: `npm install` inside `server/`
- Dev: `npm run dev`
- Build: `npm run build`
- Start: `npm start`
- Default port: `4000`

## Data Model

Product: `{ id: string, name: string, imageUrl: string, addedToFinishedList: boolean }`

## Endpoints

Base URL: `/api`

- POST `/:collection/products` Create product (collection = vegetable|ration)
  - body: `{ name: string, imageUrl: string }`
- PUT `/:collection/products/:id` Update product name/imageUrl
- DELETE `/:collection/products/:id` Delete product
- POST `/:collection/products/:id/finish` Mark as finished
- DELETE `/:collection/products/:id/finish` Remove from finished
- GET `/finished` List all finished across collections

Convenience (optional):
- GET `/:collection/products` List products in a collection
- GET `/:collection/products/:id` Get a single product

## Notes
- This backend stores data on disk; redeployments with ephemeral storage will reset data. For durable storage, connect to a database.
