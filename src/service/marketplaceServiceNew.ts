import { apiRequest } from "./api";

// Get all marketplace listings
export const getMarketplaceListings = async (filters?: {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
}): Promise<any> => {
  try {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    
    const response = await apiRequest(`/marketplace?${params.toString()}`);
    return response;
  } catch (error) {
    console.error('Error getting marketplace listings:', error);
    throw error;
  }
};

// Get listing by ID
export const getListingById = async (listingId: string): Promise<any> => {
  try {
    const response = await apiRequest(`/marketplace/${listingId}`);
    return response.listing;
  } catch (error) {
    console.error('Error getting listing:', error);
    throw error;
  }
};

// Create new listing
export const createListing = async (listingData: any): Promise<any> => {
  try {
    const response = await apiRequest('/marketplace', {
      method: 'POST',
      body: JSON.stringify(listingData)
    });
    return response.listing;
  } catch (error) {
    console.error('Error creating listing:', error);
    throw error;
  }
};

// Update listing
export const updateListing = async (listingId: string, updates: any): Promise<any> => {
  try {
    const response = await apiRequest(`/marketplace/${listingId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    return response.listing;
  } catch (error) {
    console.error('Error updating listing:', error);
    throw error;
  }
};

// Delete listing
export const deleteListing = async (listingId: string): Promise<void> => {
  try {
    await apiRequest(`/marketplace/${listingId}`, {
      method: 'DELETE'
    });
  } catch (error) {
    console.error('Error deleting listing:', error);
    throw error;
  }
};

// Like/Unlike listing
export const toggleListingLike = async (listingId: string): Promise<any> => {
  try {
    const response = await apiRequest(`/marketplace/${listingId}/like`, {
      method: 'POST'
    });
    return response.listing;
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
};

// Get user's listings
export const getMyListings = async (): Promise<any[]> => {
  try {
    const response = await apiRequest('/marketplace/user/my-listings');
    return response.listings;
  } catch (error) {
    console.error('Error getting my listings:', error);
    return [];
  }
};

// Admin functions
export const getAllMarketplaceProjectsForAdmin = async (): Promise<any[]> => {
  try {
    const response = await apiRequest('/admin/marketplace/projects');
    return response.projects || [];
  } catch (error) {
    console.error('Error getting marketplace projects for admin:', error);
    return [];
  }
};

export const approveMarketplaceProject = async (projectId: string): Promise<void> => {
  try {
    await apiRequest(`/admin/marketplace/projects/${projectId}/approve`, {
      method: 'POST'
    });
  } catch (error) {
    console.error('Error approving marketplace project:', error);
    throw error;
  }
};

export const rejectMarketplaceProject = async (projectId: string, reason: string): Promise<void> => {
  try {
    await apiRequest(`/admin/marketplace/projects/${projectId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  } catch (error) {
    console.error('Error rejecting marketplace project:', error);
    throw error;
  }
};

// Marketplace project functions (aliases for compatibility)
export const getProjectById = getListingById;
export const updateProject = updateListing;
export const deleteProject = deleteListing;
export const getAllProjects = async () => {
  const response = await getMarketplaceListings();
  return response.listings || [];
};

// Seller functions
export const getSellerProjects = async (sellerId: string): Promise<any[]> => {
  try {
    const response = await apiRequest(`/marketplace/seller/${sellerId}/projects`);
    return response.listings || response.projects || [];
  } catch (error) {
    console.error('Error getting seller projects:', error);
    return [];
  }
};

export const getSellerSales = async (sellerId: string): Promise<any[]> => {
  try {
    const response = await apiRequest(`/marketplace/seller/${sellerId}/sales`);
    // Return the sales array, not the whole response object
    return response.sales || [];
  } catch (error) {
    console.error('Error getting seller sales:', error);
    return [];
  }
};

// Purchase functions
export const getUserPurchases = async (userId: string): Promise<any[]> => {
  try {
    const response = await apiRequest(`/marketplace/user/${userId}/purchases`);
    return response.purchases || [];
  } catch (error) {
    console.error('Error getting user purchases:', error);
    return [];
  }
};

export const checkUserPurchased = async (projectId: string, userId: string): Promise<boolean> => {
  try {
    const response = await apiRequest(`/marketplace/projects/${projectId}/purchased?userId=${userId}`);
    return response.purchased || false;
  } catch (error) {
    console.error('Error checking purchase status:', error);
    return false;
  }
};

export const createPurchase = async (projectId: string, purchaseData: any): Promise<any> => {
  try {
    const response = await apiRequest(`/marketplace/projects/${projectId}/purchase`, {
      method: 'POST',
      body: JSON.stringify(purchaseData)
    });
    return response.purchase;
  } catch (error) {
    console.error('Error creating purchase:', error);
    throw error;
  }
};

// Review functions
export const createReview = async (projectId: string, reviewData: any): Promise<any> => {
  try {
    const response = await apiRequest(`/marketplace/projects/${projectId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewData)
    });
    return response.review;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

export const getProjectReviews = async (projectId: string): Promise<any[]> => {
  try {
    const response = await apiRequest(`/marketplace/projects/${projectId}/reviews`);
    return response.reviews || [];
  } catch (error) {
    console.error('Error getting reviews:', error);
    return [];
  }
};

export const incrementProjectViews = async (projectId: string): Promise<void> => {
  try {
    await apiRequest(`/marketplace/projects/${projectId}/views`, {
      method: 'POST'
    });
  } catch (error) {
    console.error('Error incrementing views:', error);
    // Don't throw, views increment is not critical
  }
};
