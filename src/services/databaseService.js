import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc,
  doc, 
  serverTimestamp,
  query,
  where,
  getDocs
} from 'firebase/firestore';

// Store a new item with its categories
export const storeNewItem = async (itemData, categoryAssignment) => {
  try {
    // Prepare item data with categories
    const itemWithCategories = {
      ...itemData,
      mainCategory: categoryAssignment.category,
      subCategory: categoryAssignment.subcategory,
      subSubCategory: categoryAssignment.subSubcategory || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'active'
    };

    // Add the item to the items collection
    const itemRef = await addDoc(collection(db, 'items'), itemWithCategories);

    // Update category statistics (optional)
    await updateCategoryStats(categoryAssignment.category);

    return {
      success: true,
      itemId: itemRef.id,
      data: itemWithCategories
    };

  } catch (error) {
    console.error("Error storing item:", error);
    throw new Error(`Failed to store item: ${error.message}`);
  }
};

// Update category statistics
const updateCategoryStats = async (categoryName) => {
  try {
    // Get reference to the category
    const categoryQuery = query(
      collection(db, 'categories'),
      where('name', '==', categoryName)
    );
    
    const categorySnapshot = await getDocs(categoryQuery);
    
    if (!categorySnapshot.empty) {
      const categoryDoc = categorySnapshot.docs[0];
      const currentStats = categoryDoc.data().stats || { itemCount: 0 };
      
      await updateDoc(doc(db, 'categories', categoryDoc.id), {
        stats: {
          ...currentStats,
          itemCount: currentStats.itemCount + 1,
          lastUpdated: serverTimestamp()
        }
      });
    }
  } catch (error) {
    console.error("Error updating category stats:", error);
    // Don't throw error as this is not critical
  }
};

// Initialize database with default categories
export const initializeDatabase = async () => {
  try {
    // Your provided comprehensive category structure
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

    // Function to add category and its subcategories
    const addCategoryWithSubcategories = async (category, parentId = null, level = 0) => {
      const categoryData = {
        name: category.name || category, // Handle both object and string cases
        parentId,
        level, // Track hierarchy level
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        stats: {
          itemCount: 0,
          lastUpdated: serverTimestamp()
        }
      };

      const categoryRef = await addDoc(collection(db, 'categories'), categoryData);

      // If category has subcategories and is an object (not a string)
      if (category.subcategories && typeof category !== 'string') {
        for (const subcat of category.subcategories) {
          await addCategoryWithSubcategories(subcat, categoryRef.id, level + 1);
        }
      }

      return categoryRef;
    };

    // Add all default categories
    for (const category of defaultCategories) {
      await addCategoryWithSubcategories(category);
    }

    return { 
      success: true, 
      message: "Database initialized with comprehensive category structure" 
    };

  } catch (error) {
    console.error("Error initializing database:", error);
    throw new Error(`Failed to initialize database: ${error.message}`);
  }
};

// Helper function to get category path
export const getCategoryPath = async (categoryId) => {
  try {
    const path = [];
    let currentId = categoryId;

    while (currentId) {
      const categoryDoc = await db.collection('categories').doc(currentId).get();
      const categoryData = categoryDoc.data();
      
      path.unshift(categoryData.name);
      currentId = categoryData.parentId;
    }

    return path;
  } catch (error) {
    console.error("Error getting category path:", error);
    throw error;
  }
}; 