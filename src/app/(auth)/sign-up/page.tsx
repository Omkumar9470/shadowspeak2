'use client';

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios, { AxiosError } from "axios";
import { signUpSchema } from "@/schemas/SignUpSchema";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ApiResponse } from "@/types/ApiResponse";

const SignUpForm = () => {
  const [username, setUsername] = useState('');
  const [usernameMessage, setUsernameMessage] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  // Check username uniqueness when user stops typing
  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (username.length < 2) {
        setUsernameMessage('');
        return;
      }

      setIsCheckingUsername(true);
      try {
        const response = await axios.get(`/api/check-username-unique?username=${encodeURIComponent(username)}`);
        setUsernameMessage(response.data.message);
      } catch (error: any) {
        if (axios.isAxiosError(error)) {
          setUsernameMessage(error.response?.data.message || 'Error checking username');
        }
      } finally {
        setIsCheckingUsername(false);
      }
    };

    // Debounce the API call
    const timeoutId = setTimeout(() => {
      if (username) {
        checkUsernameUnique();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username]);

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>('/api/sign-up', data);
      
      // Fixed toast format
      toast.success(response.data.message);
  
      router.replace(`/verify/${data.username}`);
    } catch (error) {
      console.error('Error during sign-up:', error);
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage = axiosError.response?.data.message ?? 'There was a problem with your sign-up. Please try again.';
  
      // Fixed error toast format
      toast.error(errorMessage);
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
                {isCheckingUsername && (
                  <div className="flex items-center mt-2 text-gray-500">
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Checking username...
                  </div>
                )}
                {!isCheckingUsername && usernameMessage && (
                    <p className={`text-sm mt-2 ${
                        usernameMessage === 'Username is available' 
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
