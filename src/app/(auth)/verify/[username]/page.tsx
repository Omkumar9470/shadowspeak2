'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { verifySchema } from '@/schemas/VerifySchema';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';

const VerifyAccount = () => {
  const router = useRouter();
  const params = useParams<{ username: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    setIsSubmitting(true);
    try {
      // Call the API to verify the code
      const response = await axios.post('/api/verify-code', {
        username: params.username,
        code: data.code,
      });

      // Show success message with alert
      alert("Verification successful");
      
      // Also show toast message
      toast.success(response.data.message);
      
      // Redirect to sign-in page
      router.replace('/sign-in');
    } catch (error) {
      console.error("Error during account verification:", error);
      const axiosError = error as AxiosError<{ message: string, success: boolean }>;
      
      // Show error message with alert
      if (axiosError.response?.data.message === "Verification code does not match") {
        alert("Wrong verification code");
      } else {
        alert(axiosError.response?.data.message ?? 'An unexpected error occurred.');
      }
      
      // Also show toast error
      toast.error(axiosError.response?.data.message ?? 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
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
          <button 
            type="submit" 
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </div>
            ) : (
              'Submit'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyAccount;
