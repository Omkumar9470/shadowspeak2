import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user";

import { Message } from "@/model/user";


export async function POST(request: Request){
    await dbConnect()

    const {username, content} = await request.json()
    try {
        const user = await UserModel.findOne({username})
        if (!user){
            return Response.json(
                {
                    success: false,
                    message: "User not found"
                },
                {status: 404}
            )
        }

        // is user accepting messages
        if (!user.isAcceptingMessage){
            return Response.json(
                {
                    success: false,
                    message: "User is not accepting the messages"
                },
                {status: 403}
            )
        }

        const newMessage = {content, createdAt: new Date()}
        user.message.push(newMessage as unknown as Message)
        await user.save()

        return Response.json(
                {
                    success: true,
                    message: "Message sent sucessfully"
                },
                {status: 200}
            )

    } catch (error) {
        console.log("Error sending messages ", error)
        return Response.json(
            {
                success: false,
                message: "Internal server error"
            },
            {status: 500}
        )
    }
}