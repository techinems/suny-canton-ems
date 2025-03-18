'use client';
import { pb } from './pocketbase';

export interface InventoryItem {
  id: string;
  item_name: string;
  manufacturer?: string;
  description?: string;
  quantity: number;
  size?: string;
  manufacturing_date?: string;
  purchase_date?: string;
  price?: number;
  paid_by?: string;
  disposable?: boolean;
  expiration_date?: string;
  created?: string;
  updated?: string;
}

// Get all inventory items
export async function getInventoryItems() {
  return await pb.collection('inventory').getFullList<InventoryItem>();
}

// Get a single inventory item by ID
export async function getInventoryItem(id: string) {
  return await pb.collection('inventory').getOne<InventoryItem>(id);
}

// Create a new inventory item
export async function createInventoryItem(item: Omit<InventoryItem, 'id' | 'created' | 'updated'>) {
  return await pb.collection('inventory').create<InventoryItem>(item);
}

// Update an existing inventory item
export async function updateInventoryItem(id: string, item: Partial<InventoryItem>) {
  return await pb.collection('inventory').update<InventoryItem>(id, item);
}

// Delete an inventory item
export async function deleteInventoryItem(id: string) {
  return await pb.collection('inventory').delete(id);
}