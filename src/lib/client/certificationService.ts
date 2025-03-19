'use client';
import { pb } from './pocketbase';

export interface Certification {
  id: string;
  cert_name: string;
  member_id: string;
  cert_scan: File | string;
  cert_expiration?: string;
  cert_issue_date?: string; 
  cert_number?: string;
  issuing_authority?: string;
  created?: string;
  updated?: string;
}

// Get file URL for certification scan
export function getFileUrl(cert: Certification): string | undefined {
  // If it's a file send back a data url
  if (typeof cert.cert_scan !== 'string') {
    return URL.createObjectURL(cert.cert_scan);
  }
  // Use PocketBase's built-in file URL method
  return pb.files.getURL(cert, cert.cert_scan);
}

// Get all certifications for the current user
export async function getUserCertifications() {
  const userId = pb.authStore.record?.id;
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  return await pb.collection('certifications').getFullList<Certification>({
    filter: `member_id="${userId}"`,
    sort: '-cert_expiration',
  });
}

// Get all certifications
export async function getAllCertifications() {
  return await pb.collection('certifications').getFullList<Certification>();
}

// Get certifications for a specific member
export async function getMemberCertifications(memberId: string) {
  return await pb.collection('certifications').getFullList<Certification>({
    filter: `member_id="${memberId}"`,
    sort: '-cert_expiration',
  });
}

// Get a single certification by ID
export async function getCertification(id: string) {
  return await pb.collection('certifications').getOne<Certification>(id);
}


// Create a new certification
export async function createCertification(certification: Omit<Certification, 'id' | 'created' | 'updated'>, userId?: string) {
  const memberId = certification.member_id ?? userId ?? pb.authStore.record?.id
  certification.member_id = memberId;
  return await pb.collection('certifications').create<Certification>(certification);
}

// Update an existing certification
export async function updateCertification(id: string, certification: Partial<Certification>) {
  return await pb.collection('certifications').update<Certification>(id, certification);
}

// Delete a certification
export async function deleteCertification(id: string) {
  return await pb.collection('certifications').delete(id);
}

// Helper to convert string dates from PocketBase to JavaScript Date objects
export function formatCertificationDates(cert: Certification) {
  return {
    ...cert,
    expiryDate: cert.cert_expiration ? new Date(cert.cert_expiration) : undefined,
    issueDate: cert.cert_issue_date ? new Date(cert.cert_issue_date) : 
               cert.created ? new Date(cert.created) : new Date(), // Fallback to created date or current date
  };
}