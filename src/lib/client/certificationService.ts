'use client';

interface RawCertification {
  id: string;
  certName: string;
  memberId: string;
  certScan: string | null;
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
  certScan: string | null;
  certExpiration?: Date | null;
  certIssueDate?: Date | null;
  certNumber?: string | null;
  issuingAuthority?: string | null;
  created: Date;
  updated: Date;
}

export interface CertificationInput {
  certName?: string;
  memberId?: string;
  certScan?: File | null;
  certExpiration?: Date | null;
  certIssueDate?: Date | null;
  certNumber?: string | null;
  issuingAuthority?: string | null;
}

const FILE_ID_PATTERN = /^[a-z0-9]{10,}$/i;

const mapCertification = (cert: RawCertification): Certification => ({
  ...cert,
  certScan: cert.certScan || null,
  certExpiration: cert.certExpiration ? new Date(cert.certExpiration) : null,
  certIssueDate: cert.certIssueDate ? new Date(cert.certIssueDate) : null,
  created: new Date(cert.created),
  updated: new Date(cert.updated),
});

const appendIfDefined = (formData: FormData, key: string, value: string | null | undefined) => {
  if (value === undefined) {
    return;
  }
  formData.append(key, value ?? "");
};

const serializeDateField = (
  value: Date | string | number | { toISOString?: () => string } | null | undefined
): string | null | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return "";
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value.toISOString();
  }

  if (typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return "";
    }
    const date = new Date(trimmed);
    return Number.isNaN(date.getTime()) ? trimmed : date.toISOString();
  }

  if (value && typeof value === "object" && typeof value.toISOString === "function") {
    return value.toISOString();
  }

  return undefined;
};

const buildCertificationFormData = (input: CertificationInput): FormData => {
  const formData = new FormData();

  if (input.certScan instanceof File) {
    formData.append("file", input.certScan);
  }

  appendIfDefined(formData, "certName", input.certName ?? undefined);
  appendIfDefined(formData, "memberId", input.memberId ?? undefined);
  appendIfDefined(formData, "certExpiration", serializeDateField(input.certExpiration));
  appendIfDefined(formData, "certIssueDate", serializeDateField(input.certIssueDate));
  appendIfDefined(formData, "certNumber", input.certNumber);
  appendIfDefined(formData, "issuingAuthority", input.issuingAuthority);

  return formData;
};

// Get file URL for certification scan
export function getFileUrl(cert: Certification): string | undefined {
  if (!cert.certScan) {
    return undefined;
  }

  const value = cert.certScan;
  if (value.startsWith("http")) {
    return value;
  }
  if (value.startsWith("data:")) {
    return value;
  }
  if (FILE_ID_PATTERN.test(value)) {
    return `/api/files/${value}`;
  }

  return value;
}

// Get all certifications for the current user
export async function getUserCertifications(): Promise<Certification[]> {
  try {
    const response = await fetch('/api/certifications/user');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const certifications: RawCertification[] = await response.json();
    return certifications.map(mapCertification);
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
    return certifications.map(mapCertification);
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
    return certifications.map(mapCertification);
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
    return mapCertification(cert);
  } catch (error) {
    console.error('Error fetching certification:', error);
    throw error;
  }
}


// Create a new certification
export async function createCertification(certification: CertificationInput): Promise<Certification> {
  try {
    if (!(certification.certScan instanceof File)) {
      throw new Error('Certificate scan file is required');
    }
    const formData = buildCertificationFormData(certification);
    const response = await fetch('/api/certifications', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const cert: RawCertification = await response.json();
    return mapCertification(cert);
  } catch (error) {
    console.error('Error creating certification:', error);
    throw error;
  }
}

// Update an existing certification
export async function updateCertification(id: string, certification: CertificationInput): Promise<Certification> {
  try {
    const formData = buildCertificationFormData(certification);
    const response = await fetch(`/api/certifications/${id}`, {
      method: 'PUT',
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const cert: RawCertification = await response.json();
    return mapCertification(cert);
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