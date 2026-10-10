import { sql } from '@vercel/postgres';
const areas = ['Knowledge Park','Pari Chowk','Alpha / Beta','Techzone','Greater Noida West'];
for (const [i, name] of areas.entries()) await sql`INSERT INTO areas (name, sort_order) VALUES (${name}, ${i}) ON CONFLICT (name) DO NOTHING`;
const rooms = ['Single Room','2-Seater','3-Seater','4-Seater','6-Seater','Dormitory','1 BHK','2 BHK','3 BHK'];
for (const [i, name] of rooms.entries()) await sql`INSERT INTO room_types (name, sort_order) VALUES (${name}, ${i}) ON CONFLICT (name) DO NOTHING`;
const amenities = ['Wi-Fi','AC','Food','Attached Bathroom','Washing Machine','Geyser','Study Table','Wardrobe','Parking','Power Backup','Common Area','Refrigerator'];
for (const [i, name] of amenities.entries()) await sql`INSERT INTO amenities (name, sort_order) VALUES (${name}, ${i}) ON CONFLICT (name) DO NOTHING`;
await sql`INSERT INTO page_sections (page_key,section_key,title,description,sort_order) VALUES
('home','why','Why Choose PGFinder?','Find a comfortable stay with verified details.',1),
('home','steps','How It Works','Search, compare, enquire and get details.',2)
ON CONFLICT (page_key,section_key) DO NOTHING`;
await sql`INSERT INTO faqs (category,question,answer,sort_order) VALUES
('General','How do I enquire about a property?','Open a property page and submit the enquiry form or use the WhatsApp button.',1),
('Privacy','Is the exact address public?','No. Exact addresses and owner contact details are kept private and shared only through an authorised enquiry process.',2)
ON CONFLICT DO NOTHING`;
console.log('Development seed data inserted. Do not run against production.');
