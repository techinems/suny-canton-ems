import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production
  },
  user: {
    additionalFields: {
      firstName: {
        type: "string",
        required: false,
        input: true,
      },
      lastName: {
        type: "string",
        required: false,
        input: true,
      },
      preferredName: {
        type: "string",
        required: false,
        input: true,
      },
      dob: {
        type: "date",
        required: true,
        input: true,
      },
      cantonEmail: {
        type: "string",
        required: false,
        input: true,
      },
      position: {
        type: "string",
        required: false,
        input: true,
        defaultValue: "MEMBER",
      },
      major: {
        type: "string",
        required: false,
        input: true,
      },
      membershipStanding: {
        type: "string",
        required: false,
        input: false,
        defaultValue: "GOOD",
      },
      cantonCardId: {
        type: "string",
        required: false,
        input: true,
      },
      gpa: {
        type: "number",
        required: false,
        input: true,
      },
      phoneNumber: {
        type: "string",
        required: false,
        input: true,
      },
      medicalLevel: {
        type: "string",
        required: false,
        input: true,
      },
      housingType: {
        type: "string",
        required: false,
        input: true,
      },
      building: {
        type: "string",
        required: false,
        input: true,
      },
      roomNumber: {
        type: "number",
        required: false,
        input: true,
      },
      homeAddress: {
        type: "string",
        required: false,
        input: true,
      },
      localAddress: {
        type: "string",
        required: false,
        input: true,
      },
      shirtSize: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  trustedOrigins: [
    process.env.NODE_ENV === "production" 
      ? "https://your-production-domain.com" 
      : "http://localhost:3000"
  ],
});

export type Session = typeof auth.$Infer.Session;