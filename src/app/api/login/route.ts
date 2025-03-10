import client from '@/lib/directus';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Define a more specific type for the error object
interface DirectusError {
    message?: string;
    status?: number;
    [key: string]: unknown;
}

export async function POST(request: NextRequest) {
    const formData = await request.formData();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    try {
        const response = await client.login(email, password);
        
        if (response.access_token) {
            const cookieStore = await cookies();
            cookieStore.set('directus_session_token', response.access_token, { 
                sameSite: 'strict', 
                httpOnly: true,
                path: '/', 
                secure: true 
            });
        }
        
        return new NextResponse(null, {status: 200});
    } catch (error) {
        console.error(error);
        
        // Cast error to our DirectusError type
        const directusError = error as DirectusError;
        
        // Check if the error is related to invalid credentials
        if (directusError?.status === 401) {
            return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
        }
        
        // For other server-side errors, keep the 500 status
        return NextResponse.json({ error: "Login failed due to server error" }, { status: 500 });
    }
}