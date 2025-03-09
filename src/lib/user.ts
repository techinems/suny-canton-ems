'use server';
import { cookies } from "next/headers";
import client from "./directus";
import { readMe } from "@directus/sdk";

interface IUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar: string;
}

export async function getAuthenticatedUser(): Promise<IUser | undefined> {
  try {
    // Fetch the currently authenticated user's details
    const token = (await cookies()).get("directus_session_token")?.value;

    if (!token) {
      return undefined;
    }

    client.setToken(token);
    const user = await client.request(readMe()) as IUser;
    return user;
  } catch {
    return undefined;
  }
}