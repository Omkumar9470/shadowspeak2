import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

export async function GET() {
  await dbConnect();

  try {
    // Get the current user session
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // Get the user's email from the session
    const userEmail = session.user.email;

    // Find the user in the database
    const user = await UserModel.findOne({ email: userEmail });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // Return the user's messages
    return Response.json(
      {
        success: true,
        messages: user.message || [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching messages:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to fetch messages",
      },
      { status: 500 }
    );
  }
}