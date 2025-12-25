import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    increment,
    limit,
    onSnapshot,
    orderBy,
    query,
    Timestamp,
    updateDoc,
    where,
} from 'firebase/firestore';
import type {
    CreateProjectData,
    FilterOptions,
    MarketplaceProject,
    MarketplacePurchase,
    MarketplaceReview,
    SortOption,
} from '../types/marketplace';
import { db } from './Firebase';

const PROJECTS_COLLECTION = 'marketplace_projects';
const PURCHASES_COLLECTION = 'marketplace_purchases';
const REVIEWS_COLLECTION = 'marketplace_reviews';

// ============= PROJECT CRUD OPERATIONS =============

export const createProject = async (
  projectData: CreateProjectData,
  sellerId: string,
  sellerName: string,
  sellerAvatar: string
): Promise<string> => {
  try {
    console.log('Creating project with data:', { ...projectData, sellerId, sellerName });
    
    const projectRef = await addDoc(collection(db, PROJECTS_COLLECTION), {
      ...projectData,
      sellerId,
      sellerName,
      sellerAvatar,
      status: 'pending_verification', // Requires admin approval
      views: 0,
      purchases: 0,
      rating: 0,
      reviewCount: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    
    console.log('Project created successfully with ID:', projectRef.id);
    return projectRef.id;
  } catch (error: any) {
    console.error('Error creating project:', error);
    console.error('Error code:', error?.code);
    console.error('Error message:', error?.message);
    throw error;
  }
};

export const updateProject = async (
  projectId: string,
  updates: Partial<CreateProjectData>
): Promise<void> => {
  try {
    const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
    await updateDoc(projectRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};

export const deleteProject = async (projectId: string): Promise<void> => {
  try {
    const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
    await deleteDoc(projectRef);
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};

export const getProjectById = async (projectId: string): Promise<MarketplaceProject | null> => {
  try {
    const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
    const projectSnap = await getDoc(projectRef);
    
    if (projectSnap.exists()) {
      const data = projectSnap.data();
      return {
        id: projectSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as MarketplaceProject;
    }
    return null;
  } catch (error) {
    console.error('Error getting project:', error);
    throw error;
  }
};

export const incrementProjectViews = async (projectId: string): Promise<void> => {
  try {
    const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
    await updateDoc(projectRef, {
      views: increment(1),
    });
  } catch (error) {
    console.error('Error incrementing views:', error);
  }
};

// ============= BROWSE & SEARCH =============

export const getAllProjects = async (
  filters?: FilterOptions,
  sortOption?: SortOption,
  limitCount: number = 50
): Promise<MarketplaceProject[]> => {
  try {
    let q = query(
      collection(db, PROJECTS_COLLECTION),
      where('status', '==', 'published')
    );

    // Apply filters
    if (filters?.category) {
      q = query(q, where('category', '==', filters.category));
    }
    if (filters?.licenseType) {
      q = query(q, where('licenseType', '==', filters.licenseType));
    }

    // Apply sorting
    if (sortOption) {
      q = query(q, orderBy(sortOption.field, sortOption.direction));
    } else {
      q = query(q, orderBy('createdAt', 'desc'));
    }

    q = query(q, limit(limitCount));

    const querySnapshot = await getDocs(q);
    let projects = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as MarketplaceProject[];

    // Client-side filtering for more complex queries
    if (filters?.minPrice !== undefined) {
      projects = projects.filter(p => p.price >= filters.minPrice!);
    }
    if (filters?.maxPrice !== undefined) {
      projects = projects.filter(p => p.price <= filters.maxPrice!);
    }
    if (filters?.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      projects = projects.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.techStack.some(tech => tech.toLowerCase().includes(query))
      );
    }
    if (filters?.techStack && filters.techStack.length > 0) {
      projects = projects.filter(p =>
        filters.techStack!.some(tech => p.techStack.includes(tech))
      );
    }

    return projects;
  } catch (error: any) {
    console.error('Error getting projects:', error);
    console.error('Error code:', error?.code);
    console.error('Error message:', error?.message);
    
    // Return empty array instead of throwing to prevent UI crashes
    if (error?.code === 'permission-denied') {
      console.warn('Firestore permission denied. Please deploy the firestore.rules file.');
    }
    return [];
  }
};

export const getSellerProjects = async (sellerId: string): Promise<MarketplaceProject[]> => {
  try {
    // Try with ordering first (requires composite index)
    const q = query(
      collection(db, PROJECTS_COLLECTION),
      where('sellerId', '==', sellerId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as MarketplaceProject[];
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    // If index is missing, try without ordering and sort client-side
    if (err?.code === 'failed-precondition' || err?.message?.includes('index')) {
      console.warn('Index missing for getSellerProjects, using client-side sorting');
      try {
        const q = query(
          collection(db, PROJECTS_COLLECTION),
          where('sellerId', '==', sellerId)
        );
        const querySnapshot = await getDocs(q);
        const projects = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as MarketplaceProject[];
        // Sort client-side
        return projects.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      } catch (fallbackError) {
        console.error('Fallback query also failed:', fallbackError);
        return [];
      }
    }
    console.error('Error getting seller projects:', error);
    return [];
  }
};

// ============= PURCHASE OPERATIONS =============

export const createPurchase = async (
  projectId: string,
  project: MarketplaceProject,
  buyerId: string,
  buyerName: string
): Promise<string> => {
  try {
    // Create purchase record
    const purchaseRef = await addDoc(collection(db, PURCHASES_COLLECTION), {
      projectId,
      projectTitle: project.title,
      projectImages: project.images,
      buyerId,
      buyerName,
      sellerId: project.sellerId,
      sellerName: project.sellerName,
      price: project.price,
      purchasedAt: Timestamp.now(),
      status: 'completed',
      accessLinks: project.links,
    });

    // Increment purchase count
    const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
    await updateDoc(projectRef, {
      purchases: increment(1),
    });

    return purchaseRef.id;
  } catch (error) {
    console.error('Error creating purchase:', error);
    throw error;
  }
};

export const getUserPurchases = async (userId: string): Promise<MarketplacePurchase[]> => {
  try {
    const q = query(
      collection(db, PURCHASES_COLLECTION),
      where('buyerId', '==', userId),
      orderBy('purchasedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      purchasedAt: doc.data().purchasedAt?.toDate() || new Date(),
    })) as MarketplacePurchase[];
  } catch (error) {
    console.error('Error getting purchases:', error);
    throw error;
  }
};

export const checkUserPurchased = async (
  userId: string,
  projectId: string
): Promise<boolean> => {
  try {
    const q = query(
      collection(db, PURCHASES_COLLECTION),
      where('buyerId', '==', userId),
      where('projectId', '==', projectId),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking purchase:', error);
    return false;
  }
};

export const getSellerSales = async (sellerId: string): Promise<MarketplacePurchase[]> => {
  try {
    const q = query(
      collection(db, PURCHASES_COLLECTION),
      where('sellerId', '==', sellerId),
      orderBy('purchasedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      purchasedAt: doc.data().purchasedAt?.toDate() || new Date(),
    })) as MarketplacePurchase[];
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    // If index is missing, try without ordering and sort client-side
    if (err?.code === 'failed-precondition' || err?.message?.includes('index')) {
      console.warn('Index missing for getSellerSales, using client-side sorting');
      try {
        const q = query(
          collection(db, PURCHASES_COLLECTION),
          where('sellerId', '==', sellerId)
        );
        const querySnapshot = await getDocs(q);
        const sales = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          purchasedAt: doc.data().purchasedAt?.toDate() || new Date(),
        })) as MarketplacePurchase[];
        // Sort client-side
        return sales.sort((a, b) => b.purchasedAt.getTime() - a.purchasedAt.getTime());
      } catch (fallbackError) {
        console.error('Fallback query also failed:', fallbackError);
        return [];
      }
    }
    console.error('Error getting sales:', error);
    return [];
  }
};

// ============= REVIEW OPERATIONS =============

export const createReview = async (
  projectId: string,
  buyerId: string,
  buyerName: string,
  buyerAvatar: string,
  rating: number,
  comment: string
): Promise<void> => {
  try {
    // Add review
    await addDoc(collection(db, REVIEWS_COLLECTION), {
      projectId,
      buyerId,
      buyerName,
      buyerAvatar,
      rating,
      comment,
      createdAt: Timestamp.now(),
      helpful: 0,
    });

    // Update project rating
    const reviews = await getProjectReviews(projectId);
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0) + rating;
    const avgRating = totalRating / (reviews.length + 1);

    const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
    await updateDoc(projectRef, {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: increment(1),
    });
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

export const getProjectReviews = async (projectId: string): Promise<MarketplaceReview[]> => {
  try {
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where('projectId', '==', projectId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as MarketplaceReview[];
  } catch (error) {
    console.error('Error getting reviews:', error);
    throw error;
  }
};

// ============= ADMIN VERIFICATION FUNCTIONS =============

export const getPendingMarketplaceProjects = async (): Promise<MarketplaceProject[]> => {
  try {
    const q = query(
      collection(db, PROJECTS_COLLECTION),
      where('status', '==', 'pending_verification'),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as MarketplaceProject[];
  } catch (error) {
    console.error('Error getting pending marketplace projects:', error);
    throw error;
  }
};

export const approveMarketplaceProject = async (projectId: string): Promise<void> => {
  try {
    const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
    await updateDoc(projectRef, {
      status: 'published',
      verifiedAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error approving marketplace project:', error);
    throw error;
  }
};

export const rejectMarketplaceProject = async (projectId: string, rejectionReason: string): Promise<void> => {
  try {
    const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
    await updateDoc(projectRef, {
      status: 'rejected',
      rejectionReason,
      rejectedAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error rejecting marketplace project:', error);
    throw error;
  }
};

export const getAllMarketplaceProjectsForAdmin = async (): Promise<MarketplaceProject[]> => {
  try {
    const q = query(
      collection(db, PROJECTS_COLLECTION),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as MarketplaceProject[];
  } catch (error) {
    console.error('Error getting all marketplace projects:', error);
    throw error;
  }
};

// ============= REAL-TIME LISTENERS =============

export const subscribeToProjects = (
  callback: (projects: MarketplaceProject[]) => void,
  filters?: FilterOptions
) => {
  let q = query(
    collection(db, PROJECTS_COLLECTION),
    where('status', '==', 'published'),
    orderBy('createdAt', 'desc')
  );

  if (filters?.category) {
    q = query(q, where('category', '==', filters.category));
  }

  return onSnapshot(q, (snapshot) => {
    const projects = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as MarketplaceProject[];
    
    callback(projects);
  });
};
