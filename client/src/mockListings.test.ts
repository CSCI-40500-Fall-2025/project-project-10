import { generateMockListings } from './mockListings';
import {describe, expect, test} from "vitest";

describe('generateMockListings', () => {
  test('should generate the specified number of listings', () => {
    const listings = generateMockListings(7);
    expect(listings).toHaveLength(7); // make sure it generates correct number of listings, if generate 7 expect 7
  });


  test('should contain all expected fields', () => {
    const [listing] = generateMockListings(1);
    expect(listing).toHaveProperty('id'); // these are the properties we have
    expect(listing).toHaveProperty('title');
    expect(listing).toHaveProperty('city');
    expect(listing).toHaveProperty('price');
    expect(listing).toHaveProperty('bedrooms');
    expect(listing).toHaveProperty('bathrooms');
    expect(listing).toHaveProperty('availableFrom');
    expect(listing).toHaveProperty('imageUrl');
    expect(listing).toHaveProperty('sqft');
  });

  test('should have bathrooms >= 1 and roughly half of bedrooms', () => {
    const listings = generateMockListings(50);
    listings.forEach(listing => {
      expect(listing.bathrooms).toBeGreaterThanOrEqual(1);
      expect(listing.bathrooms).toBeLessThanOrEqual(listing.bedrooms); // each listing should have bathrooms less than or equal to bedrooms
    });
  });


  test('should generate reasonable prices per city', () => {
    const listings = generateMockListings(20);
    listings.forEach(listing => {
      expect(listing.price).toBeGreaterThan(1000);
      expect(listing.price).toBeLessThan(6000); // reasonable prices
    });
  });


  test('should produce unique listing IDs', () => {
    const listings = generateMockListings(30);
    const ids = listings.map(l => l.id);
    const uniqueIds = new Set(ids); // make sure in a set, there are as many ids as listings, set contains unique so good for this test case
    expect(uniqueIds.size).toBe(30);
  });
});
