'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/Badge';
import { Check, X, Loader2, Mail, Send, Inbox } from 'lucide-react';

interface User {
  id: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
}

interface Message {
  id: string;
  content: string;
  status: string;
  createdAt: string;
  readAt: string | null;
  respondedAt: string | null;
  fromUserId: string;
  toUserId: string;
  fromUser?: User;
  toUser?: User;
}

export function MessagesPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [respondingTo, setRespondingTo] = useState<string | null>(null);

  const fetchMessages = async (type: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/messages?type=${type}`);

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      setMessages(data.messages || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(activeTab);
  }, [activeTab]);

  const handleRespond = async (messageId: string, action: 'accept' | 'decline') => {
    setRespondingTo(messageId);

    try {
      const response = await fetch(`/api/messages/${messageId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to respond to message');
      }

      // Remove from pending list
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));

      // Show success notification (you could use a toast here)
      if (action === 'accept') {
        alert('Message accepted! You can now chat with this user.');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to respond to message');
    } finally {
      setRespondingTo(null);
    }
  };

  const renderMessage = (message: Message, isPending: boolean) => {
    const otherUser = isPending ? message.fromUser : message.toUser || message.fromUser;
    if (!otherUser) return null;

    return (
      <Card key={message.id} className="mb-3">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex space-x-3 flex-1">
              <Avatar className="h-10 w-10">
                <AvatarImage src={otherUser.avatar || undefined} />
                <AvatarFallback>
                  {(otherUser.displayName || otherUser.username).substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <p className="font-semibold">
                    {otherUser.displayName || otherUser.username}
                  </p>
                  <p className="text-sm text-gray-500">@{otherUser.username}</p>
                  {message.status === 'PENDING' && (
                    <Badge variant="secondary" className="text-xs">Pending</Badge>
                  )}
                  {message.status === 'ACCEPTED' && (
                    <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                      Accepted
                    </Badge>
                  )}
                  {message.status === 'DECLINED' && (
                    <Badge variant="destructive" className="text-xs">Declined</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-800 mb-2">{message.content}</p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>

            {/* Action Buttons for Pending Messages */}
            {isPending && message.status === 'PENDING' && (
              <div className="flex space-x-2 ml-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRespond(message.id, 'accept')}
                  disabled={respondingTo === message.id}
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  {respondingTo === message.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Accept
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRespond(message.id, 'decline')}
                  disabled={respondingTo === message.id}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  <X className="h-4 w-4 mr-1" />
                  Decline
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const pendingCount = messages.filter((m) => m.status === 'PENDING').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mail className="h-5 w-5 mr-2" />
          Messages
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="relative">
              Pending
              {pendingCount > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="inbox">
              <Inbox className="h-4 w-4 mr-2" />
              Inbox
            </TabsTrigger>
            <TabsTrigger value="sent">
              <Send className="h-4 w-4 mr-2" />
              Sent
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => fetchMessages('pending')}>Try Again</Button>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Mail className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No pending message requests</p>
              </div>
            ) : (
              <div>
                {messages.map((msg) => renderMessage(msg, true))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="inbox" className="mt-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => fetchMessages('inbox')}>Try Again</Button>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Inbox className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No messages in your inbox</p>
              </div>
            ) : (
              <div>
                {messages.map((msg) => renderMessage(msg, false))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sent" className="mt-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => fetchMessages('sent')}>Try Again</Button>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Send className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>You haven't sent any messages yet</p>
              </div>
            ) : (
              <div>
                {messages.map((msg) => renderMessage(msg, false))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
