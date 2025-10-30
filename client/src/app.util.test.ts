import {describe, expect, test} from "vitest";

import { updateListings } from "./app.util";
import { type Listing } from "./types";
import { type FiltersState } from "./components/Filters";

/**
 * Testing the updateListing functions used in the search page
 */
describe('Update Listing', () => {

    const listings : Listing[] = [
        {
            id: '1',
            title: '1BR near SoMa',
            city: 'San Francisco',
            price: 3200,
            bedrooms: 1,
            bathrooms: 1,
            availableFrom: '2025-11-04T00:00:00.000Z',
            imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
            sqft: 560,
            furnished: true,
            petsAllowed: true,
            description: 'Cozy and bright 1BR walk-up.',
        },
        {
            id: '2',
            title: '2BR in Capitol Hill',
            city: 'Boston',
            price: 2400,
            bedrooms: 2,
            bathrooms: 1,
            availableFrom: '2025-11-15T00:00:00.000Z',
            imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',
            sqft: 820,
            furnished: false,
            petsAllowed: true,
            description: 'Close to transit and cafes.',
        },
        {
            id: '3',
            title: 'Studio Back Bay',
            city: 'Boston',
            price: 2100,
            bedrooms: 3,
            bathrooms: 1,
            availableFrom: '2025-12-01T00:00:00.000Z',
            imageUrl: 'https://images.unsplash.com/photo-1598928506311-9db8dfff2a5b',
            sqft: 480,
            furnished: false,
            petsAllowed: false,
            description: 'Great location for students.',
        },
        {
            id: '4',
            title: 'Studio Back Bay',
            city: 'Boston',
            price: 2000,
            bedrooms: 4,
            bathrooms: 4,
            availableFrom: '2024-12-01T00:00:00.000Z',
            imageUrl: 'https://images.unsplash.com/photo-1598928506311-9db8dfff2a5b',
            sqft: 480,
            furnished: false,
            petsAllowed: false,
            description: 'Great location for students.',
        },
    ];

    test('Testing if the location filter works', () => {
        const filter : FiltersState = {city : "Boston", minPrice: 0, maxPrice: 0, beds: '', sort: "priceAsc"}
        const newListings : Listing[] = updateListings(listings, filter);

        expect(newListings.length).toBe(3)
        expect(newListings.every((val) => val.city === "Boston")).toBeTruthy
    });
    test('Testing if the bedroom filter works', () => {
        const filter : FiltersState = {city : "", minPrice: 0, maxPrice: 0, beds: '2', sort: "priceAsc"}
        const newListings : Listing[] = updateListings(listings, filter);

        expect(newListings.length).toBe(1)
        expect(newListings.every((val) => val.bedrooms === 2)).toBeTruthy
    });
    test('Testing if the min price filter works', () => {
        const filter : FiltersState = {city : "", minPrice: 2200, maxPrice: 0, beds: '', sort: "priceAsc"}
        const newListings : Listing[] = updateListings(listings, filter);

        expect(newListings.length).toBe(2)
        expect(newListings.every((val) => val.price >= 2200)).toBeTruthy
    });
    test('Testing if the max price filter works', () => {
        const filter : FiltersState = {city : "", minPrice: 0, maxPrice: 2200, beds: '', sort: "priceAsc"}
        const newListings : Listing[] = updateListings(listings, filter);

        expect(newListings.length).toBe(2)
        expect(newListings.every((val) => val.price <= 2200)).toBeTruthy
    });
    test('Testing if the priceAsc works', () => {
        const filter : FiltersState = {city : "", minPrice: 0, maxPrice: 0, beds: '', sort: "priceAsc"}
        const newListings : Listing[] = updateListings(listings, filter);

        expect(newListings[0].id).toBe('4')
        expect(newListings[1].id).toBe('3')
        expect(newListings[2].id).toBe('2')
        expect(newListings[3].id).toBe('1')
    })
    test('Testing if the priceDesc works', () => {
        const filter : FiltersState = {city : "", minPrice: 0, maxPrice: 0, beds: '', sort: "priceDesc"}
        const newListings : Listing[] = updateListings(listings, filter);

        expect(newListings[0].id).toBe('1')
        expect(newListings[1].id).toBe('2')
        expect(newListings[2].id).toBe('3')
        expect(newListings[3].id).toBe('4')
    })
    test('Testing if the bedsAsc works', () => {
        const filter : FiltersState = {city : "", minPrice: 0, maxPrice: 0, beds: '', sort: "bedsAsc"}
        const newListings : Listing[] = updateListings(listings, filter);

        expect(newListings[0].id).toBe('1')
        expect(newListings[1].id).toBe('2')
        expect(newListings[2].id).toBe('3')
        expect(newListings[3].id).toBe('4')
    })
    test('Testing if the availAsc works', () => {
        const filter : FiltersState = {city : "", minPrice: 0, maxPrice: 0, beds: '', sort: "availAsc"}
        const newListings : Listing[] = updateListings(listings, filter);

        expect(newListings[0].id).toBe('4')
        expect(newListings[1].id).toBe('1')
        expect(newListings[2].id).toBe('2')
        expect(newListings[3].id).toBe('3')
    })

})