import { pb } from './pocketbase';

export interface CallLog {
  id: string;
  call_received: string;
  call_enroute: string;
  on_scene: string;
  back_in_service: string;
  level_of_care: 'EMT' | 'None';
  dispatch_info?: string;
  location: string;
  jumpbag_used: boolean;
  type?: 'Standby';
  items_used?: string[];
  crew?: string[];
  comments?: string;
  status?: 'Cancelled enroute' | 'Complete';
  created: string;
  updated: string;
}

export interface CreateCallLogData {
  call_received: string;
  call_enroute: string;
  on_scene: string;
  back_in_service: string;
  level_of_care: 'EMT' | 'None';
  dispatch_info?: string;
  location: string;
  jumpbag_used?: boolean;
  type?: 'Standby';
  items_used?: string[];
  crew?: string[];
  comments?: string;
  status?: 'Cancelled enroute' | 'Complete';
}

// Fetch all call logs
export async function getCallLogs(): Promise<CallLog[]> {
  try {
    const records = await pb.collection('call_log').getFullList({
      sort: '-call_received',
    });
    return records as unknown as CallLog[];
  } catch (error) {
    console.error('Error fetching call logs:', error);
    throw error;
  }
}

// Get a single call log by ID
export async function getCallLog(id: string): Promise<CallLog> {
  try {
    const record = await pb.collection('call_log').getOne(id);
    return record as unknown as CallLog;
  } catch (error) {
    console.error(`Error fetching call log with ID ${id}:`, error);
    throw error;
  }
}

// Create a new call log
export async function createCallLog(data: CreateCallLogData): Promise<CallLog> {
  try {
    const record = await pb.collection('call_log').create(data);
    return record as unknown as CallLog;
  } catch (error) {
    console.error('Error creating call log:', error);
    throw error;
  }
}

// Update an existing call log
export async function updateCallLog(id: string, data: Partial<CreateCallLogData>): Promise<CallLog> {
  try {
    const record = await pb.collection('call_log').update(id, data);
    return record as unknown as CallLog;
  } catch (error) {
    console.error(`Error updating call log with ID ${id}:`, error);
    throw error;
  }
}

// Delete a call log
export async function deleteCallLog(id: string): Promise<boolean> {
  try {
    await pb.collection('call_log').delete(id);
    return true;
  } catch (error) {
    console.error(`Error deleting call log with ID ${id}:`, error);
    throw error;
  }
}