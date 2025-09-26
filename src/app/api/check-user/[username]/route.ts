import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user";

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  await dbConnect();

  try {
    // Fix: Await the params object before destructuring
    const username = params.username;

    // Find the user by username
    const user = await UserModel.findOne({ 
      username, 
      isVerified: true 
    });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // Return only necessary user data
    return Response.json(
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
    return Response.json(
      {
        success: false,
        message: "Failed to check user",
      },
      { status: 500 }
    );
  }
}