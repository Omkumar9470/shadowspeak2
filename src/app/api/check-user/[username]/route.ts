import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user";

// Use the correct type definition for App Router route handlers
export async function GET(
  request: NextRequest,
  context: { params: { username: string } }
) {
  await dbConnect();

  try {
    const username = context.params.username;

    // Find the user by username
    const user = await UserModel.findOne({ 
      username, 
      isVerified: true 
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // Return only necessary user data
    return NextResponse.json(
      {
        success: true,
        user: {
          username: user.username,
          isAcceptingMessage: user.isAcceptingMessage,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking user:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to check user",
      },
      { status: 500 }
    );
  }
}