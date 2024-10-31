export async function extractAttributes(item) {
  console.log('🔍 Extracting attributes for item:', item);
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const prompt = `
       You are an intelligent system designed to extract key attributes from item descriptions for a lost and found application. Extract the following attributes:

    1. Item Type
    2. Color
    3. Brand/Model
    4. Size/Dimensions
    5. Material
    6. Unique Identifiers
    7. Accessories
    8. Condition
    9. Contents
    
    **Description:** ${item.description}

    **Extracted Attributes:**
    - **Item Type:** 
    - **Color:** 
    - **Brand/Model:** 
    - **Size/Dimensions:** 
    - **Material:** 
    - **Unique Identifiers:** 
    - **Accessories:** 
    - **Condition:** 
    - **Contents:** 
    `;

    const response = await fetch('http://localhost:5001/api/extract-attributes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, item })
    });

    if (!response.ok) {
      throw new Error('Failed to extract attributes');
    }

    const result = await response.json();
    const attributes = result.attributes;
    return attributes;

  } catch (error) {
    console.log('❌ Attribute extraction error:', error);
    return {
      category: 'Miscellaneous',
      subcategory: 'Other',
      color: extractColor(item.description),
      material: 'unknown',
      type: 'other',
      condition: 'unknown'
    };
  }
}

// Basic color extraction
function extractColor(description) {
  const colors = ['black', 'brown', 'blue', 'red', 'white', 'green'];
  const desc = description.toLowerCase();
  return colors.find(color => desc.includes(color)) || 'unknown';
}

// Example usage:
/*
const description = `
  Found a black Samsung Galaxy S21 smartphone with a red protective case. 
  The phone has a cracked screen and a distinctive JD engraving on the back. 
  It was in a leather pouch with a pair of earbuds. 
  The phone's IMEI number is 123456789012345.
`;

const result = await extractAttributes(description);
console.log(result);

Expected output:
{
  "itemType": "Smartphone",
  "color": "Black, Red",
  "brandModel": "Samsung Galaxy S21",
  "sizeDimensions": null,
  "material": null,
  "uniqueIdentifiers": "JD engraving, IMEI: 123456789012345",
  "accessories": "Red protective case, leather pouch, earbuds",
  "condition": "Cracked screen",
  "contents": null,
  "additionalDetails": null
}
*/

// Function to validate extracted attributes
export const validateAttributes = (attributes) => {
  const validationRules = {
    itemType: {
      required: true,
      message: "Item type is required"
    },
    color: {
      required: false,
      validate: (value) => !value || typeof value === 'string',
      message: "Color must be a string"
    },
    brandModel: {
      required: false,
      validate: (value) => !value || typeof value === 'string',
      message: "Brand/Model must be a string"
    }
  };

  const errors = [];

  Object.entries(validationRules).forEach(([field, rules]) => {
    const value = attributes[field];

    if (rules.required && !value) {
      errors.push(rules.message);
    }

    if (rules.validate && value && !rules.validate(value)) {
      errors.push(rules.message);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Helper function to combine extracted attributes with form data
export const combineItemData = (extractedAttributes, formData) => {
  return {
    ...extractedAttributes,
    location: formData.location,
    timeDetails: formData.timeDetails,
    type: formData.type, // lost or found
    userId: formData.userId,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}; 