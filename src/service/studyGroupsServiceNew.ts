import { apiRequest } from "./api";

// Get all study groups
export const getStudyGroups = async (filters?: {
  category?: string;
  search?: string;
}): Promise<any[]> => {
  try {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    
    const response = await apiRequest(`/study-groups?${params.toString()}`);
    return response.groups;
  } catch (error) {
    console.error('Error getting study groups:', error);
    return [];
  }
};

// Alias for getStudyGroups (used in some components)
export const getAllStudyGroups = getStudyGroups;

// Create study group
export const createStudyGroup = async (groupData: any): Promise<any> => {
  try {
    const response = await apiRequest('/study-groups', {
      method: 'POST',
      body: JSON.stringify(groupData)
    });
    return response.group;
  } catch (error) {
    console.error('Error creating study group:', error);
    throw error;
  }
};

// Get group by ID
export const getStudyGroupById = async (groupId: string): Promise<any> => {
  try {
    const response = await apiRequest(`/study-groups/${groupId}`);
    return response.group;
  } catch (error) {
    console.error('Error getting study group:', error);
    throw error;
  }
};

// Join study group
export const joinStudyGroup = async (groupId: string, userName: string, userAvatar?: string): Promise<any> => {
  try {
    const response = await apiRequest(`/study-groups/${groupId}/join`, {
      method: 'POST',
      body: JSON.stringify({ userName, userAvatar })
    });
    return response.group;
  } catch (error) {
    console.error('Error joining study group:', error);
    throw error;
  }
};

// Leave study group
export const leaveStudyGroup = async (groupId: string): Promise<void> => {
  try {
    await apiRequest(`/study-groups/${groupId}/leave`, {
      method: 'POST'
    });
  } catch (error) {
    console.error('Error leaving study group:', error);
    throw error;
  }
};

// Add resource to group
export const addGroupResource = async (groupId: string, resource: any): Promise<any> => {
  try {
    const response = await apiRequest(`/study-groups/${groupId}/resources`, {
      method: 'POST',
      body: JSON.stringify(resource)
    });
    return response.group;
  } catch (error) {
    console.error('Error adding resource:', error);
    throw error;
  }
};

// Delete study group
export const deleteStudyGroup = async (groupId: string): Promise<void> => {
  try {
    await apiRequest(`/study-groups/${groupId}`, {
      method: 'DELETE'
    });
  } catch (error) {
    console.error('Error deleting study group:', error);
    throw error;
  }
};
