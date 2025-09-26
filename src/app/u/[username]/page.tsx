'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, Send } from 'lucide-react';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';
import { ApiResponse } from '@/types/ApiResponse';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define schema for message form
const messageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(500, 'Message too long (max 500 characters)')
});

const UserProfilePage = () => {
  const params = useParams<{ username: string }>();
  const [isSending, setIsSending] = useState(false);
  const [messageStatus, setMessageStatus] = useState<'idle' | 'success' | 'user-not-found' | 'not-accepting'>('idle');
  const username = params.username as string;

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    setIsSending(true);
    try {
      const response = await axios.post<ApiResponse>('/api/send-messages', {
        username: username,
        content: data.content,
      });
      
      toast.success(response.data.message || 'Message sent successfully');
      setMessageStatus('success');
      form.reset();
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      
      if (axiosError.response?.status === 404) {
        setMessageStatus('user-not-found');
        toast.error('User not found');
      } else if (axiosError.response?.status === 403) {
        setMessageStatus('not-accepting');
        toast.error('This user is not accepting messages');
      } else {
        toast.error(axiosError.response?.data.message || 'Failed to send message');
      }
    } finally {
      setIsSending(false);
    }
  };

  // If we've tried to send a message and the user doesn't exist
  if (messageStatus === 'user-not-found') {
    return (
      <div className="flex-grow my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
        <h1 className="text-4xl font-bold mb-4">User Not Found</h1>
        <p className="text-gray-600">The user you're looking for doesn't exist or isn't verified.</p>
      </div>
    );
  }

  // If we've tried to send a message and the user isn't accepting messages
  if (messageStatus === 'not-accepting') {
    return (
      <main className="flex-grow my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
        <h1 className="text-4xl font-bold mb-4">Send Anonymous Message</h1>
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">To: {username}</h2>
        </div>
        
        <div className="p-6 bg-gray-100 rounded-md">
          <p className="text-center text-gray-600">
            This user is not currently accepting messages.
          </p>
        </div>
        
        <Separator className="my-8" />
        
        <div className="text-center text-sm text-gray-500">
          <p>Messages sent through this platform are anonymous.</p>
          <p className="mt-2">Be kind and respectful. Abusive messages may be reported.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-grow my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">Send Anonymous Message</h1>
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">To: {username}</h2>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Your Message
          </label>
          <textarea
            id="message"
            className="w-full p-3 border border-gray-300 rounded-md min-h-[150px]"
            placeholder="Type your anonymous message here..."
            {...form.register('content')}
          />
          {form.formState.errors.content && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.content.message}</p>
          )}
        </div>
        <Button type="submit" disabled={isSending} className="flex items-center">
          {isSending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send Message
            </>
          )}
        </Button>
      </form>
      
      {messageStatus === 'success' && (
        <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-md">
          Message sent successfully!
        </div>
      )}
      
      <Separator className="my-8" />
      
      <div className="text-center text-sm text-gray-500">
        <p>Messages sent through this platform are anonymous.</p>
        <p className="mt-2">Be kind and respectful. Abusive messages may be reported.</p>
      </div>
    </main>
  );
};

export default UserProfilePage;
