// Tạo file mới: services/geocodingService.js

const geocodeCache = new Map();
const HERE_API_KEY = '9jpg6fU4XqcTeY7pVM33nLogprSGlqhAHpPT5tcGmQE'; 

export const getLocationNameFromCoords = async (coordinates) => {
  if (!coordinates) return 'Chưa cập nhật';
  
  const cacheKey = `${coordinates[0]},${coordinates[1]}`;
  
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey);
  }

  try {
    const response = await fetch(
      `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${coordinates[1]},${coordinates[0]}&lang=vi&apiKey=${HERE_API_KEY}`
    );
    const data = await response.json();
    
    if (data.items && data.items[0]) {
      const address = data.items[0].address;
      const locationName = [
        address.district,
        address.city,
        address.countryName
      ].filter(Boolean).join(', ');
      
      geocodeCache.set(cacheKey, locationName);
      return locationName;
    }
    return 'Không tìm thấy địa chỉ';
  } catch (error) {
    console.error('Lỗi geocoding:', error);
    return `${coordinates[1].toFixed(4)}, ${coordinates[0].toFixed(4)}`;
  }
};

export const processLocationBatches = async (posts) => {
  const batchSize = 5;
  const results = [];
  
  for (let i = 0; i < posts.length; i += batchSize) {
    const batch = posts.slice(i, i + batchSize);
    const processedBatch = await Promise.all(
      batch.map(async (post) => {
        if (post.destinationName) {
          return post;
        }
        
        if (post.destination?.coordinates) {
          const address = await getLocationNameFromCoords(post.destination.coordinates);
          return {
            ...post,
            destinationName: address
          };
        }
        
        return {
          ...post,
          destinationName: 'Chưa cập nhật'
        };
      })
    );
    results.push(...processedBatch);
    
    if (i + batchSize < posts.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
};