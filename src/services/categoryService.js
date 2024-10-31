import { makeOpenAIRequest } from '../config/openai';
import { db } from '../config/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';

// Define default categories directly in the service
const defaultCategories = [
  {
    name: "Electronics",
    subcategories: [
      {
        name: "Mobile Phones",
        subcategories: ["Android Phones", "iPhones", "Feature Phones", "Smartphones"]
      },
      {
        name: "Laptops",
        subcategories: ["Windows Laptops", "MacBooks", "Chromebooks", "Gaming Laptops"]
      },
      {
        name: "Tablets",
        subcategories: ["Android Tablets", "iPads", "Windows Tablets"]
      },
      {
        name: "Cameras",
        subcategories: ["Digital Cameras", "DSLRs", "Mirrorless Cameras", "Action Cameras"]
      },
      {
        name: "Accessories",
        subcategories: ["Chargers", "Headphones", "Cases", "Screen Protectors", "Cables", "Batteries"]
      },
      {
        name: "Wearable Technology",
        subcategories: ["Smartwatches", "Fitness Trackers", "VR Headsets"]
      },
      {
        name: "Audio Equipment",
        subcategories: ["Speakers", "Earbuds", "Microphones", "Sound Systems"]
      },
      {
        name: "Gaming Consoles",
        subcategories: ["PlayStation", "Xbox", "Nintendo Switch", "PC Gaming"]
      },
      {
        name: "Home Appliances",
        subcategories: ["Refrigerators", "Microwaves", "Blenders", "Toasters", "Coffee Makers"]
      },
      {
        name: "Computers",
        subcategories: ["Desktops", "Monitors", "Printers", "Keyboards", "Mice"]
      },
      {
        name: "Networking Devices",
        subcategories: ["Routers", "Modems", "Switches", "Network Cables"]
      }
    ]
  },
  {
    name: "Personal Items",
    subcategories: [
      {
        name: "Wallets",
        subcategories: ["Leather Wallets", "Card Holders", "Bifold Wallets", "Trifold Wallets"]
      },
      {
        name: "Keys",
        subcategories: ["House Keys", "Car Keys", "Office Keys", "Keychains"]
      },
      {
        name: "Bags",
        subcategories: ["Backpacks", "Handbags", "Luggage", "Duffel Bags", "Messenger Bags"]
      },
      {
        name: "Jewelry",
        subcategories: ["Rings", "Necklaces", "Bracelets", "Earrings", "Watches"]
      },
      {
        name: "Clothing",
        subcategories: [
          "Shirts",
          "Pants",
          "Dresses",
          "Jackets",
          "Shoes",
          "Hats",
          "Sweaters",
          "Coats",
          "Shorts",
          "Socks",
          "Underwear"
        ]
      },
      {
        name: "Accessories",
        subcategories: ["Belts", "Scarves", "Gloves", "Sunglasses", "Hats"]
      },
      {
        name: "Health and Personal Care",
        subcategories: ["Medicines", "Toiletries", "Medical Devices", "Personal Hygiene Items"]
      },
      {
        name: "Toys and Games",
        subcategories: ["Action Figures", "Board Games", "Puzzles", "Dolls", "Video Games"]
      },
      {
        name: "Musical Instruments",
        subcategories: ["Guitars", "Keyboards", "Drums", "Wind Instruments", "String Instruments"]
      },
      {
        name: "Sporting Goods",
        subcategories: ["Bicycles", "Sports Balls", "Protective Gear", "Fitness Equipment"]
      },
      {
        name: "Tools",
        subcategories: ["Hand Tools", "Power Tools", "Garden Tools", "Measuring Tools"]
      },
      {
        name: "Baby Items",
        subcategories: ["Diapers", "Baby Clothes", "Toys", "Strollers", "Bottles"]
      },
      {
        name: "Pet Accessories",
        subcategories: ["Collars", "Leashes", "Toys", "Bedding", "Feeding Bowls"]
      },
      {
        name: "Art and Crafts",
        subcategories: ["Paintings", "Sculptures", "Craft Supplies", "Drawing Materials"]
      },
      {
        name: "Books and Media",
        subcategories: ["Books", "DVDs", "CDs", "Magazines", "eBooks"]
      },
      {
        name: "Miscellaneous",
        subcategories: ["Umbrellas", "Perfumes", "Sunglasses", "Glasses", "Notebooks"]
      }
    ]
  },
  {
    name: "Documents",
    subcategories: [
      {
        name: "Identification",
        subcategories: ["ID Cards", "Passports", "Licenses", "Driver's Licenses"]
      },
      {
        name: "Academic",
        subcategories: ["Books", "Notes", "Certificates", "Diplomas", "Transcripts"]
      },
      {
        name: "Financial",
        subcategories: ["Bank Statements", "Credit Cards", "Checkbooks", "Receipts"]
      },
      {
        name: "Legal",
        subcategories: ["Contracts", "Wills", "Deeds", "Court Documents"]
      }
    ]
  },
  {
    name: "Vehicles",
    subcategories: [
      {
        name: "Bicycles",
        subcategories: ["Mountain Bikes", "Road Bikes", "Electric Bikes", "Kids' Bikes"]
      },
      {
        name: "Motorcycles",
        subcategories: ["Sport Bikes", "Cruisers", "Scooters", "Electric Motorcycles"]
      },
      {
        name: "Scooters",
        subcategories: ["Electric Scooters", "Kick Scooters", "Motorized Scooters"]
      },
      {
        name: "Car Accessories",
        subcategories: ["Car Chargers", "Seat Covers", "Floor Mats", "GPS Devices"]
      }
    ]
  },
  {
    name: "Office Supplies",
    subcategories: [
      {
        name: "Stationery",
        subcategories: ["Pens", "Notebooks", "Markers", "Staplers", "Paper Clips"]
      },
      {
        name: "Office Equipment",
        subcategories: ["Printers", "Scanners", "Desks", "Chairs", "Lamps"]
      },
      {
        name: "Electronics",
        subcategories: ["Calculators", "External Hard Drives", "USB Drives", "Headsets"]
      }
    ]
  },
  {
    name: "Home Appliances",
    subcategories: [
      {
        name: "Kitchen Appliances",
        subcategories: ["Refrigerators", "Microwaves", "Blenders", "Toasters", "Coffee Makers"]
      },
      {
        name: "Laundry Appliances",
        subcategories: ["Washing Machines", "Dryers", "Ironing Boards", "Irons"]
      },
      {
        name: "Cleaning Appliances",
        subcategories: ["Vacuum Cleaners", "Steam Mops", "Air Purifiers", "Dishwashers"]
      },
      {
        name: "Heating and Cooling",
        subcategories: ["Fans", "Heaters", "Air Conditioners", "Humidifiers"]
      }
    ]
  },
  {
    name: "Gaming",
    subcategories: [
      {
        name: "Consoles",
        subcategories: ["PlayStation", "Xbox", "Nintendo Switch", "PC Gaming"]
      },
      {
        name: "Accessories",
        subcategories: ["Controllers", "Headsets", "Charging Stations", "Game Carts"]
      },
      {
        name: "Games",
        subcategories: ["Video Games", "Board Games", "Card Games", "Puzzle Games"]
      }
    ]
  },
  {
    name: "Art Supplies",
    subcategories: [
      {
        name: "Drawing",
        subcategories: ["Pencils", "Charcoal", "Erasers", "Sharpeners"]
      },
      {
        name: "Painting",
        subcategories: ["Brushes", "Paints", "Canvases", "Palettes"]
      },
      {
        name: "Crafting",
        subcategories: ["Glue Guns", "Scissors", "Ribbons", "Stickers"]
      },
      {
        name: "Sculpting",
        subcategories: ["Clay", "Tools", "Molds", "Wire"]
      }
    ]
  },
  {
    name: "Personal Electronics",
    subcategories: [
      {
        name: "Wearables",
        subcategories: ["Smartwatches", "Fitness Trackers", "VR Headsets"]
      },
      {
        name: "Portable Devices",
        subcategories: ["E-Readers", "Portable Speakers", "Power Banks"]
      },
      {
        name: "Photography",
        subcategories: ["Digital Cameras", "GoPros", "Camera Lenses", "Tripods"]
      }
    ]
  },
  {
    name: "Miscellaneous",
    subcategories: [
      {
        name: "Umbrellas",
        subcategories: ["Standard Umbrellas", "Compact Umbrellas", "Golf Umbrellas"]
      },
      {
        name: "Sunglasses",
        subcategories: ["Polarized Sunglasses", "Fashion Sunglasses", "Sport Sunglasses"]
      },
      {
        name: "Glasses",
        subcategories: ["Eyeglasses", "Reading Glasses", "Contact Lenses"]
      },
      {
        name: "Notebooks",
        subcategories: ["Spiral Notebooks", "Hardcover Notebooks", "Digital Notebooks"]
      },
      {
        name: "Batteries",
        subcategories: ["AA Batteries", "AAA Batteries", "Rechargeable Batteries", "Car Batteries"]
      }
    ]
  }
];

// Get existing category hierarchy from Firebase
const getExistingHierarchy = async () => {
  try {
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    const categories = {};
    
    categoriesSnapshot.forEach(doc => {
      categories[doc.id] = {
        id: doc.id,
        name: doc.data().name,
        parentId: doc.data().parentId || null,
        ...doc.data()
      };
    });

    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

// Format hierarchy into a tree structure for the prompt
const formatHierarchy = (categories) => {
  const buildTree = (parentId = null, depth = 0) => {
    const indent = "  ".repeat(depth);
    let result = "";

    Object.values(categories)
      .filter(cat => cat.parentId === parentId)
      .forEach(category => {
        result += `${indent}- **${category.name}**\n`;
        result += buildTree(category.id, depth + 1);
      });

    return result;
  };

  return buildTree();
};

// Add new category to Firebase
const addNewCategory = async (categoryName, parentId = null) => {
  try {
    const newCategory = {
      name: categoryName,
      parentId,
      createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'categories'), newCategory);
    return docRef.id;
  } catch (error) {
    console.error("Error adding category:", error);
    throw error;
  }
};

// Main categorization function
export const categorizeItem = async (attributes) => {
  try {
    // Get existing category hierarchy
    const existingCategories = await getExistingHierarchy();
    const formattedHierarchy = formatHierarchy(existingCategories);

    const prompt = `
      You are a precise categorization system for a lost and found application. Your task is to categorize items according to our predefined hierarchy or create new categories when absolutely necessary.

      **Current Item Attributes:**
      ${JSON.stringify(attributes, null, 2)}

      **Existing Category Hierarchy:**
      ${formattedHierarchy}

      **Instructions:**
      1. FIRST, carefully analyze if the item fits into ANY existing category path
      2. If it fits an existing path, use EXACT category names from our hierarchy
      3. ONLY create new categories if the item CANNOT be reasonably placed in existing ones

      **Examples:**
      - For a "blue leather wallet":
        ✓ Category: "Personal Items"
        ✓ Subcategory: "Wallets"
        ✓ Sub-subcategory: "Leather Wallets"

      - For a "quantum teleporter" (doesn't exist in hierarchy):
        ✓ Create new: {
          "category": "Scientific Equipment",
          "subcategory": "Experimental Devices",
          "subSubcategory": "Quantum Devices"
        }

      **Rules for New Categories:**
      1. Must be NECESSARY - don't create if similar category exists
      2. Must be GENERIC enough to accommodate similar items
      3. Must follow the same 3-level hierarchy pattern
      4. Must use clear, standard terminology

      Return ONLY a JSON object with:
      {
        "category": "exact category name or new category",
        "subcategory": "exact subcategory name or new subcategory",
        "subSubcategory": "exact sub-subcategory name or new sub-subcategory",
        "newCategories": {
          "category": "only if creating new category",
          "subcategory": "only if creating new subcategory",
          "subSubcategory": "only if creating new sub-subcategory"
        }
      }
    `;

    // Replace OpenAI direct call with backend call
    const response = await makeOpenAIRequest('categorize-item', {
      prompt,
      attributes,
      model: "gpt-4",
      temperature: 0.3
    });

    // Handle new category creation if needed
    if (response.newCategories) {
      if (response.newCategories.category) {
        const categoryId = await addNewCategory(response.newCategories.category);
        
        if (response.newCategories.subcategory) {
          const subcategoryId = await addNewCategory(
            response.newCategories.subcategory, 
            categoryId
          );

          if (response.newCategories.subSubcategory) {
            await addNewCategory(
              response.newCategories.subSubcategory, 
              subcategoryId
            );
          }
        }
      }
    }

    return response;

  } catch (error) {
    console.error("Categorization error:", error);
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
  console.log('🔧 Checking and initializing categories...');
  
  try {
    const categoriesRef = collection(db, 'categories');
    const snapshot = await getDocs(categoriesRef);
    
    if (snapshot.empty) {
      console.log('📝 No categories found. Adding default categories...');
      await addDefaultCategories();
      const verification = await verifyCategories();
      
      // Log expected vs actual counts
      const expectedCounts = {
        level1: defaultCategories.length,
        level2: defaultCategories.reduce((acc, cat) => acc + cat.subcategories.length, 0),
        level3: defaultCategories.reduce((acc, cat) => 
          acc + cat.subcategories.reduce((subAcc, subCat) => 
            subAcc + (Array.isArray(subCat.subcategories) ? subCat.subcategories.length : 0), 0), 0)
      };
      
      console.log('Expected counts:', expectedCounts);
      console.log('Actual counts:', verification);
    } else {
      console.log('✅ Categories exist. Verifying...');
      await verifyCategories();
    }
  } catch (error) {
    console.error('❌ Error initializing categories:', error);
  }
};

const addDefaultCategories = async () => {
  try {
    console.log('🌳 Starting to add default categories...');
    for (const category of defaultCategories) {
      console.log(`📁 Adding main category: ${category.name}`);
      const mainCategoryRef = await addDoc(collection(db, 'categories'), {
        name: category.name,
        parentId: null,
        level: 1,
        createdAt: new Date()
      });

      for (const subcategory of category.subcategories) {
        console.log(`  └─ Adding subcategory: ${subcategory.name}`);
        const subCategoryRef = await addDoc(collection(db, 'categories'), {
          name: subcategory.name,
          parentId: mainCategoryRef.id,
          level: 2,
          createdAt: new Date()
        });

        if (Array.isArray(subcategory.subcategories)) {
          for (const subSubcategory of subcategory.subcategories) {
            console.log(`    └─ Adding sub-subcategory: ${subSubcategory}`);
            await addDoc(collection(db, 'categories'), {
              name: subSubcategory,
              parentId: subCategoryRef.id,
              level: 3,
              createdAt: new Date()
            });
          }
        }
      }
    }
    console.log('✅ All categories added successfully');
  } catch (error) {
    console.error('❌ Error adding categories:', error);
    throw error;
  }
};

// Call this function when your app initializes
export const ensureCategoriesExist = async () => {
  try {
    const categoriesRef = collection(db, 'categories');
    const snapshot = await getDocs(categoriesRef);
    
    if (snapshot.empty) {
      console.log('🔄 Initializing default categories...');
      await initializeCategories();
    }
  } catch (error) {
    console.error('❌ Error checking categories:', error);
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