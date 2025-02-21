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
import { defaultCategories } from './categoryService';

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
    // Use the imported defaultCategories instead of redefining them here
    
    // Function to add category and its subcategories
    const addCategoryWithSubcategories = async (category, parentId = null, level = 0) => {
      const categoryData = {
        name: category.name || category, // Handle both object and string cases
        parentId,
        level,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // Add subSub if it exists
        subSub: category.subSub || null
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

export const addItem = async (itemData) => {
  try {
    // Restructure the data with consistent field ordering
    const orderedItemData = {
      // Category hierarchy (always first)
      category: itemData.category || null,
      subcategory: itemData.subcategory || null,
      subSubcategory: itemData.subSubcategory || null,

      // Core item details
      title: itemData.title,
      description: itemData.description,
      itemtype: itemData.itemtype,
      lostOrFound: itemData.lostOrFound,

      // Location and time
      location: itemData.location,
      date: itemData.date,
      time: itemData.time,

      // Item characteristics
      color: itemData.color,
      'brand/model': itemData['brand/model'],
      material: itemData.material,
      condition: itemData.condition,
      'size/dimensions': itemData['size/dimensions'],

      // Arrays of additional details
      'unique identifiers': itemData['unique identifiers'] || [],
      accessories: itemData.accessories || [],
      contents: itemData.contents || [],

      // Metadata (always last)
      userId: itemData.userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'active'
    };

    const docRef = await addDoc(collection(db, 'items'), orderedItemData);
    console.log('✅ Document written with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error adding document:', error);
    throw error;
  }
}; 