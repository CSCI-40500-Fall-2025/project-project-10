Find Housing – Frontend MVP (React + TS)

How to run
- cd frontend
- npm run dev

What’s included
- Signup/Login: Simple forms storing user in localStorage (name, age, gender, employer, passcode). No real auth.
- Listings grid: Mock data generated on first load, stored in localStorage.
- Sorting/Filtering: City, price range, beds; sort by price, beds, or soonest availability.
- Favorites: Save/unsave listings (stored locally).

Key files
- src/types.ts: Type definitions.
- src/storage.ts: localStorage helpers.
- src/mockListings.ts: Mock listings generator.
- src/components/ListingCard.tsx: Card UI for listings.
- src/components/Filters.tsx: Filter + sort controls.
- src/App.tsx: App shell, auth flow, grid view.

Notes
- All data is local and resets if you clear browser storage.
- Easy to swap mock data with scraped Zillow data later.

