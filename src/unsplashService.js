import axios from 'axios';

// Initialize axios with Unsplash API configuration
const unsplashAPI = axios.create({
  baseURL: 'https://api.unsplash.com',
  headers: {
    Authorization: `Client-ID ${process.env.REACT_APP_UNSPLASH_ACCESS_KEY}`,
  },
});

export const fetchBMWImages = async (searchQuery) => {
  try {
    const response = await unsplashAPI.get('/search/photos', {
      params: {
        query: searchQuery,
        per_page: 1
      }
    });
    return response.data.results;
  } catch (error) {
    console.error('Error fetching images:', error);
    return [];
  }
};
  
