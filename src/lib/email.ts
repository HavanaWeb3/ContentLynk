/**
 * Email Service using Resend
 * Wrapper for sending transactional emails
 */

import { Resend } from 'resend';

// Lazy-initialize Resend to avoid build-time errors
let resend: Resend | null = null;

function getResendClient(): Resend {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend!;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('[Email] RESEND_API_KEY not configured');
      // In development, log the email instead
      if (process.env.NODE_ENV === 'development') {
        console.log('[Email] Development mode - Email would be sent:');
        console.log('To:', options.to);
        console.log('Subject:', options.subject);
        console.log('Text:', options.text || options.html);
        return { success: true, messageId: 'dev-mode' };
      }
      return { success: false, error: 'Email service not configured' };
    }

    const client = getResendClient();
    const { data, error } = await client.emails.send({
      from: process.env.EMAIL_FROM || 'hello@contentlynk.com',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (error) {
      console.error('[Email] Send error:', error);
      return { success: false, error: error.message };
    }

    console.log('[Email] Sent successfully:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('[Email] Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
