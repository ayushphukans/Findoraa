import openai from '../config/openai';
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
      You are an intelligent categorization system for a lost and found application. Below is the current hierarchy of categories and subcategories:

      
       **Existing Categories and Subcategories:**
      ${formattedHierarchy}
      
      **Task:**
      Based on the extracted attributes of an item, assign it to the appropriate category and subcategory within the existing hierarchy. If the item does not fit into any existing category or subcategory, create a new one, ensuring that the hierarchical structure is maintained.
      ${JSON.stringify(attributes, null, 2)}

      Return ONLY a JSON object with:
      {
        "category": "main category name",
        "subcategory": "subcategory name",
        "subSubcategory": "sub-subcategory name (if applicable)",
        "newCategories": {
          "category": "new category to create (if needed)",
          "subcategory": "new subcategory to create (if needed)",
          "subSubcategory": "new sub-subcategory to create (if needed)"
        }
    }
    `;

    const completion = await openai.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: "You are a precise categorization system. Always return valid JSON."
        },
        { role: "user", content: prompt }
      ],
      model: "gpt-4",
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const response = JSON.parse(completion.choices[0].message.content);

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
    // Check if categories already exist
    const categoriesRef = collection(db, 'categories');
    const snapshot = await getDocs(categoriesRef);
    
    if (snapshot.empty) {
      console.log('📝 No categories found. Adding default categories...');
      await addDefaultCategories();
    } else {
      console.log('✅ Categories already exist');
    }
  } catch (error) {
    console.error('❌ Error initializing categories:', error);
  }
};

const addDefaultCategories = async () => {
  try {
    for (const category of defaultCategories) {
      // Add main category
      const mainCategoryRef = await addDoc(collection(db, 'categories'), {
        name: category.name,
        parentId: null,
        level: 1,
        createdAt: new Date()
      });

      // Add subcategories
      for (const subcategory of category.subcategories) {
        const subCategoryRef = await addDoc(collection(db, 'categories'), {
          name: subcategory.name,
          parentId: mainCategoryRef.id,
          level: 2,
          createdAt: new Date()
        });

        // Add sub-subcategories if they exist
        if (Array.isArray(subcategory.subcategories)) {
          for (const subSubcategory of subcategory.subcategories) {
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
    console.log('✅ Default categories added successfully');
  } catch (error) {
    console.error('❌ Error adding default categories:', error);
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