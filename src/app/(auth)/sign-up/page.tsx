'use client'

import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios, { AxiosError } from "axios";

// --- Helper Functions and Schemas (Replaces External Imports) ---

// Replicates useDebounce from 'usehooks-ts'
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

// Replicates useRouter from 'next/navigation'
const useRouter = () => ({
  replace: (path: string) => {
    if (typeof window !== 'undefined') {
      console.log(`Navigating to: ${path}`);
      // In a real app, this changes the URL. Here we log it for demonstration.
    }
  }
});

// Replicates signUpSchema from '@/schemas/signUpSchema'
const signUpSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters"),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

// Replicates ApiResponse type from '@/types/ApiResponse'
interface ApiResponse {
  message: string;
  success: boolean;
}

// Mock Loader icon
const Loader2 = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);


// --- Main Page Component ---

const SignUpForm = () => {
  const [username, setUsername] = useState('');
  const [usernameMessage, setUsernameMessage] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const debouncedUsername = useDebounce(username, 300);

  const router = useRouter();
  
  // Mock useToast hook based on reference
  const useToast = () => ({
    toast: (options: { title: string, description: string, variant?: string }) => {
      alert(`${options.title}: ${options.description}`);
    }
  });
  const { toast } = useToast();

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (debouncedUsername) {
        setIsCheckingUsername(true);
        setUsernameMessage(''); // Reset message
        try {
          // Mocking the API call for demonstration in this environment
          await new Promise(resolve => setTimeout(resolve, 500));
          const response = { data: { message: 'Username is unique', success: true } }; // Mock success
          // In a real app, this would be:
          // const response = await axios.get<ApiResponse>(
          //   `/api/check-username-unique?username=${debouncedUsername}`
          // );
          setUsernameMessage(response.data.message);
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          setUsernameMessage(
            axiosError.response?.data.message ?? 'Error checking username'
          );
        } finally {
          setIsCheckingUsername(false);
        }
      }
    };
    checkUsernameUnique();
  }, [debouncedUsername]);

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true);
    try {
      // In a real app, this axios.post call would hit your backend API.
      // The backend would then handle user creation and sending the verification email.
      // const response = await axios.post<ApiResponse>('/api/sign-up', data);

      // --- MOCKING API CALL FOR THIS ENVIRONMENT ---
      await new Promise(resolve => setTimeout(resolve, 1000));
      // The backend would typically send back a message like this on success.
      const mockResponse = { data: { message: 'Successfully registered! A verification code has been sent to your email.', success: true } };
      // --- END OF MOCK ---

      toast({
        title: 'Success',
        description: mockResponse.data.message,
      });

      // Redirect to the page where the user can enter the verification code.
      router.replace(`/verify/${data.username}`);

    } catch (error) {
      console.error('Error during sign-up:', error);
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage = axiosError.response?.data.message ?? 'There was a problem with your sign-up. Please try again.';

      toast({
        title: 'Sign Up Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Join Mystery Message
          </h1>
          <p className="mb-4">Sign up to start your anonymous adventure</p>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Username Field */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input
                    placeholder="username"
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                    {...form.register("username")}
                    onChange={(e) => {
                        form.setValue("username", e.target.value);
                        setUsername(e.target.value);
                    }}
                />
                {isCheckingUsername && <Loader2 className="animate-spin mt-2" />}
                {!isCheckingUsername && usernameMessage && (
                    <p className={`text-sm mt-2 ${
                        usernameMessage === 'Username is unique'
                            ? 'text-green-500'
                            : 'text-red-500'
                    }`}>
                        {usernameMessage}
                    </p>
                )}
                {form.formState.errors.username && <p className="text-red-500 text-sm mt-1">{form.formState.errors.username.message}</p>}
            </div>

            {/* Email Field */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input 
                    placeholder="email"
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                    {...form.register("email")}
                />
                {form.formState.errors.email && <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>}
            </div>
            
            {/* Password Field */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input 
                    type="password"
                    placeholder="password"
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                    {...form.register("password")}
                />
                {form.formState.errors.password && <p className="text-red-500 text-sm mt-1">{form.formState.errors.password.message}</p>}
            </div>

            <button type="submit" className='w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400' disabled={isSubmitting}>
                {isSubmitting ? (
                    <div className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Please wait
                    </div>
                ) : (
                    'Sign Up'
                )}
            </button>
        </form>
        <div className="text-center mt-4">
          <p>
            Already a member?{' '}
            <a href="/sign-in" className="text-blue-600 hover:text-blue-800">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpForm;
