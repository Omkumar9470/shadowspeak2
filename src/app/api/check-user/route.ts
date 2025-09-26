import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user";

export async function GET(request: NextRequest) {
  await dbConnect();

  try {
    // Get username from query parameter
    const url = new URL(request.url);
    const username = url.searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        {
          success: false,
          message: "Username is required",
        },
        { status: 400 }
      );
    }

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