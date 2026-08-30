import type { APIRoute } from 'astro';
import { db } from '../../db';
import { messages } from '../../db/schema';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { name, email, message, urgency } = data;

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const id = crypto.randomUUID();

    await db.insert(messages).values({
      id,
      name,
      email,
      message,
      urgency: urgency || "0.5",
      status: "UNREAD"
    });

    if (process.env.RESEND_API_KEY) {
      const adminEmail = process.env.ADMIN_EMAILS || 'parasharayush71@gmail.com';
      await resend.emails.send({
        from: 'ayush.wav <onboarding@resend.dev>',
        to: adminEmail,
        replyTo: email,
        subject: `[ayush.wav] New Message from ${name}`,
        html: `
          <h2>New Message Received</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Urgency:</strong> ${urgency || "0.5"}</p>
          <hr />
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        `
      });
    } else {
      console.warn("RESEND_API_KEY not set. Email not sent.");
    }

    return new Response(JSON.stringify({ success: true, message: 'Message sent successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in contact API:', error);
    return new Response(JSON.stringify({ error: 'Failed to send message' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
