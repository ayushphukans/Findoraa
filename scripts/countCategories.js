import { defaultCategories } from '../src/services/categoryService.js';

const countDefaultCategoriesExact = () => {
  let mainCount = defaultCategories.length;
  let subCount = 0;
  let subSubCount = 0;

  defaultCategories.forEach(main => {
    console.log(`\n📁 ${main.name}:`);
    
    // Count subcategories (including string entries)
    const subs = main.subcategories;
    subCount += subs.length;
    
    // For each subcategory that's an object (not a string)
    subs.forEach(sub => {
      if (typeof sub === 'object' && sub.subSub) {  // Check for subSub array
        console.log(`  └─ ${sub.name}: ${sub.subSub.length} sub-subcategories`);
        subSubCount += sub.subSub.length;
      } else if (typeof sub === 'string') {
        console.log(`  └─ ${sub}`);
      }
    });
  });

  console.log('\n📊 Total Counts:');
  console.log(`Main Categories: ${mainCount}`);
  console.log(`Subcategories: ${subCount}`);
  console.log(`Sub-subcategories: ${subSubCount}`);
  console.log(`Total Categories: ${mainCount + subCount + subSubCount}`);
};

countDefaultCategoriesExact(); 