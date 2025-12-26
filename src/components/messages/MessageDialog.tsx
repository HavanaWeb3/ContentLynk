'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';

interface MessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string | null;
  recipientUsername: string;
}

export function MessageDialog({
  isOpen,
  onClose,
  recipientId,
  recipientName,
  recipientAvatar,
  recipientUsername,
}: MessageDialogProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus textarea when dialog opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      // Small delay to ensure dialog is fully rendered
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toUserId: recipientId,
          content: message.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send message');
      }

      setSuccess(true);
      setMessage('');

      // Close dialog after showing success
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    if (!isSending) {
      setMessage('');
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose} modal={true}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Message</DialogTitle>
          <DialogDescription>
            Send a private message to this creator. They can accept or decline your message request.
          </DialogDescription>
        </DialogHeader>

        {/* Recipient Info */}
        <div className="flex items-center space-x-3 py-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={recipientAvatar || undefined} />
            <AvatarFallback>
              {recipientName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{recipientName}</p>
            <p className="text-sm text-gray-500">@{recipientUsername}</p>
          </div>
        </div>

        {/* Message Input */}
        <div className="space-y-4">
          <textarea
            onChange={(e) => {
              console.log('Input received:', e.target.value);
              setMessage(e.target.value);
            }}
            value={message}
            placeholder="TEST - Can you type here?"
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '12px',
              border: '2px solid red',
              zIndex: 9999,
              position: 'relative'
            }}
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>{message.length}/1000 characters</span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
              Message sent successfully! The recipient will be notified.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSending || success}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={isSending || success || !message.trim()}
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Sending...
              </>
            ) : (
              'Send Message'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
