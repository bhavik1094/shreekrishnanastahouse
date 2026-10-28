import type { Category, MenuItem } from '../types.ts';
import english from '../i18n/locales/en.json' with { type: 'json' };

// Prices, IDs, images, choices and ordering rules stay independent of translations.
const CATALOG: Record<Category, readonly Omit<MenuItem, 'name' | 'unit' | 'desc'>[]> = {
  steamed: [
    { id:1,  price:4.99,  photo:"Photos/Khaman.webp",           pos:"center center", emoji:"🫓", bg:"linear-gradient(135deg,#D4830A,#8B5000)" },
    { id:2,  price:5.99,  photo:"Photos/Dhokla.jpg",           pos:"center center", emoji:"🟡", bg:"linear-gradient(135deg,#C8A020,#7A6000)" },
    { id:3,  price:6.99,  photo:"Photos/Tam_Tam_Khaman.jpg",    pos:"center center", emoji:"🧆", bg:"linear-gradient(135deg,#C44B1A,#8B2500)" },
    { id:4,  price:6.99,  photo:"Photos/Idada.jpg",             pos:"center 35%",    emoji:"🤍", bg:"linear-gradient(135deg,#8B6513,#5C3D0E)" },
  ],
  street: [
    { id:5,  price:6.99, photo:"Photos/Vada_Pav.png",          pos:"center center", emoji:"🍔", bg:"linear-gradient(135deg,#C44B1A,#8B2500)" },
    { id:6,  price:6.99, photo:"Photos/Dabeli.webp",           pos:"center 65%",    emoji:"🥙", bg:"linear-gradient(135deg,#A83820,#6B1500)" },
    { id:7,  price:6.99, photo:"Photos/Samosa.jpg",            pos:"center 35%",    emoji:"🔺", bg:"linear-gradient(135deg,#D4830A,#A05000)" },
    { id:8,  price:6.99, photo:"Photos/Batata_Vada.jpg",       pos:"center 55%",    emoji:"🟤", bg:"linear-gradient(135deg,#8B4513,#5C2D0E)" },
    { id:9,  price:8.99, photo:"Photos/bhavnagri_mirchi.jpg",  pos:"center 45%",    emoji:"🌶️", bg:"linear-gradient(135deg,#A00000,#600000)" },
  ],
  sweet: [
    { id:10, price:5.99,  photo:"Photos/Gulab_Jamun.jpg",      pos:"center 60%",    emoji:"🟠", bg:"linear-gradient(135deg,#C44B1A,#8B2500)" },
    { id:11, price:9.99,  photo:"Photos/Shrikhand.jpg",        pos:"center 40%",    emoji:"🫙", bg:"linear-gradient(135deg,#E8A020,#A06000)" },
    { id:12, price:12.99, photo:"Photos/Mango_Shrikhand.jpg",  pos:"center center", emoji:"🥭", bg:"linear-gradient(135deg,#D4830A,#8B5000)" },
  ],
  specials: [
    { id:13, price:16.99, photo:"Photos/Surati-Undhiyu.jpg",   pos:"center 40%",    emoji:"🫕", bg:"linear-gradient(135deg,#5C7A20,#2A4008)", preorder:true },
    { id:14, price:8.99,  photo:"Photos/handvo.webp",          pos:"center center", emoji:"🍞", bg:"linear-gradient(135deg,#8B4513,#5C2D0E)" },
    { id:16, price:7.99,  photo:"Photos/pani_puri.jpg",        pos:"center center", emoji:"🫧", bg:"linear-gradient(135deg,#1B7A4A,#0D4A28)" },
    { id:17, price:13.99, photo:"Photos/thepla.webp", pos:"center center", emoji:"🫓", bg:"linear-gradient(135deg,#C47A1A,#7A4208)" },
  ],
  drinks: [
    { id:15, price:1.99,  photo:"Photos/masala_chaas.webp",    pos:"center 50%",    emoji:"🥛", bg:"linear-gradient(135deg,#4A7A90,#2A4A5C)" },
  ],
  party: [
    { id:18, price:6.99,  minQty:5, photo:"Photos/Batata_Poha.webp",      pos:"center 40%", emoji:"🍚", bg:"linear-gradient(135deg,#D4A017,#8B6500)" },
    { id:19, price:9.99, minQty:5, photo:"Photos/Pav_Bhaji.webp",        pos:"center 60%", emoji:"🍛", bg:"linear-gradient(135deg,#C44B1A,#8B2500)" },
    { id:20, price:7.99,  minQty:5, photo:"Photos/Sev_Tameta.jpg",        pos:"center 40%", emoji:"🍅", bg:"linear-gradient(135deg,#B83A20,#701800)" },
    { id:21, price:8.99,  minQty:5, photo:"Photos/Lasaniya_Bataka.jpg",   pos:"center 60%", emoji:"🥔", bg:"linear-gradient(135deg,#A83820,#5C1500)" },
    { id:22, price:8.99,  minQty:5, photo:"Photos/Gujarati_Dal.jpg",      pos:"center 55%", emoji:"🥣", bg:"linear-gradient(135deg,#C8A020,#7A6000)" },
    { id:23, price:8.99,  minQty:5, photo:"Photos/Gujarati_Kadhi.webp",   pos:"center 45%", emoji:"🍜", bg:"linear-gradient(135deg,#E8A020,#A06000)" },
    { id:28, price:6.99,  minQty:5, photo:"Photos/Sukhi_Bhaji.jpeg",       pos:"center 50%", emoji:"🥔", bg:"linear-gradient(135deg,#C8A020,#7A6000)" },
  ],
  partymeals: [
    { id:24, price:17.99, minQty:5, breadChoice:true, photo:"Photos/Lasaniya_Kaju.webp",         pos:"center 50%", emoji:"🥘", bg:"linear-gradient(135deg,#A83820,#5C1500)" },
    { id:25, price:17.99, minQty:5, breadChoice:true, photo:"Photos/Kaju_Gathiya.jpg",           pos:"center 55%", emoji:"🍲", bg:"linear-gradient(135deg,#C47A1A,#7A4208)" },
    { id:26, price:16.99, minQty:5, breadChoice:true, photo:"Photos/Paneer_Butter_Masala.webp",   pos:"center 45%", emoji:"🧈", bg:"linear-gradient(135deg,#C44B1A,#8B2500)" },
    { id:27, price:23.99, minQty:5, hero:true, breadChoice:true, snackChoice:true, photo:"Photos/Gujarati_Thali.jpeg",              pos:"center 35%", emoji:"🍽️", bg:"linear-gradient(135deg,#5C7A20,#2A4008)" },
  ],
};

// Canonical English labels keep the existing WhatsApp order format stable.
function canonicalItems(category: Category): readonly MenuItem[] {
  return CATALOG[category].map((item): MenuItem => {
    const text = english.products[String(item.id) as keyof typeof english.products];
    return { ...item, name: text.name, unit: text.unit, desc: text.description };
  });
}

export const MENU: Record<Category, readonly MenuItem[]> = {
  steamed: canonicalItems('steamed'),
  street: canonicalItems('street'),
  sweet: canonicalItems('sweet'),
  specials: canonicalItems('specials'),
  drinks: canonicalItems('drinks'),
  party: canonicalItems('party'),
  partymeals: canonicalItems('partymeals'),
};

// Keep the original catalogue immutable at runtime.
Object.values(MENU).forEach((items) => {
  items.forEach((item) => Object.freeze(item));
  Object.freeze(items);
});
Object.freeze(MENU);
