'use server';
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import client from "./directus";
import { readMe } from "@directus/sdk";

export async function getAuthenticatedUser() {
  try {
    // Fetch the currently authenticated user's details
    const token = (await cookies()).get("directus_session_token")?.value;

    if (!token) {
      redirect("/login"); // Redirect if unauthorized
    }

    client.setToken(token);
    const user = await client.request(readMe());
    return { success: true, user };
  } catch {
    redirect("/login"); // Redirect if unauthorized
  }
}