import type { GameLocation } from '../types';

export const LOCATIONS: GameLocation[] = [
  {
    id: 'jfk',
    name: 'New York City',
    country: 'United States',
    description: 'Skyscrapers, Broadway shows, and a melting pot of cultures.',
    cuisine: 'Classic slice of New York style pizza with a side of cheesecake.',
    image: 'https://images.unsplash.com/photo-1526402466686-8c6610d1ff19?auto=format&fit=crop&w=800&q=80',
    souvenirs: ['Liberty Crown', 'Broadway Ticket Stub', 'Yellow Cab Miniature'],
  },
  {
    id: 'lhr',
    name: 'London',
    country: 'United Kingdom',
    description: 'Historic landmarks, afternoon tea, and rainy day strolls.',
    cuisine: 'Warm fish and chips served with mushy peas and malt vinegar.',
    image: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=800&q=80',
    souvenirs: ['Union Jack Umbrella', 'Sherlock Holmes Hat', 'Double-Decker Bus Magnet'],
  },
  {
    id: 'hnd',
    name: 'Tokyo',
    country: 'Japan',
    description: 'Neon neighborhoods, tranquil shrines, and bullet trains.',
    cuisine: 'Sushi tasting flight with matcha mochi for dessert.',
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80',
    souvenirs: ['Origami Crane', 'Lucky Cat', 'Bullet Train Ticket'],
  },
  {
    id: 'cdg',
    name: 'Paris',
    country: 'France',
    description: 'Moonlit Seine walks, art galleries, and charming cafés.',
    cuisine: 'Fresh croissants with brie and a glass of sparkling cider.',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    souvenirs: ['Eiffel Tower Keychain', 'Perfume Sample', 'Handwritten Postcard'],
  },
  {
    id: 'syd',
    name: 'Sydney',
    country: 'Australia',
    description: 'Sun-drenched beaches, the Opera House, and harbor ferries.',
    cuisine: 'Grilled barramundi with lemon myrtle butter and pavlova.',
    image: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=800&q=80',
    souvenirs: ['Boomerang', 'Koala Plushie', 'Opal Pendant'],
  },
];
