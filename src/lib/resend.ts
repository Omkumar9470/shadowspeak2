import { Resend } from "resend";

// Use the API key directly from the environment variable
// This ensures we're using the exact string value without any processing
export const resend = new Resend(process.env.RESEND_API_KEY);