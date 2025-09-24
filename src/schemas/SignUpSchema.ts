import {email, z} from 'zod'

export const usernameValidation = z
    .string()
    .min(2, "Username must be atleast 2 characters")
    .max(20, "Usernaem must be smaller than 20 charecters")
    .regex(/^[a-zA-Z0-9_]+$/ ,"Username must not contain specail charecter")

export const signUpSchema = z.object({
    username: usernameValidation,
    email: z.string().email({message: 'Invalid email address'}),
    password: z.string().min(6, {message: "Password must be at least 6 charachters"})
})