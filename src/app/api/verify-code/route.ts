import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user";

export async function POST(request: Request) {
    await dbConnect();

    try {
        const { username, code } = await request.json();

        // Find the user by username
        const user = await UserModel.findOne({ username });

        if (!user) {
            return Response.json({
                success: false,
                message: "User not found"
            }, { status: 404 });
        }

        // Check if the verification code matches
        if (user.verifyCode !== code) {
            return Response.json({
                success: false,
                message: "Verification code does not match"
            }, { status: 400 });
        }

        // Check if the verification code has expired
        if (user.verifyCodeExpiry < new Date()) {
            return Response.json({
                success: false,
                message: "Verification code has expired"
            }, { status: 400 });
        }

        // Update user to verified status
        // Instead of setting to empty string, keep the code but mark as verified
        user.isVerified = true;
        
        // Save the changes
        await user.save();

        return Response.json({
            success: true,
            message: "Account verified successfully!"
        }, { status: 200 });

    } catch (error) {
        console.error("Error verifying account:", error);
        return Response.json({
            success: false,
            message: "Error verifying account"
        }, { status: 500 });
    }
}

