import type { Category, MenuItem } from '../types';

export const MENU: Record<Category, readonly MenuItem[]> = {
  steamed: [
    { id:1,  name:"Ahmedabad Khaman", unit:"(6 pcs)",  price:4.99,  photo:"Photos/Khaman.webp",           pos:"center center", emoji:"🫓", bg:"linear-gradient(135deg,#D4830A,#8B5000)", desc:"Soft, spongy steamed gram flour cake — Ahmedabad's most beloved snack. Served with fresh coriander chutney." },
    { id:2,  name:"Ahmedabad Dhokla", unit:"(6 pcs)",  price:5.99,  photo:"Photos/Dhokla.jpg",           pos:"center center", emoji:"🟡", bg:"linear-gradient(135deg,#C8A020,#7A6000)", desc:"Fluffy fermented dhokla tempered with mustard seeds, green chilli &amp; curry leaves. A Gujarati classic." },
    { id:3,  name:"Tam Tam Khaman",   unit:"(6 pcs)",  price:6.99,  photo:"Photos/Tam_Tam_Khaman.jpg",    pos:"center center", emoji:"🧆", bg:"linear-gradient(135deg,#C44B1A,#8B2500)", desc:"A spicier, crispy-edged khaman with a signature tangy tempering. A real crowd favourite." },
    { id:4,  name:"Idada",            unit:"(6 pcs)",  price:6.99,  photo:"Photos/Idada.jpg",             pos:"center 35%",    emoji:"🤍", bg:"linear-gradient(135deg,#8B6513,#5C3D0E)", desc:"White rice &amp; urad dal steamed cake, light and delicate. A traditional breakfast favourite from Surat." },
  ],
  street: [
    { id:5,  name:"Mumbai Vada Pav",    unit:"(2 pcs)", price:6.99, photo:"Photos/Vada_Pav.png",          pos:"center center", emoji:"🍔", bg:"linear-gradient(135deg,#C44B1A,#8B2500)", desc:"The legendary Mumbai street burger — crispy potato vada in a soft pav with chutneys. Pure street magic." },
    { id:6,  name:"Kutchi Dabeli",      unit:"(2 pcs)", price:6.99, photo:"Photos/Dabeli.webp",           pos:"center 65%",    emoji:"🥙", bg:"linear-gradient(135deg,#A83820,#6B1500)", desc:"Sweet &amp; spicy Kutch-style sandwich stuffed with masala potato, pomegranate seeds &amp; roasted peanuts." },
    { id:7,  name:"Spicy Samosa",       unit:"(2 pcs)", price:6.99, photo:"Photos/Samosa.jpg",            pos:"center 35%",    emoji:"🔺", bg:"linear-gradient(135deg,#D4830A,#A05000)", desc:"Golden crispy pastry filled with peppery potato &amp; peas. Made fresh, not frozen. Served with chutneys." },
    { id:8,  name:"Batata Vada",        unit:"(4 pcs)", price:6.99, photo:"Photos/Batata_Vada.jpg",       pos:"center 55%",    emoji:"🟤", bg:"linear-gradient(135deg,#8B4513,#5C2D0E)", desc:"Classic besan-battered potato fritters, spiced to perfection. Great on their own or with green chutney." },
    { id:9,  name:"Bhavnagari Mirchi",  unit:"(4 pcs)", price:8.99, photo:"Photos/bhavnagri_mirchi.jpg",  pos:"center 45%",    emoji:"🌶️", bg:"linear-gradient(135deg,#A00000,#600000)", desc:"Bhavnagar's iconic stuffed green chilli fritters — bold, addictive, and not for the faint-hearted! 🔥" },
  ],
  sweet: [
    { id:10, name:"Gulab Jamun",        unit:"(4 pcs)", price:5.99,  photo:"Photos/Gulab_Jamun.jpg",      pos:"center 60%",    emoji:"🟠", bg:"linear-gradient(135deg,#C44B1A,#8B2500)", desc:"Soft milk solids dumplings soaked in rose-cardamom sugar syrup. A heavenly Gujarati mithai." },
    { id:11, name:"Shrikhand",          unit:"(500g)",  price:9.99,  photo:"Photos/Shrikhand.jpg",        pos:"center 40%",    emoji:"🫙", bg:"linear-gradient(135deg,#E8A020,#A06000)", desc:"Creamy strained yogurt sweetened with sugar &amp; saffron. Made fresh with full-fat dahi." },
    { id:12, name:"Mango Shrikhand",    unit:"(500g)",  price:12.99, photo:"Photos/Mango_Shrikhand.jpg",  pos:"center center", emoji:"🥭", bg:"linear-gradient(135deg,#D4830A,#8B5000)", desc:"Shrikhand blended with Alphonso mango pulp — an irresistible summer special worth every euro." },
  ],
  specials: [
    { id:13, name:"Surti Undhiyu",      unit:"(500g)",  price:16.99, photo:"Photos/Surati-Undhiyu.jpg",   pos:"center 40%",    emoji:"🫕", bg:"linear-gradient(135deg,#5C7A20,#2A4008)", desc:"The king of Gujarati winter dishes — slow-cooked seasonal vegetables with fenugreek muthiya. A labour of love.", preorder:true },
    { id:14, name:"Handvo",             unit:"(2 pcs)", price:8.99,  photo:"Photos/handvo.webp",          pos:"center center", emoji:"🍞", bg:"linear-gradient(135deg,#8B4513,#5C2D0E)", desc:"Savoury Gujarati lentil cake baked with vegetables &amp; sesame seeds. Crispy outside, soft inside." },
    { id:16, name:"Pani Poori",         unit:"(10 pcs)",price:7.99,  photo:"Photos/pani_puri.jpg",        pos:"center center", emoji:"🫧", bg:"linear-gradient(135deg,#1B7A4A,#0D4A28)", desc:"Crispy hollow puris filled with tangy tamarind water, spiced potato &amp; chickpeas. The ultimate Gujarati street snack!" },
    { id:17, name:"Thepla+Mixed Pickle", unit:"(10 pcs)", price:13.99, photo:"Photos/thepla.webp", pos:"center center", emoji:"🫓", bg:"linear-gradient(135deg,#C47A1A,#7A4208)", desc:"Soft, golden Gujarati flatbreads made with fresh fenugreek leaves — fragrant, lightly spiced, and pan-roasted to perfection. Served with a tangy Mixed Pickle that brings it all together." },
  ],
  drinks: [
    { id:15, name:"Masala Chaas",       unit:"(250ml)", price:1.99,  photo:"Photos/masala_chaas.webp",    pos:"center 50%",    emoji:"🥛", bg:"linear-gradient(135deg,#4A7A90,#2A4A5C)", desc:"Chilled buttermilk tempered with cumin, black salt, ginger &amp; fresh coriander. The perfect digestif." },
  ],
  party: [
    { id:18, name:"Batata Poha",     unit:"(per person)", price:6.99,  minQty:5, photo:"Photos/Batata_Poha.webp",      pos:"center 40%", emoji:"🍚", bg:"linear-gradient(135deg,#D4A017,#8B6500)", desc:"Fluffy flattened rice tossed with turmeric, mustard seeds, peanuts &amp; fresh coriander. A light, comforting Gujarati breakfast classic for the whole group." },
    { id:19, name:"Pav Bhaji",       unit:"(per person)", price:9.99, minQty:5, photo:"Photos/Pav_Bhaji.webp",        pos:"center 60%", emoji:"🍛", bg:"linear-gradient(135deg,#C44B1A,#8B2500)", desc:"Buttery mashed vegetable bhaji simmered in signature masala, served with toasted pav, onions &amp; lemon. The ultimate crowd-pleaser." },
    { id:20, name:"Sev Tameta",      unit:"(per person)", price:7.99,  minQty:5, photo:"Photos/Sev_Tameta.jpg",        pos:"center 40%", emoji:"🍅", bg:"linear-gradient(135deg,#B83A20,#701800)", desc:"Tangy Kathiyawadi tomato curry topped generously with crispy sev. Sweet, spicy &amp; utterly addictive with rotli or rice." },
    { id:21, name:"Lasaniya Bataka", unit:"(per person)", price:8.99,  minQty:5, photo:"Photos/Lasaniya_Bataka.jpg",   pos:"center 60%", emoji:"🥔", bg:"linear-gradient(135deg,#A83820,#5C1500)", desc:"Fiery Kathiyawadi baby potatoes slow-cooked in a bold garlic-red chilli masala. For those who love it hot! 🔥" },
    { id:22, name:"Gujarati Dal",    unit:"(per person)", price:8.99,  minQty:5, photo:"Photos/Gujarati_Dal.jpg",      pos:"center 55%", emoji:"🥣", bg:"linear-gradient(135deg,#C8A020,#7A6000)", desc:"The iconic sweet-tangy-spicy toor dal with peanuts, kokum &amp; jaggery. Tastes just like home — khatti mithi perfection." },
    { id:23, name:"Gujarati Kadhi",  unit:"(per person)", price:8.99,  minQty:5, photo:"Photos/Gujarati_Kadhi.webp",   pos:"center 45%", emoji:"🍜", bg:"linear-gradient(135deg,#E8A020,#A06000)", desc:"Silky yogurt-besan kadhi tempered with curry leaves, cloves &amp; cinnamon. Light, soothing &amp; the perfect partner to khichdi or rice." },
    { id:28, name:"Sukhi Bhaji",      unit:"(per person)", price:6.99,  minQty:5, photo:"Photos/Sukhi_Bhaji.jpeg",       pos:"center 50%", emoji:"🥔", bg:"linear-gradient(135deg,#C8A020,#7A6000)", desc:"Dry-spiced baby potatoes tempered with cumin &amp; sesame, finished with pomegranate, roasted peanuts &amp; fresh coriander. A festive Gujarati classic." },
  ],
  partymeals: [
    { id:24, name:"Lasaniya Kaju",        unit:"(per person)", price:17.99, minQty:5, breadChoice:true, photo:"Photos/Lasaniya_Kaju.webp",         pos:"center 50%", emoji:"🥘", bg:"linear-gradient(135deg,#A83820,#5C1500)", desc:"Rich cashews simmered in a bold Kathiyawadi garlic-chilli gravy — indulgent, fiery &amp; unforgettable. Served with 3 roti or paratha per person." },
    { id:25, name:"Kaju Gathiya",         unit:"(per person)", price:17.99, minQty:5, breadChoice:true, photo:"Photos/Kaju_Gathiya.jpg",           pos:"center 55%", emoji:"🍲", bg:"linear-gradient(135deg,#C47A1A,#7A4208)", desc:"A royal Kathiyawadi shaak of cashews &amp; soft gathiya in a spiced yogurt-tomato gravy. Served with 3 roti or paratha per person." },
    { id:26, name:"Paneer Butter Masala", unit:"(per person)", price:16.99, minQty:5, breadChoice:true, photo:"Photos/Paneer_Butter_Masala.webp",   pos:"center 45%", emoji:"🧈", bg:"linear-gradient(135deg,#C44B1A,#8B2500)", desc:"Soft paneer cubes in a silky, buttery tomato-cashew gravy — everyone's favourite, made the homely way. Served with 3 roti or paratha per person." },
    { id:27, name:"Gujarati Thali",       unit:"(per person)", price:23.99, minQty:5, hero:true, breadChoice:true, snackChoice:true, photo:"Photos/Gujarati_Thali.jpeg",              pos:"center 35%", emoji:"🍽️", bg:"linear-gradient(135deg,#5C7A20,#2A4008)", desc:"<strong>A complete meal</strong> — the full Gujarati feast on one plate: 1 samosa, paneer sabzi, dal, steamed rice, sweet of the day, salad, raita, achar &amp; a glass of masala chaas. Choose your roti/paratha &amp; Khaman/Dhokla below." },
  ],
};

// Keep the original catalogue immutable at runtime.
Object.values(MENU).forEach((items) => {
  items.forEach((item) => Object.freeze(item));
  Object.freeze(items);
});
Object.freeze(MENU);
