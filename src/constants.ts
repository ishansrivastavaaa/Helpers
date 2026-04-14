import { Helper } from './types';

export const CATEGORIES = [
  'Housekeeping',
  'Plumbing',
  'Electrician',
  'Painting',
  'AC Repair',
  'RO Service',
  'Carpentry',
  'Gardening',
  'Pandit/Pooja',
  'Cook/Chef',
  'Medical Store',
  'General Store'
];

export const MOCK_HELPERS: Helper[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    category: 'Plumbing',
    skills: ['Pipe Repair', 'Leak Fixing', 'Bathroom Fitting'],
    rating: 4.8,
    reviewCount: 124,
    priceRange: '₹300 - ₹1500',
    description: 'Expert plumber with over 10 years of experience in residential and commercial plumbing. Known for quick response and durable fixes.',
    imageUrl: 'https://images.unsplash.com/photo-1607472586893-edb57cb31322?w=400&h=400&fit=crop',
    phone: '919876543210',
    shopName: 'Rajesh Plumbing Solutions',
    shopAddress: '123, Market Road, Near City Center',
    location: { lat: 28.6139, lng: 77.2090 },
    isAadhaarVerified: true,
    reviews: [
      { id: 'r1', userName: 'Amit S.', rating: 5, comment: 'Very professional and fixed the leak in no time!', date: '2024-03-10' },
      { id: 'r2', userName: 'Priya M.', rating: 4, comment: 'Good work, but arrived 15 mins late.', date: '2024-03-05' }
    ]
  },
  {
    id: '2',
    name: 'Sunita Devi',
    category: 'Housekeeping',
    skills: ['Deep Cleaning', 'Organization', 'Laundry'],
    rating: 4.9,
    reviewCount: 89,
    priceRange: '₹200 - ₹800',
    description: 'Dedicated housekeeping professional specializing in deep cleaning and home organization. I take pride in making homes sparkle.',
    imageUrl: 'https://images.unsplash.com/photo-1584820927498-cafe2c1c9695?w=400&h=400&fit=crop',
    phone: '919876543211',
    location: { lat: 28.6239, lng: 77.2190 },
    isAadhaarVerified: true,
    reviews: [
      { id: 'r3', userName: 'Neha K.', rating: 5, comment: 'Sunita is amazing! My house has never been cleaner.', date: '2024-03-12' }
    ]
  },
  {
    id: '3',
    name: 'Vikram Singh',
    category: 'Electrician',
    skills: ['Wiring', 'Appliance Repair', 'Lighting Installation'],
    rating: 4.7,
    reviewCount: 156,
    priceRange: '₹400 - ₹2000',
    description: 'Certified electrician with expertise in modern home wiring and smart lighting systems. Safety is my top priority.',
    imageUrl: 'https://images.unsplash.com/photo-1621905252502-83e9d44dce36?w=400&h=400&fit=crop',
    phone: '919876543212',
    shopName: 'Singh Electricals',
    shopAddress: 'Shop 45, Sector 12, Main Market',
    location: { lat: 28.6039, lng: 77.1990 },
    isAadhaarVerified: true,
    reviews: [
      { id: 'r4', userName: 'Rahul G.', rating: 5, comment: 'Fixed my AC wiring perfectly. Highly recommended.', date: '2024-03-08' }
    ]
  },
  {
    id: '4',
    name: 'Arjun Verma',
    category: 'Painting',
    skills: ['Interior Painting', 'Wall Texturing', 'Wood Polishing'],
    rating: 4.6,
    reviewCount: 78,
    priceRange: '₹1000 - ₹10000',
    description: 'Creative painter specializing in modern textures and high-quality finishes for your dream home.',
    imageUrl: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=400&fit=crop',
    phone: '919876543213',
    location: { lat: 28.6339, lng: 77.2290 },
    isAadhaarVerified: true,
    reviews: []
  },
  {
    id: '5',
    name: 'City Medicos',
    category: 'Medical Store',
    skills: ['Prescription Medicines', 'First Aid', 'Health Supplements'],
    rating: 4.8,
    reviewCount: 210,
    priceRange: 'Varies',
    description: 'Your trusted neighborhood pharmacy. We stock all major medicines and provide home delivery services.',
    imageUrl: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=400&h=400&fit=crop',
    phone: '919876543214',
    shopName: 'City Medicos & Wellness',
    shopAddress: 'Ground Floor, Apollo Tower, MG Road',
    location: { lat: 28.5939, lng: 77.2390 },
    reviews: [
      { id: 'r5', userName: 'Suresh L.', rating: 5, comment: 'Always have the medicines I need. Fast home delivery.', date: '2024-03-14' }
    ]
  }
];
