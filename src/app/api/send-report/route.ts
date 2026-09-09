import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');

export async function POST(request: Request) {
  try {
    const { email, pdfBase64, reportId, reportType } = await request.json();

    if (!email || !pdfBase64) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Convert base64 data URI to buffer
    const base64Data = pdfBase64.split('base64,')[1] || pdfBase64;
    const pdfBuffer = Buffer.from(base64Data, 'base64');

    // Send the email
    const { data, error } = await resend.emails.send({
      from: 'AgriSetu Reports <reports@agrisetu.com>', // Or a verified domain you own
      to: [email],
      subject: `Your AgriSetu Field Report: ${reportType}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">AgriSetu Intelligence</h2>
          <p>Hello,</p>
          <p>Your requested <strong>${reportType}</strong> field report is attached to this email as a PDF.</p>
          <p>Report ID: ${reportId}</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666;">
            Thank you for using AgriSetu. If you have any questions, please reply to this email.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `AgriSetu-Report-${reportId}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    if (error) {
      console.error('Resend API Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Server Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
