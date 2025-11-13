'use client';

import type { FileRecord } from '@/lib/server/fileService';

// Define the Member interface based on the Prisma User model
export interface Member {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  preferredName: string | null;
  avatar: string | null;
  shirtSize: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL' | null;
  dob: Date;
  cantonEmail: string | null;
  position: 'MEMBER' | 'PROBATIONARY_MEMBER' | 'LIEUTENANT' | 'CAPTAIN' | 'TREASURER' | 'SECRETARY' | 'VICE_PRESIDENT' | 'PRESIDENT' | 'ALUMNI' | 'ADVISOR' | 'SENATOR' | 'HONOR_ROLL' | 'AUXILIARY';
  isAdmin: boolean;
  major: string | null;
  membershipStanding: 'GOOD' | 'BAD';
  cantonCardId: string;
  gpa: number;
  phoneNumber: string | null;
  medicalLevel: 'EMR' | 'EMT' | 'AEMT' | null;
  housingType: 'ON_CAMPUS' | 'OFF_CAMPUS' | 'COMMUTER';
  buildingId: string | null;
  building?: {
    id: string;
    name: string;
    address: string;
  } | null;
  roomNumber: number | null;
  homeAddress: string | null;
  localAddress: string | null;
  createdAt: Date;
  updatedAt: Date;
  emailVerified: boolean;
  image: string | null;
  name: string | null;
}

type AvatarUser = Pick<Member, 'id' | 'avatar' | 'email' | 'firstName' | 'lastName'>;

interface AvatarUploadResponse {
  user: AvatarUser;
  file: FileRecord;
}

// Function to get all members
export const getAllMembers = async (): Promise<Member[]> => {
  try {
    const response = await fetch('/api/members');
    if (!response.ok) {
      throw new Error('Failed to fetch members');
    }
    const members = await response.json();
    return members;
  } catch (error) {
    console.error('Error fetching members:', error);
    return [];
  }
};

// Function to get a member by ID
export const getMemberById = async (id: string): Promise<Member | null> => {
  try {
    const response = await fetch(`/api/members/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch member with ID ${id}`);
    }
    const member = await response.json();
    return member;
  } catch (error) {
    console.error(`Error fetching member with ID ${id}:`, error);
    return null;
  }
};

// Function to create a new member
export const createMember = async (memberData: Partial<Member>): Promise<Member | null> => {
  try {
    const response = await fetch('/api/admin/members', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(memberData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create member');
    }
    
    const member = await response.json();
    return member;
  } catch (error) {
    console.error('Error creating member:', error);
    return null;
  }
};

// Function to update a member
export const updateMember = async (id: string, memberData: Partial<Member>): Promise<Member | null> => {
  try {
    const response = await fetch(`/api/admin/members/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(memberData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update member with ID ${id}`);
    }
    
    const member = await response.json();
    return member;
  } catch (error) {
    console.error(`Error updating member with ID ${id}:`, error);
    return null;
  }
};

// Function to delete a member
export const deleteMember = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/admin/members/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete member with ID ${id}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error deleting member with ID ${id}:`, error);
    return false;
  }
};

// Function to get the full name of a member
export const getFullName = (member: Member): string => {
  if (member.preferredName) {
    return `${member.preferredName} ${member.lastName}`;
  }
  return `${member.firstName} ${member.lastName}`;
};

// Function to get avatar URL
export const getMemberAvatarUrl = (member: Member): string => {
  // If avatar is a file ID (cuid format), construct the file URL
  if (member.avatar && member.avatar.length > 20) {
    return `/api/files/${member.avatar}`;
  }
  // Fallback to legacy avatar URL or image field
  return member.avatar || member.image || '';
};

// Function to upload avatar
export const uploadAvatar = async (file: File): Promise<AvatarUploadResponse | null> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/profile/avatar', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload avatar');
    }

    const result = (await response.json()) as AvatarUploadResponse;
    return result;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
};

// Function to delete avatar
export const deleteAvatar = async (): Promise<{ user: AvatarUser } | null> => {
  try {
    const response = await fetch('/api/profile/avatar', {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete avatar');
    }

    const result = (await response.json()) as { user: AvatarUser };
    return result;
  } catch (error) {
    console.error('Error deleting avatar:', error);
    throw error;
  }
};

// Function to get avatar file info
export const getAvatarInfo = async (): Promise<FileRecord | null> => {
  try {
    const response = await fetch('/api/profile/avatar');

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const error = await response.json();
      throw new Error(error.error || 'Failed to get avatar info');
    }

    const result = (await response.json()) as { file: FileRecord };
    return result.file;
  } catch (error) {
    console.error('Error getting avatar info:', error);
    throw error;
  }
};