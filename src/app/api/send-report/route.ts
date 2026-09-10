import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { email, pdfBase64, reportId, reportType } = await request.json();

    if (!email || !pdfBase64) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("EMAIL_USER or EMAIL_PASS not set. Email won't be sent.");
      return NextResponse.json({ error: 'Email server is not configured correctly on the backend.' }, { status: 500 });
    }

    // Convert base64 data URI to buffer
    const base64Data = pdfBase64.split('base64,')[1] || pdfBase64;
    const pdfBuffer = Buffer.from(base64Data, 'base64');

    // Create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send the email
    const info = await transporter.sendMail({
      from: `"AgriCrate Reports" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Your AgriCrate Field Report: ${reportType}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">AgriCrate Intelligence</h2>
          <p>Hello,</p>
          <p>Your requested <strong>${reportType}</strong> field report is attached to this email as a PDF.</p>
          <p>Report ID: ${reportId}</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666;">
            Thank you for using AgriCrate. If you have any questions, please reply to this email.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `AgriCrate-Report-${reportId}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error: any) {
    console.error('Server Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
