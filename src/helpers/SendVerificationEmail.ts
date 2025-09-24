import {resend} from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string
): Promise<ApiResponse> {
    try {
        // Log the API key (first few characters only for security)
        const apiKey = process.env.RESEND_API_KEY;
        console.log("Using Resend API Key (first 5 chars):", apiKey ? apiKey.substring(0, 5) : "undefined");
        
        const data = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'ShadowSpeak | Verification code',
            react: VerificationEmail({username, otp:verifyCode}),
        });
        
        console.log("Email sent successfully:", data);
        return {success: true, message: 'Verification email sent successfully'}
    } catch (emailError) {
        console.error("Error sending verification email:", emailError);
        return {success: false, message: 'Failed to send verification email'}
    }    
}