interface RawCallLog {
  id: string;
  callReceived: string;
  callEnroute: string;
  onScene: string;
  backInService: string;
  levelOfCare: 'EMT' | 'NONE';
  dispatchInfo?: string | null;
  buildingId?: string | null;
  building?: {
    id: string;
    name: string;
    address: string;
  } | null;
  location?: string | null;
  jumpbagUsed: boolean | null;
  type?: 'STANDBY' | null;
  itemsUsed: string[];
  crew: string[];
  comments?: string | null;
  status?: 'CANCELLED_ENROUTE' | 'COMPLETE' | null;
  created: string;
  updated: string;
}

export interface CallLog {
  id: string;
  callReceived: Date;
  callEnroute: Date;
  onScene: Date;
  backInService: Date;
  levelOfCare: 'EMT' | 'NONE';
  dispatchInfo?: string | null;
  buildingId?: string | null;
  building?: {
    id: string;
    name: string;
    address: string;
  } | null;
  location?: string | null;
  jumpbagUsed: boolean | null;
  type?: 'STANDBY' | null;
  itemsUsed: string[];
  crew: string[];
  comments?: string | null;
  status?: 'CANCELLED_ENROUTE' | 'COMPLETE' | null;
  created: Date;
  updated: Date;
}

export interface CreateCallLogData {
  callReceived: Date;
  callEnroute: Date;
  onScene: Date;
  backInService: Date;
  levelOfCare: 'EMT' | 'NONE';
  dispatchInfo?: string | null;
  buildingId?: string | null;
  location?: string | null;
  jumpbagUsed?: boolean | null;
  type?: 'STANDBY' | null;
  itemsUsed?: string[];
  crew?: string[];
  comments?: string | null;
  status?: 'CANCELLED_ENROUTE' | 'COMPLETE' | null;
}

// Fetch all call logs
export async function getCallLogs(): Promise<CallLog[]> {
  try {
    const response = await fetch('/api/calls');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const callLogs = await response.json();
    return callLogs.map((log: RawCallLog) => ({
      ...log,
      callReceived: new Date(log.callReceived),
      callEnroute: new Date(log.callEnroute),
      onScene: new Date(log.onScene),
      backInService: new Date(log.backInService),
      created: new Date(log.created),
      updated: new Date(log.updated),
    }));
  } catch (error) {
    console.error('Error fetching call logs:', error);
    throw error;
  }
}

// Get a single call log by ID
export async function getCallLog(id: string): Promise<CallLog> {
  try {
    const response = await fetch(`/api/calls/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const callLog: RawCallLog = await response.json();
    return {
      ...callLog,
      callReceived: new Date(callLog.callReceived),
      callEnroute: new Date(callLog.callEnroute),
      onScene: new Date(callLog.onScene),
      backInService: new Date(callLog.backInService),
      created: new Date(callLog.created),
      updated: new Date(callLog.updated),
    };
  } catch (error) {
    console.error(`Error fetching call log with ID ${id}:`, error);
    throw error;
  }
}

// Create a new call log
export async function createCallLog(data: CreateCallLogData): Promise<CallLog> {
  try {
    const response = await fetch('/api/calls', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const callLog: RawCallLog = await response.json();
    return {
      ...callLog,
      callReceived: new Date(callLog.callReceived),
      callEnroute: new Date(callLog.callEnroute),
      onScene: new Date(callLog.onScene),
      backInService: new Date(callLog.backInService),
      created: new Date(callLog.created),
      updated: new Date(callLog.updated),
    };
  } catch (error) {
    console.error('Error creating call log:', error);
    throw error;
  }
}

// Update an existing call log
export async function updateCallLog(id: string, data: Partial<CreateCallLogData>): Promise<CallLog> {
  try {
    const response = await fetch(`/api/calls/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const callLog: RawCallLog = await response.json();
    return {
      ...callLog,
      callReceived: new Date(callLog.callReceived),
      callEnroute: new Date(callLog.callEnroute),
      onScene: new Date(callLog.onScene),
      backInService: new Date(callLog.backInService),
      created: new Date(callLog.created),
      updated: new Date(callLog.updated),
    };
  } catch (error) {
    console.error(`Error updating call log with ID ${id}:`, error);
    throw error;
  }
}

// Delete a call log
export async function deleteCallLog(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/calls/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error(`Error deleting call log with ID ${id}:`, error);
    throw error;
  }
}