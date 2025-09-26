'use client'

import MessageCard from "@/components/MessageCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Message } from "@/model/user";
import { acceptMessageSchema } from "@/schemas/AcceptMessageSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from "@/components/ui/separator";
import axios, { AxiosError } from 'axios';
import { Loader2, RefreshCcw } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from 'sonner';

const page = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSwitchLoading, setIsSwitchLoading] = useState<boolean>(false)
  const { data: session } = useSession();
  
  const form = useForm({
    resolver: zodResolver(acceptMessageSchema),
    defaultValues: {
      acceptMessage: false,
    },
  });

  const {register, watch, setValue} = form;
  const acceptMessage = watch('acceptMessage');

  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter(message => message._id !== messageId))
  }

  const fetchAcceptMessage = useCallback(async () => {
    setIsSwitchLoading(true)
    try {
      const response = await axios.get<ApiResponse>('/api/accept-messages')
      // Fix: Use isAcceptingMessage instead of isAcceptingMessages
      setValue('acceptMessage', response.data.isAcceptingMessages ?? false)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message || 'Failed to fetch message settings')
    } finally {
      setIsSwitchLoading(false)
    }
  },[setValue])

  const fetchMessages = useCallback(async (refresh: boolean = false) => {
    setIsLoading(true)
    setIsSwitchLoading(false);
    try {
      const response = await axios.get<ApiResponse>('/api/get-messages');
      setMessages(response.data.messages || [])
      if(refresh){
        toast.success("Refreshed Messages", {
          description: "Showing latest messages",
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message ?? 'Failed to fetch messages setting');
    } finally {
      setIsLoading(false);
      setIsSwitchLoading(false);  
    }
  },[setIsLoading, setMessages]);

  useEffect(() => {
    if (!session || !session.user) return;
    fetchAcceptMessage();
    fetchMessages();
  },[session, fetchAcceptMessage, fetchMessages]);
  
  // handle switch change 
  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>('/api/accept-messages', {
        acceptMessage: !acceptMessage
      })
      setValue('acceptMessage', !acceptMessage);
      toast.success(response.data.message, {
        description: `Messages are now ${!acceptMessage ? 'ON' : 'OFF'}`
      });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message ?? 'Failed to update message settings');
    }
  }

  if (!session || !session.user) {
    return <div>Please Login</div>;
  }

  const { username } = session.user;
  const baseUrl = `${window.location.protocol}//${window.location.host}`
  const profileUrl = `${baseUrl}/u/${username}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl)
    toast.success('URL copied', {
      description: 'Profile URL copied to clipboard',
    });
  }

  return (
    <main className="flex-grow my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy your unique link</h2>{' '}
        <div className="flex items-center">
          <Input value={profileUrl} readOnly className="w-full p-2 mr-2" />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>

      <div className="mb-4">
        <Switch {...register('acceptMessage')}
        checked={acceptMessage}
        onCheckedChange= {handleSwitchChange}
        disabled= {isSwitchLoading} />
        <span className="ml-2">
          Accept Messages: {acceptMessage ? 'ON' : 'OFF'}
        </span>
      </div>
      <Separator/>

      <Button className="mt-4" 
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchMessages(true);
        }}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin"/>
          ) : (
            <RefreshCcw className="h-4 w-4"/>
          )}
      </Button>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          {messages.length > 0 ? (
            messages.map((message, index) =>(
              <MessageCard key={message._id as string}
              message = {message}
              onMessageDelete = {handleDeleteMessage}
              />
            ))
          ):(
            <p>No messages to display.</p>
          )}
      </div>
    </main>
  );
}

export default page;