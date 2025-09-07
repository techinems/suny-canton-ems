'use client';

interface RawInventoryItem {
  id: string;
  itemName: string | null;
  manufacturer?: string | null;
  description?: string | null;
  quantity: number;
  size?: string | null;
  manufacturingDate?: string | null;
  purchaseDate?: string | null;
  price?: number | null;
  paidBy?: string | null;
  disposable?: boolean | null;
  expirationDate?: string | null;
  created: string;
  updated: string;
}

export interface InventoryItem {
  id: string;
  itemName: string | null;
  manufacturer?: string | null;
  description?: string | null;
  quantity: number;
  size?: string | null;
  manufacturingDate?: Date | null;
  purchaseDate?: Date | null;
  price?: number | null;
  paidBy?: string | null;
  disposable?: boolean | null;
  expirationDate?: Date | null;
  created: Date;
  updated: Date;
}

export interface CreateInventoryItemData {
  itemName: string;
  manufacturer?: string | null;
  description?: string | null;
  quantity: number;
  size?: string | null;
  manufacturingDate?: Date | null;
  purchaseDate?: Date | null;
  price?: number | null;
  paidBy?: string | null;
  disposable?: boolean | null;
  expirationDate?: Date | null;
}

// Get all inventory items
export async function getInventoryItems(): Promise<InventoryItem[]> {
  try {
    const response = await fetch('/api/inventory');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const items: RawInventoryItem[] = await response.json();
    return items.map(item => ({
      ...item,
      manufacturingDate: item.manufacturingDate ? new Date(item.manufacturingDate) : null,
      purchaseDate: item.purchaseDate ? new Date(item.purchaseDate) : null,
      expirationDate: item.expirationDate ? new Date(item.expirationDate) : null,
      created: new Date(item.created),
      updated: new Date(item.updated),
    }));
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    throw error;
  }
}

// Get a single inventory item by ID
export async function getInventoryItem(id: string): Promise<InventoryItem> {
  try {
    const response = await fetch(`/api/inventory/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const item: RawInventoryItem = await response.json();
    return {
      ...item,
      manufacturingDate: item.manufacturingDate ? new Date(item.manufacturingDate) : null,
      purchaseDate: item.purchaseDate ? new Date(item.purchaseDate) : null,
      expirationDate: item.expirationDate ? new Date(item.expirationDate) : null,
      created: new Date(item.created),
      updated: new Date(item.updated),
    };
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    throw error;
  }
}

// Create a new inventory item
export async function createInventoryItem(item: CreateInventoryItemData): Promise<InventoryItem> {
  try {
    const response = await fetch('/api/inventory', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const createdItem: RawInventoryItem = await response.json();
    return {
      ...createdItem,
      manufacturingDate: createdItem.manufacturingDate ? new Date(createdItem.manufacturingDate) : null,
      purchaseDate: createdItem.purchaseDate ? new Date(createdItem.purchaseDate) : null,
      expirationDate: createdItem.expirationDate ? new Date(createdItem.expirationDate) : null,
      created: new Date(createdItem.created),
      updated: new Date(createdItem.updated),
    };
  } catch (error) {
    console.error('Error creating inventory item:', error);
    throw error;
  }
}

// Update an existing inventory item
export async function updateInventoryItem(id: string, item: Partial<CreateInventoryItemData>): Promise<InventoryItem> {
  try {
    const response = await fetch(`/api/inventory/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const updatedItem: RawInventoryItem = await response.json();
    return {
      ...updatedItem,
      manufacturingDate: updatedItem.manufacturingDate ? new Date(updatedItem.manufacturingDate) : null,
      purchaseDate: updatedItem.purchaseDate ? new Date(updatedItem.purchaseDate) : null,
      expirationDate: updatedItem.expirationDate ? new Date(updatedItem.expirationDate) : null,
      created: new Date(updatedItem.created),
      updated: new Date(updatedItem.updated),
    };
  } catch (error) {
    console.error('Error updating inventory item:', error);
    throw error;
  }
}

// Delete an inventory item
export async function deleteInventoryItem(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/inventory/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    throw error;
  }
}