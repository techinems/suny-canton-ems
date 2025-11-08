export interface Building {
  id: string;
  name: string;
  address: string;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    users: number;
    callLogs: number;
  };
}

export interface CreateBuildingData {
  name: string;
  address: string;
}

export interface UpdateBuildingData {
  name: string;
  address: string;
}

/**
 * Fetch all buildings
 */
export async function getBuildings(): Promise<Building[]> {
  const response = await fetch('/api/admin/buildings');
  
  if (!response.ok) {
    throw new Error('Failed to fetch buildings');
  }
  
  return response.json();
}

/**
 * Fetch a single building by ID
 */
export async function getBuilding(id: string): Promise<Building | null> {
  const response = await fetch(`/api/admin/buildings/${id}`);
  
  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch building');
  }
  
  return response.json();
}

/**
 * Create a new building
 */
export async function createBuilding(data: CreateBuildingData): Promise<Building> {
  const response = await fetch('/api/admin/buildings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create building');
  }
  
  return response.json();
}

/**
 * Update an existing building
 */
export async function updateBuilding(
  id: string,
  data: UpdateBuildingData
): Promise<Building> {
  const response = await fetch(`/api/admin/buildings/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update building');
  }
  
  return response.json();
}

/**
 * Delete a building
 */
export async function deleteBuilding(id: string): Promise<boolean> {
  const response = await fetch(`/api/admin/buildings/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete building');
  }
  
  return true;
}
