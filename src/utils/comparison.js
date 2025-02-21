export const compareTitles = (title1, title2) => {
  const words1 = title1.toLowerCase().split(/\s+/);
  const words2 = title2.toLowerCase().split(/\s+/);
  
  let matches = 0;
  for (const word1 of words1) {
    if (words2.some(word2 => word2.includes(word1) || word1.includes(word2))) {
      matches++;
    }
  }
  
  return matches / Math.max(words1.length, words2.length);
};

export const compareDescriptions = (desc1, desc2) => {
  const words1 = desc1.toLowerCase().split(/\s+/);
  const words2 = desc2.toLowerCase().split(/\s+/);
  
  let matches = 0;
  for (const word1 of words1) {
    if (words2.some(word2 => word2.includes(word1) || word1.includes(word2))) {
      matches++;
    }
  }
  
  return matches / Math.max(words1.length, words2.length);
};
