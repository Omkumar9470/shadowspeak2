'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios, { AxiosError } from 'axios';

// --- Helper Functions and Schemas (Replaces External Imports) ---

// Replicates useRouter and useParams from 'next/navigation'
const useRouter = () => ({
  replace: (path: string) => {
    if (typeof window !== 'undefined') {
      console.log(`Navigating to: ${path}`);
    }
  }
});

const useParams = <T extends object>(): T => {
  // In a real Next.js app, this would parse the URL. For this environment,
  // we can return a mock object. We'll assume the username is 'testuser'.
  return { username: 'testuser' } as T;
};


// Replicates verifySchema from '@/schemas/verifySchema'
const verifySchema = z.object({
  code: z.string().length(6, { message: 'Verification code must be 6 digits' }),
});

// Replicates ApiResponse type from '@/types/ApiResponse'
interface ApiResponse {
  message: string;
  success: boolean;
}

// --- Main Page Component ---

const VerifyAccount = () => {
  const router = useRouter();
  const params = useParams<{ username: string }>();

  // Mock useToast hook
  const useToast = () => ({
    toast: (options: { title: string, description: string, variant?: string }) => {
      alert(`${options.title}: ${options.description}`);
    }
  });
  const { toast } = useToast();

  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
  });

  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    try {
      // In a real app, this would be the actual API call
      // const response = await axios.post(`/api/verify-code`, {
      //   username: params.username,
      //   code: data.code,
      // });

      // --- MOCKING API CALL FOR THIS ENVIRONMENT ---
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockResponse = { data: { message: 'Account verified successfully!', success: true } };
      // --- END OF MOCK ---

      toast({
        title: "Success",
        description: mockResponse.data.message,
      });

      router.replace("/sign-in");

    } catch (error) {
      console.error("Error during account verification:", error);
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Verification Failed",
        description: axiosError.response?.data.message ?? 'An unexpected error occurred.',
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Verify Your Account
          </h1>
          <p className="mb-4">Enter the 6-digit verification code sent to your email.</p>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">Verification Code</label>
            <input
              id="code"
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              placeholder="123456"
              {...form.register('code')}
            />
            {form.formState.errors.code && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.code.message}
              </p>
            )}
          </div>
          <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyAccount;
