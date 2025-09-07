'use client';

interface RawCertification {
  id: string;
  certName: string;
  memberId: string;
  certScan: string;
  certExpiration?: string | null;
  certIssueDate?: string | null; 
  certNumber?: string | null;
  issuingAuthority?: string | null;
  created: string;
  updated: string;
}

export interface Certification {
  id: string;
  certName: string;
  memberId: string;
  certScan: File | string;
  certExpiration?: Date | null;
  certIssueDate?: Date | null; 
  certNumber?: string | null;
  issuingAuthority?: string | null;
  created: Date;
  updated: Date;
}

export interface CreateCertificationData {
  certName: string;
  memberId?: string;
  certScan: string;
  certExpiration?: Date | null;
  certIssueDate?: Date | null; 
  certNumber?: string | null;
  issuingAuthority?: string | null;
}

// Get file URL for certification scan
export function getFileUrl(cert: Certification): string | undefined {
  // If it's a file send back a data url
  if (typeof cert.certScan !== 'string') {
    return URL.createObjectURL(cert.certScan);
  }
  // For now, return the string as-is (could be a URL or base64)
  return cert.certScan;
}

// Get all certifications for the current user
export async function getUserCertifications(): Promise<Certification[]> {
  try {
    const response = await fetch('/api/certifications/user');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const certifications: RawCertification[] = await response.json();
    return certifications.map(cert => ({
      ...cert,
      certExpiration: cert.certExpiration ? new Date(cert.certExpiration) : null,
      certIssueDate: cert.certIssueDate ? new Date(cert.certIssueDate) : null,
      created: new Date(cert.created),
      updated: new Date(cert.updated),
    }));
  } catch (error) {
    console.error('Error fetching user certifications:', error);
    throw error;
  }
}

// Get all certifications
export async function getAllCertifications(): Promise<Certification[]> {
  try {
    const response = await fetch('/api/certifications');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const certifications: RawCertification[] = await response.json();
    return certifications.map(cert => ({
      ...cert,
      certExpiration: cert.certExpiration ? new Date(cert.certExpiration) : null,
      certIssueDate: cert.certIssueDate ? new Date(cert.certIssueDate) : null,
      created: new Date(cert.created),
      updated: new Date(cert.updated),
    }));
  } catch (error) {
    console.error('Error fetching certifications:', error);
    throw error;
  }
}

// Get certifications for a specific member
export async function getMemberCertifications(memberId: string): Promise<Certification[]> {
  try {
    const response = await fetch(`/api/certifications/member/${memberId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const certifications: RawCertification[] = await response.json();
    return certifications.map(cert => ({
      ...cert,
      certExpiration: cert.certExpiration ? new Date(cert.certExpiration) : null,
      certIssueDate: cert.certIssueDate ? new Date(cert.certIssueDate) : null,
      created: new Date(cert.created),
      updated: new Date(cert.updated),
    }));
  } catch (error) {
    console.error('Error fetching member certifications:', error);
    throw error;
  }
}

// Get a single certification by ID
export async function getCertification(id: string): Promise<Certification> {
  try {
    const response = await fetch(`/api/certifications/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const cert: RawCertification = await response.json();
    return {
      ...cert,
      certExpiration: cert.certExpiration ? new Date(cert.certExpiration) : null,
      certIssueDate: cert.certIssueDate ? new Date(cert.certIssueDate) : null,
      created: new Date(cert.created),
      updated: new Date(cert.updated),
    };
  } catch (error) {
    console.error('Error fetching certification:', error);
    throw error;
  }
}


// Create a new certification
export async function createCertification(certification: CreateCertificationData): Promise<Certification> {
  try {
    const response = await fetch('/api/certifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(certification),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const cert: RawCertification = await response.json();
    return {
      ...cert,
      certExpiration: cert.certExpiration ? new Date(cert.certExpiration) : null,
      certIssueDate: cert.certIssueDate ? new Date(cert.certIssueDate) : null,
      created: new Date(cert.created),
      updated: new Date(cert.updated),
    };
  } catch (error) {
    console.error('Error creating certification:', error);
    throw error;
  }
}

// Update an existing certification
export async function updateCertification(id: string, certification: Partial<CreateCertificationData>): Promise<Certification> {
  try {
    const response = await fetch(`/api/certifications/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(certification),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const cert: RawCertification = await response.json();
    return {
      ...cert,
      certExpiration: cert.certExpiration ? new Date(cert.certExpiration) : null,
      certIssueDate: cert.certIssueDate ? new Date(cert.certIssueDate) : null,
      created: new Date(cert.created),
      updated: new Date(cert.updated),
    };
  } catch (error) {
    console.error('Error updating certification:', error);
    throw error;
  }
}

// Delete a certification
export async function deleteCertification(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/certifications/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error('Error deleting certification:', error);
    throw error;
  }
}

// Helper to format certification dates for display
export function formatCertificationDates(cert: Certification) {
  return {
    ...cert,
    expiryDate: cert.certExpiration || undefined,
    issueDate: cert.certIssueDate || cert.created,
  };
}