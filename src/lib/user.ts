'use server';
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import client from "./directus";
import { readItems, readMe } from "@directus/sdk";

interface IUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar: string;
}

async function getMembershipRoster(userId: string) {
  // Fetch the membership roster for the user
  const response = await client.request(
    readItems("membership_roster", {
      filter: {
        directus_account: {
          _eq: userId,
        },
      },
      limit: 1,
    })
  );
  return response.length ? response[0] : undefined;
}

export async function getAuthenticatedUser(): Promise<IUser | undefined> {
  try {
    // Fetch the currently authenticated user's details
    const token = (await cookies()).get("directus_session_token")?.value;

    if (!token) {
      redirect("/login"); // Redirect if unauthorized
    }

    client.setToken(token);
    const user = await client.request(readMe()) as IUser;
    const membership = await getMembershipRoster(user.id);
    console.log(membership);
    return user;
  } catch {
    return undefined;
  }
}