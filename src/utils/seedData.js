import { collection, doc, writeBatch, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

const MOCK_LOCATIONS = [
    {
        id: 'local-point',
        name: 'Local Point',
        type: 'dining_hall',
        campusArea: 'west',
        imageUrl: null,
        avgRating: 4.2,
        reviewCount: 187,
        badges: ['Late Night Friendly', 'Good Value'],
        schoolId: 'uw',
        description: 'All-you-care-to-eat dining hall in Lander Hall with diverse food stations.',
        status: 'approved'
    },
    {
        id: 'center-table',
        name: 'Center Table',
        type: 'dining_hall',
        campusArea: 'north',
        imageUrl: null,
        avgRating: 3.9,
        reviewCount: 145,
        badges: ['Good Value'],
        schoolId: 'uw',
        description: 'Resident dining in Maple Hall featuring comfort food and rotating menus.',
        status: 'approved'
    },
    {
        id: 'mcmahon-hall',
        name: 'McMahon Hall Dining',
        type: 'dining_hall',
        campusArea: 'north',
        imageUrl: null,
        avgRating: 3.6,
        reviewCount: 203,
        badges: ['Late Night Friendly'],
        schoolId: 'uw',
        description: 'North campus dining hall known for late-night hours and variety.',
        status: 'approved'
    },
    {
        id: 'district-market',
        name: 'District Market',
        type: 'market',
        campusArea: 'west',
        imageUrl: null,
        avgRating: 4.4,
        reviewCount: 89,
        badges: ['Fast Lines'],
        schoolId: 'uw',
        description: 'Convenience store in the District with grab-and-go meals and snacks.',
        status: 'approved'
    },
    {
        id: 'the-8',
        name: 'The 8',
        type: 'dining_hall',
        campusArea: 'west',
        imageUrl: null,
        avgRating: 4.1,
        reviewCount: 156,
        badges: ['Good Value', 'Fast Lines'],
        schoolId: 'uw',
        description: 'Modern dining hall on 8th floor of Alder Hall with stunning views.',
        status: 'approved'
    },
    {
        id: 'suzzallo-cafe',
        name: 'Suzzallo Café',
        type: 'cafe',
        campusArea: 'central',
        imageUrl: null,
        avgRating: 4.3,
        reviewCount: 234,
        badges: ['Fast Lines'],
        schoolId: 'uw',
        description: 'Coffee and quick bites in Suzzallo Library, perfect for study breaks.',
        status: 'approved'
    },
    {
        id: 'by-george',
        name: 'By George',
        type: 'cafe',
        campusArea: 'central',
        imageUrl: null,
        avgRating: 4.0,
        reviewCount: 178,
        badges: ['Fast Lines'],
        schoolId: 'uw',
        description: 'Popular café in the HUB with sandwiches, salads, and espresso.',
        status: 'approved'
    },
    {
        id: 'hub-underground',
        name: 'Husky Den (HUB)',
        type: 'market',
        campusArea: 'central',
        imageUrl: null,
        avgRating: 3.8,
        reviewCount: 267,
        badges: ['Late Night Friendly', 'Fast Lines'],
        schoolId: 'uw',
        description: 'Food court in the HUB with multiple vendors including Panda Express and Subway.',
        status: 'approved'
    }
];

export const seedDiningLocations = async () => {
    try {
        console.log('Seeding dining locations...');
        const batch = writeBatch(db);
        const locationsRef = collection(db, 'dining_locations');

        // Check if data already exists to avoid overwriting/duplicates
        // For simplicity in this seed script, we just overwrite by ID

        MOCK_LOCATIONS.forEach(location => {
            const docRef = doc(locationsRef, location.id);
            batch.set(docRef, location, { merge: true });
        });

        await batch.commit();
        console.log('Successfully seeded dining locations!');
        return true;
    } catch (error) {
        console.error('Error seeding dining locations:', error);
        return false;
    }
};
