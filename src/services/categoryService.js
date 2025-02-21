import { db } from '../config/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';

// Define default categories directly in the service
export const defaultCategories = [
  // 1) Electronics
  {
    name: "Electronics",
    subcategories: [
      {
        name: "Mobile Phones",
        subSub: ["Smartphones", "Feature Phones", "Satellite Phones", "Other Phones"]
      },
      {
        name: "Tablets",
        subSub: ["Android Tablets", "iPads", "Windows Tablets", "Other Tablets"]
      },
      {
        name: "Computers & Laptops",
        subSub: ["Windows Laptops", "MacBooks", "Desktops", "Chromebooks", "Other Computers"]
      },
      {
        name: "Cameras",
        subSub: ["Digital Cameras", "DSLRs", "Mirrorless Cameras", "Action Cameras", "Other Cameras"]
      },
      {
        name: "Audio Equipment",
        subSub: ["Headphones", "Speakers", "Microphones", "Amplifiers", "Audio Players", "Other Audio"]
      },
      {
        name: "Wearables & Gadgets",
        subSub: ["Smartwatches", "Fitness Trackers", "VR/AR Devices", "Other Wearables"]
      },
      {
        name: "Gaming Devices",
        subSub: ["Consoles", "Handhelds", "Gaming Accessories", "Other Gaming"]
      },
      {
        name: "Home Appliances",
        subSub: ["Kitchen Appliances", "Laundry Appliances", "Cleaning Appliances", "Heating/Cooling", "Other Appliances"]
      },
      {
        name: "Networking Devices",
        subSub: ["Routers", "Modems", "Switches", "Wi-Fi Extenders", "Other Networking"]
      },
      {
        name: "Electronic Accessories",
        subSub: [
          "Chargers & Power Adapters (Phone, Laptop, etc.)",
          "Cables (USB, HDMI, etc.)",
          "Cases & Covers",
          "Screen Protectors",
          "Power Banks",
          "Stylus Pens",
          "Mice & Trackpads",
          "Memory Cards (SD, MicroSD, etc.)",
          "Other Electronic Accessories"
        ]
      },
      "Other Electronics"
    ]
  },

  // 2) Clothing & Accessories
  {
    name: "Clothing & Accessories",
    subcategories: [
      {
        name: "Men's Clothing",
        subSub: ["Tops", "Bottoms", "Suits", "Underwear/Socks", "Sleepwear", "Swimwear", "Activewear", "Other Men's Clothing"]
      },
      {
        name: "Women's Clothing",
        subSub: [
          "Tops",
          "Bottoms",
          "Dresses[(Includes formal dresses, gowns, performance dresses like tutus)]",
          "Lingerie",
          "Sleepwear",
          "Swimwear",
          "Activewear[(Includes workout clothing such as yoga pants, sports bras, running shorts, but not performance costumes)]",
          "Other Women's Clothing"
        ]
      },
      {
        name: "Children's Clothing",
        subSub: ["Boys' Clothing", "Girls' Clothing", "Other Children's Clothing"]
      },
      {
        name: "Footwear",
        subSub: ["Men's Footwear", "Women's Footwear", "Children's Footwear"]
      },
      {
        name: "Fashion Accessories",
        subSub: ["Hats/Scarves", "Gloves/Mittens", "Belts/Ties", "Jewelry/Watches", "Other Fashion Accessories"]
      },
      "Other Clothing Items"
    ]
  },

  // 3) Personal Items
  {
    name: "Personal Items",
    subcategories: [
      {
        name: "Keys",
        subSub: ["House Keys", "Vehicle Keys", "Office Keys", "Locker/Padlock Keys", "Gate Keys", "Other Keys"]
      },
      {
        name: "Wallets & Card Holders",
        subSub: ["Men's Wallets", "Women's Wallets", "Card Holders", "Coin Purses", "Passport Holders", "Other Wallets"]
      },
      {
        name: "Bags & Luggage",
        subSub: [
          "Backpacks",
          "Handbags",
          "Suitcases",
          "Laptop Bags",
          "Tote Bags",
          "Duffel/Gym Bags",
          "Other Bags"
        ]
      },
      {
        name: "Eyewear",
        subSub: ["Prescription Glasses", "Reading Glasses", "Sunglasses", "Contact Lenses", "Other Eyewear"]
      },
      {
        name: "Personal Care",
        subSub: ["Makeup", "Toiletries", "Perfume/Cologne", "Medications", "First Aid Kits", "Other Personal Care"]
      },
      "Umbrellas",
      "Other Personal Items"
    ]
  },

  // 4) Documents & Cards
  {
    name: "Documents & Cards",
    subcategories: [
      {
        name: "Identification",
        subSub: ["Passports", "ID Cards", "Driver's Licenses", "Other Identification"]
      },
      "Financial Cards (Credit, Debit, ATM, Gift, etc.)",
      "Legal Documents (Wills, Contracts, Deeds)",
      "Academic Documents (Diplomas, Certificates)",
      "Tickets & Passes (Boarding, Event, etc.)",
      "Other Documents"
    ]
  },

  // 5) Vehicles & Accessories
  {
    name: "Vehicles & Accessories",
    subcategories: [
      {
        name: "Bicycles",
        subSub: ["Road Bikes", "Mountain Bikes", "Electric Bikes", "Kids' Bikes", "Other Bicycles"]
      },
      {
        name: "Motorcycles & Scooters",
        subSub: ["Motorcycles", "Scooters", "Electric Scooters", "Other Motorized Bikes"]
      },
      {
        name: "Automobiles",
        subSub: ["Car Keys", "Car Accessories (GPS, etc.)", "License Plates", "Spare Tires", "Other Auto Items"]
      },
      "Other Vehicles"
    ]
  },

  // 6) Office & Stationery
  {
    name: "Office & Stationery",
    subcategories: [
      {
        name: "Writing Instruments",
        subSub: ["Pens", "Pencils", "Markers", "Highlighters", "Stylus Pens", "Other Writing Tools"]
      },
      {
        name: "Paper Products",
        subSub: ["Notebooks", "Notepads", "Sticky Notes", "Printer Paper", "Envelopes", "Other Paper"]
      },
      {
        name: "Desk & Organization",
        subSub: ["Desk Organizers", "Staplers", "Tape Dispensers", "Scissors", "Other Desk Items"]
      },
      {
        name: "Office Electronics",
        subSub: ["Printers", "Scanners", "Projectors", "Fax Machines", "Other Office Electronics"]
      },
      "Mailing Supplies",
      "Other Office Items"
    ]
  },

  // 7) Home & Garden
  {
    name: "Home & Garden",
    subcategories: [
      {
        name: "Furniture",
        subSub: ["Sofas & Seating", "Tables & Desks", "Beds & Dressers", "Cabinets & Shelves", "Outdoor Furniture", "Other Furniture"]
      },
      {
        name: "Home Decor",
        subSub: ["Rugs", "Curtains", "Wall Art", "Mirrors/Clocks", "Cushions/Pillows", "Other Decor"]
      },
      {
        name: "Kitchen & Dining",
        subSub: ["Cookware", "Utensils", "Dinnerware", "Storage Containers", "Kitchen Gadgets", "Other Kitchen Items"]
      },
      {
        name: "Garden & Outdoor",
        subSub: ["Gardening Tools", "Lawn Care", "Grills & Barbecues", "Plants/Seeds", "Other Garden Items"]
      },
      {
        name: "Cleaning Supplies",
        subSub: ["Cleaning Tools", "Cleaning Products", "Trash Bags", "Gloves", "Other Cleaning"]
      },
      "Other Home Items"
    ]
  },

  // 8) Sports & Outdoors
  {
    name: "Sports & Outdoors",
    subcategories: [
      {
        name: "Fitness Equipment",
        subSub: ["Yoga Mats", "Dumbbells", "Resistance Bands", "Exercise Machines", "Other Fitness"]
      },
      {
        name: "Team Sports",
        subSub: [
          "Football/Soccer Gear",
          "Basketball Gear",
          "Baseball/Softball",
          "Hockey Gear",
          "Cricket Gear",
          "Other Team Sports"
        ]
      },
      {
        name: "Racquet Sports",
        subSub: [
          "Tennis",
          "Badminton",
          "Table Tennis",
          "Squash",
          "Pickleball",
          "Other Racquet Sports"
        ]
      },
      {
        name: "Outdoor Recreation",
        subSub: ["Camping/Hiking", "Fishing", "Water Sports", "Cycling", "Winter Sports", "Other Outdoor"]
      },
      "Other Sports Items"
    ]
  },

  // 9) Toys & Games
  {
    name: "Toys & Games",
    subcategories: [
      "Action Figures & Collectibles",
      "Dolls & Dollhouses",
      "Building Toys (LEGO, K'NEX, etc.)",
      "Educational Toys",
      "Board & Card Games",
      "Puzzles",
      "Remote Control Toys",
      "Video Games & Consoles",
      "Outdoor Play (Swings, Kites, etc.)",
      "Other Toys"
    ]
  },

  // 10) Art & Crafts
  {
    name: "Art & Crafts",
    subcategories: [
      {
        name: "Art Supplies",
        subSub: ["Paints & Brushes", "Canvases & Sketchbooks", "Markers & Pencils", "Easels", "Other Art Tools"]
      },
      {
        name: "Craft Supplies",
        subSub: ["Yarn/Knitting", "Beads/Jewelry Making", "Sewing/Embroidery", "Scrapbooking", "Other Craft Supplies"]
      },
      {
        name: "Collectibles",
        subSub: [
          "Stamps/Coins[Used only for standalone stamps or coin collections]",
          "Trading Cards",
          "Figurines",
          "Autographs",
          "Memorabilia[Use for postcards, historical objects, war relics, sports memorabilia, etc.]",
          "Other Collectibles"
        ]
      },
      {
        name: "Musical Instruments",
        subSub: ["Guitars", "Keyboards/Pianos", "Drums/Percussion", "String/Wind Instruments", "Other Instruments"]
      },
      "Other Art Items"
    ]
  },

  // 11) Books & Media
  {
    name: "Books & Media",
    subcategories: [
      "Books (Fiction, Non-Fiction, etc.)",
      "Magazines & Newspapers",
      "Music (CDs, Vinyl, Digital)",
      "Movies & TV (DVD/Blu-ray)",
      "E-Books & E-Readers",
      "Other Media"
    ]
  },

  // 12) Pets & Pet Supplies
  {
    name: "Pets & Pet Supplies",
    subcategories: [
      {
        name: "Pet Animals",
        subSub: ["Dogs", "Cats", "Birds", "Fish", "Reptiles", "Small Animals", "Other Pet Animals"]
      },
      {
        name: "Pet Accessories",
        subSub: [
          "Collars & Leashes",
          "Bowls & Feeders",
          "Pet Toys",
          "Pet Clothing",
          "Beds & Bedding",
          "Carriers & Crates",
          "Other Pet Accessories"
        ]
      },
      {
        name: "Pet Food & Treats",
        subSub: ["Dog Food", "Cat Food", "Bird Seed", "Fish Food", "Reptile Food", "Other Pet Food"]
      },
      {
        name: "Grooming Supplies",
        subSub: ["Shampoos", "Brushes", "Nail Clippers", "Dental Care", "Other Grooming"]
      },
      {
        name: "Aquarium Supplies",
        subSub: ["Tanks", "Filters", "Heaters", "Decorations", "Water Treatments", "Other Aquarium Items"]
      },
      "Other Pet Items"
    ]
  },

  // 13) Health & Personal Care
  {
    name: "Health & Personal Care",
    subcategories: [
      {
        name: "Medicines & First Aid",
        subSub: [
          "Prescription Medications",
          "Over-the-Counter Medications",
          "Bandages & Dressings",
          "Pain Relievers",
          "Other First Aid Supplies"
        ]
      },
      "Medical Devices (Wheelchairs, etc.)",
      "Personal Hygiene (Soaps, Deodorants)",
      "Skincare & Cosmetics",
      "Hair Care",
      "Fragrances (Perfume, Cologne)",
      "Other Health Items"
    ]
  },

  // 14) Tools & Equipment
  {
    name: "Tools & Equipment",
    subcategories: [
      "Hand Tools (Hammers, Screwdrivers, etc.)",
      "Power Tools (Drills, Saws, etc.)",
      "Measuring Tools",
      "Garden Tools",
      "Safety Equipment (Gloves, Goggles)",
      "Tool Storage",
      "Other Tools"
    ]
  },

  // 15) Miscellaneous
  {
    name: "Miscellaneous",
    subcategories: [
      "Batteries (AA, AAA, etc.)",
      "Gift Cards",
      "Unknown/Unique Items",
      "Miscellaneous Accessories",
      "Other Misc. Items"
    ]
  },

  // 16) Other / Unclassified
  {
    name: "Other / Unclassified",
    subcategories: [
      "Item Not Listed Above"
    ]
  }
];


// Format hierarchy into a tree structure for the prompt
const formatCategoryHierarchy = (categories, indent = '') => {
  let output = '';
  
  categories.forEach(category => {
    if (typeof category === 'string') {
      output += `${indent}└─ ${category}\n`;
    } else if (typeof category === 'object' && category !== null) {
      output += `${indent}├─ ${category.name}\n`;
      if (Array.isArray(category.subcategories)) {
        const newIndent = indent + '   ';
        category.subcategories.forEach(subcat => {
          if (typeof subcat === 'string') {
            output += `${newIndent}└─ ${subcat}\n`;
          } else if (typeof subcat === 'object' && subcat !== null && subcat.name) {
            output += `${newIndent}├─ ${subcat.name}\n`;
            // Add sub-subcategories if they exist
            if (Array.isArray(subcat.subSub)) {
              const subSubIndent = newIndent + '   ';
              subcat.subSub.forEach(subsub => {
                output += `${subSubIndent}└─ ${subsub}\n`;
              });
            }
          }
        });
      }
    }
  });
  
  return output;
};
// Main categorization function
export const categorizeItem = async (attributes, title) => {
  try {
    // Debug logs
    console.log('🔍 Received attributes:', attributes);
    console.log('📝 Title:', title);
    console.log('🔎 Full attributes object:', JSON.stringify(attributes, null, 2));

    const prompt = `
You are the OFFICIAL Findoraa Lost & Found CATEGORIZATION system.

YOUR ONE AND ONLY TASK:
Categorize the MAIN ITEM described below into the EXACT category hierarchy. 
You must NEVER invent, rename, or alter existing categories.
Use the Given title(This may define somethings like Male/female-So you know which exact sub category) 
and the attributes to do so. Here they are
-------------------------------------------------------------------
ITEM TITLE:
${title} 
-------------------------------------------------------------------
ITEM ATTRIBUTES (do NOT alter these):
${JSON.stringify(attributes, null, 2)}
-------------------------------------------------------------------

PREDEFINED CATEGORIES (NO OTHERS ALLOWED):
${formatCategoryHierarchy(defaultCategories)}

-------------------------------------------------------------------
CRITICAL RULES (REPEAT THESE TO YOURSELF BEFORE ANSWERING):

1) NO NEW CATEGORIES:
   - You can ONLY choose from the categories shown above.
   - If you cannot find an exact or close match, use the designated fallback:
     category = "Miscellaneous"
     subcategory = "Other"
     subSubcategory = "Unknown Items"

2) CATEGORIZE MAIN ITEM ONLY:
   - If the description mentions contents (like a wallet with cards or a bag containing a laptop),
     ignore those contents. Categorize the wallet or the bag itself.
   - DO NOT create separate categories for each item inside.

3) CATEGORY SELECTION PROCESS (Levels 1 → 2 → 3):
   a) Main Category (Level 1):
      - Must match EXACTLY one from the top-level list.
      - If unsure, choose the closest logical main category.
   b) Subcategory (Level 2):
      - Must match EXACTLY one from that main category's subcategory list.
      - If uncertain, pick the subcategory labeled "Other" (if it exists),
        or fallback to the "Miscellaneous → Other → Unknown Items" path.
   c) Sub-Subcategory (Level 3):
      - Must match EXACTLY one from that subcategory's sub-subcategory list.
      - If none is suitable, set subSubcategory to "Other" (if available) or null.
      - Creating sub-subcategories is FORBIDDEN unless they already exist.

4) OUTPUT FORMAT (JSON ONLY, NO EXTRA TEXT):
   - Return exactly ONE JSON object with this structure:
     {
       "category": "EXACT main category name",
       "subcategory": "EXACT subcategory name",
       "subSubcategory": "EXACT sub-subcategory or null"
     }
   - NO extra text, no explanations, no disclaimers.

5) ZERO TOLERANCE FOR MISTAKES:
   - Double-check you are using only existing categories/subcategories.
   - Double-check you are not inventing new or alternative labels.
   - If truly in doubt, use the fallback:
     {
       "category": "Miscellaneous",
       "subcategory": "Other",
       "subSubcategory": "Unknown Items"
     }

ANY DEVIATION FROM THESE RULES IS PROHIBITED.

Now provide your final answer as JSON ONLY, strictly following this format.`;

    console.log('📤 FULL PROMPT BEING SENT TO CATEGORIZATION:', prompt);

    const response = await fetch('http://localhost:5001/api/categorize-item', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, attributes, title })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Categorization error:', error);
    throw error;
  }
};

// Example usage:
/*
const attributes = {
  itemType: "Phone",
  color: "Black",
  brand: "Samsung",
  model: "Galaxy S21",
  uniqueIdentifiers: "Serial: XYZ123",
  accessories: "Red case",
  condition: "Good"
};

const categoryAssignment = await categorizeItem(attributes);
console.log(categoryAssignment);

Expected output:
{
  "category": "Electronics",
  "subcategory": "Mobile Phones",
  "subSubcategory": "Android Phones",
  "newCategories": null,
  "confidence": 0.95
}
*/ 

// Initialize categories if they don't exist
export const initializeCategories = async () => {
  try {
    console.log('🚀 Starting category initialization...');
    const categoriesRef = collection(db, 'categories');
    
    // Add each default category
    for (const category of defaultCategories) {
      console.log(`📁 Adding category: ${category.name}`);
      await addDoc(categoriesRef, {
        name: category.name,
        subcategories: category.subcategories,
        level: 1
      });
    }
    
    console.log('✅ All categories added successfully');
    return true;
  } catch (error) {
    console.error('❌ Error initializing categories:', error);
    throw error;
  }
};

export const ensureCategoriesExist = async () => {
  try {
    console.log('🔍 Checking if categories exist...');
    const categoriesRef = collection(db, 'categories');
    const snapshot = await getDocs(categoriesRef);
    
    if (snapshot.empty) {
      console.log('📝 No categories found. Initializing default categories...');
      await initializeCategories();
      console.log('✅ Categories initialized successfully');
    } else {
      console.log('✅ Categories collection exists');
    }
  } catch (error) {
    console.error('❌ Error ensuring categories exist:', error);
    // Try to initialize anyway if there's an error checking
    try {
      console.log('🔄 Attempting to reinitialize categories...');
      await initializeCategories();
      console.log('✅ Categories reinitialized successfully');
    } catch (retryError) {
      console.error('❌ Failed to reinitialize categories:', retryError);
    }
  }
}; 

const verifyCategories = async () => {
  console.log('🔍 Verifying category hierarchy...');
  const categoriesRef = collection(db, 'categories');
  const snapshot = await getDocs(categoriesRef);
  
  const categories = {
    level1: 0,
    level2: 0,
    level3: 0
  };

  snapshot.forEach(doc => {
    const data = doc.data();
    categories[`level${data.level}`]++;
  });

  console.log('📊 Category counts:', categories);
  return categories;
}; 


