'use client';
import { pb } from './pocketbase';

// Define the Member interface based on the PocketBase schema
export interface Member {
  id: string;
  email: string;
  emailVisibility: boolean;
  verified: boolean;
  first_name: string;
  last_name: string;
  preferred_name?: string;
  avatar?: string | File;
  shirt_size?: 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl' | 'xxxl';
  dob: string;
  canton_email?: string;
  position: 'Advisor' | 'President' | 'Vice President' | 'Secretary' | 'Treasurer' | 'Senator' | 'Member' | 'Honor Roll' | 'Auxillary';
  major?: string;
  membership_standing: 'Good' | 'Bad';
  canton_card_id: string;
  gpa: number;
  phone_number?: string;
  medical_level?: 'EMT' | 'First Responder';
  housing_type: 'On Campus' | 'Off Campus';
  building?: string;
  room_number: number;
  home_address?: string;
  local_address?: string;
  created: string;
  updated: string;
}

// Function to get all members
export const getAllMembers = async (): Promise<Member[]> => {
  try {
    const records = await pb.collection('users').getFullList({
      sort: 'last_name,first_name',
    });
    return records as unknown as Member[];
  } catch (error) {
    console.error('Error fetching members:', error);
    return [];
  }
};

// Function to get a member by ID
export const getMemberById = async (id: string): Promise<Member | null> => {
  try {
    const record = await pb.collection('users').getOne(id);
    return record as unknown as Member;
  } catch (error) {
    console.error(`Error fetching member with ID ${id}:`, error);
    return null;
  }
};

// Function to create a new member
export const createMember = async (memberData: Partial<Member>): Promise<Member | null> => {
  try {
    const record = await pb.collection('users').create(memberData);
    return record as unknown as Member;
  } catch (error) {
    console.error('Error creating member:', error);
    return null;
  }
};

// Function to update a member
export const updateMember = async (id: string, memberData: Partial<Member>): Promise<Member | null> => {
  try {
    const record = await pb.collection('users').update(id, memberData);
    return record as unknown as Member;
  } catch (error) {
    console.error(`Error updating member with ID ${id}:`, error);
    return null;
  }
};

// Function to delete a member
export const deleteMember = async (id: string): Promise<boolean> => {
  try {
    await pb.collection('users').delete(id);
    return true;
  } catch (error) {
    console.error(`Error deleting member with ID ${id}:`, error);
    return false;
  }
};

// Function to get the full name of a member
export const getFullName = (member: Member): string => {
  if (member.preferred_name) {
    return `${member.preferred_name} ${member.last_name}`;
  }
  return `${member.first_name} ${member.last_name}`;
};

// Function to get avatar URL
export const getMemberAvatarUrl = (member: Member): string => {
  // If it's a file send back a data url
  if (member.avatar && typeof member.avatar !== 'string') {
    return URL.createObjectURL(member.avatar);
  }
  // Use PocketBase's built-in file URL method if it's a string reference
  if (member.avatar) {
    return pb.files.getURL(member, member.avatar);
  }
  return ''; // Return empty string or a default avatar URL
};