import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

// Initialize SES client
const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const FROM_EMAIL = process.env.SES_FROM_EMAIL || 'info@sentimentAI.tech';
const TO_EMAIL = process.env.SES_TO_EMAIL || 'sentimentAI1@outlook.com';

interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  message: string;
}

/**
 * Sends the contact form submission to the business email
 */
export async function sendContactSubmission(data: ContactFormData): Promise<void> {
  const { name, email, company, message } = data;

  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #fb923c 0%, #3b82f6 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .field { margin-bottom: 20px; }
          .label { font-weight: bold; color: #374151; margin-bottom: 5px; }
          .value { background: white; padding: 10px; border-radius: 5px; border-left: 3px solid #fb923c; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">New Contact Form Submission</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">SentimentAI - Contact Request</p>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">Name:</div>
              <div class="value">${name}</div>
            </div>
            <div class="field">
              <div class="label">Email:</div>
              <div class="value"><a href="mailto:${email}">${email}</a></div>
            </div>
            ${company ? `
            <div class="field">
              <div class="label">Company:</div>
              <div class="value">${company}</div>
            </div>
            ` : ''}
            <div class="field">
              <div class="label">Message:</div>
              <div class="value">${message.replace(/\n/g, '<br>')}</div>
            </div>
            <div class="footer">
              <p>This email was sent from the SentimentAI contact form</p>
              <p>Reply directly to this email to respond to ${name}</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const params = {
    Source: FROM_EMAIL,
    Destination: {
      ToAddresses: [TO_EMAIL],
    },
    Message: {
      Subject: {
        Data: `New Contact from ${name} - SentimentAI`,
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: htmlBody,
          Charset: 'UTF-8',
        },
        Text: {
          Data: `New Contact Form Submission\n\nName: ${name}\nEmail: ${email}\nCompany: ${company || 'N/A'}\n\nMessage:\n${message}`,
          Charset: 'UTF-8',
        },
      },
    },
    ReplyToAddresses: [email],
  };

  try {
    const command = new SendEmailCommand(params);
    await sesClient.send(command);
    console.log(`✅ Contact submission email sent to ${TO_EMAIL}`);
  } catch (error) {
    console.error('❌ Error sending contact submission email:', error);
    throw new Error('Failed to send contact submission email');
  }
}

/**
 * Sends an automated acknowledgment email to the user
 */
export async function sendAutoResponse(data: ContactFormData): Promise<void> {
  const { name, email } = data;

  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #fb923c 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .logo { font-size: 32px; font-weight: bold; margin: 0; }
          .message { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #fb923c; }
          .cta { background: linear-gradient(135deg, #fb923c 0%, #f97316 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">SentimentAI</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for reaching out!</p>
          </div>
          <div class="content">
            <p style="font-size: 18px; margin-top: 0;">Hi ${name},</p>

            <div class="message">
              <p><strong>We've received your message!</strong></p>
              <p>Thank you for your interest in SentimentAI. Our team has been notified and we'll review your inquiry carefully.</p>
            </div>

            <p><strong>What happens next?</strong></p>
            <ul style="color: #374151;">
              <li>Our team will review your message within 1-3 business days</li>
              <li>A member of our team will reach out to you directly at <strong>${email}</strong></li>
              <li>We'll discuss how SentimentAI can help transform your customer service</li>
            </ul>

            <p>In the meantime, feel free to explore our platform or reach out if you have any urgent questions.</p>

            <a href="mailto:${TO_EMAIL}" class="cta">Contact Us Directly</a>

            <div class="footer">
              <p><strong>SentimentAI</strong></p>
              <p>Transform Customer Service with AI</p>
              <p>Real-time sentiment analysis powered by advanced AI</p>
              <p style="margin-top: 15px;">
                <a href="mailto:${TO_EMAIL}" style="color: #fb923c; text-decoration: none;">${TO_EMAIL}</a>
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const params = {
    Source: FROM_EMAIL,
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Subject: {
        Data: 'Thank you for contacting SentimentAI',
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: htmlBody,
          Charset: 'UTF-8',
        },
        Text: {
          Data: `Hi ${name},\n\nWe've received your message!\n\nThank you for your interest in SentimentAI. Our team has been notified and we'll review your inquiry carefully.\n\nWhat happens next?\n- Our team will review your message within 1-3 business days\n- A member of our team will reach out to you directly at ${email}\n- We'll discuss how SentimentAI can help transform your customer service\n\nBest regards,\nThe SentimentAI Team\n\n${TO_EMAIL}`,
          Charset: 'UTF-8',
        },
      },
    },
  };

  try {
    const command = new SendEmailCommand(params);
    await sesClient.send(command);
    console.log(`✅ Auto-response email sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending auto-response email:', error);
    throw new Error('Failed to send auto-response email');
  }
}
