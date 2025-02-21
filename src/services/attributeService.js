export async function extractAttributes(item) {
  console.log('🔍 Extracting attributes for item:', item);
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const prompt = `
You are a PRECISE attribute extraction system for lost and found items. Extract ONLY the following attributes with these STRICT definitions:

1. itemtype: The main item category (e.g., phone, wallet, bag)

2. color: Primary and secondary colors of the item's exterior
   - Format: "primary color" or "primary color with secondary color"
   - Example: "black" or "black with gold trim"

3. brand/model: Manufacturer, brand name, or specific model
   - If unknown, use "unknown"
   - Example: "iPhone 13" or "Nike"

4. size/dimensions: Physical size or measurements
   - If unknown, use "unknown"
   - Example: "13-inch" or "medium-sized"

5. material: Main material(s) of the item
   - Example: "leather", "plastic", "metal and glass"

6. unique identifiers: ARRAY of distinguishing features or damage
   - Include: scratches, cracks, stickers, engravings, serial numbers
   - Include: damage descriptions, distinctive marks
   - Example: ["cracked screen", "Pokemon sticker on back", "engraved initials 'JD'"]

7. accessories: ARRAY of additional items attached/included
   - Include: cases, covers, attached items
   - Example: ["blue protective case", "keychain attached", "shoulder strap"]

8. contents: ARRAY of items contained within
   - Include: items inside bags/wallets/cases
   - Include: digital content for devices (wallpaper description, lock screen)
   - Example: ["3 credit cards", "house keys", "mountain landscape wallpaper"]

9. condition: Physical state when found/lost
   - Include: location context if relevant
   - Example: "found under bench", "slightly worn", "new condition"

STRICT RULES:
- ALWAYS return ALL attributes, use "unknown" if not mentioned
- Arrays should be empty [] if no items present
- DO NOT create new attributes
- DO NOT include location/time information in condition
- DO NOT include contents in unique identifiers
- Separate multiple items in arrays with commas

Return in EXACT JSON format:
{
  "itemtype": "string",
  "color": "string",
  "brand/model": "string",
  "size/dimensions": "string",
  "material": "string",
  "unique identifiers": ["string", "string"],
  "accessories": ["string", "string"],
  "contents": ["string", "string"],
  "condition": "string"
}

Current item description:
${item.description}

Current item title:
${item.title}`;

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