import EmailTemplate from "@components/email-template";
import { Resend } from "resend";

const { RESEND_API_KEY, MY_EMAIL } = process.env;

if (!RESEND_API_KEY || !MY_EMAIL) {
  throw new Error("Missing email environment variables");
}

const resend = new Resend(RESEND_API_KEY);

const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();

    if (!email || !message) {
      return Response.json(
        { error: "Missing email or message" },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return Response.json(
        { error: `Invalid email received: ${email}` },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: "AskPDF <onboarding@resend.dev>",
      to: MY_EMAIL!,
      replyTo: email,
      subject: `New message from ${name ?? email}`,
      react: EmailTemplate({ name, email, message }),
    });

    if (error) {
      console.error(error);
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error }, { status: 500 });
  }
}
