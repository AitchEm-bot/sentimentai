import { Router, Request, Response } from 'express';
import { sendContactSubmission, sendAutoResponse } from '../services/email';

const router = Router();

interface ContactRequest {
  name: string;
  email: string;
  company?: string;
  message: string;
}

/**
 * POST /api/contact
 * Handles contact form submissions and sends emails
 */
router.post('/contact', async (req: Request, res: Response) => {
  try {
    const { name, email, company, message }: ContactRequest = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, email, and message are required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
    }

    // Prepare contact data
    const contactData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      company: company?.trim(),
      message: message.trim(),
    };

    console.log(`📧 Processing contact form submission from ${contactData.email}`);

    // Send emails sequentially to respect AWS SES rate limit (1 email/second in sandbox)
    await sendContactSubmission(contactData);

    // Wait 1.5 seconds between emails to respect SES rate limit
    await new Promise(resolve => setTimeout(resolve, 1500));

    await sendAutoResponse(contactData);

    console.log(`✅ Successfully processed contact form from ${contactData.email}`);

    return res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully. We\'ll get back to you within 1-3 business days.',
    });
  } catch (error) {
    console.error('❌ Error processing contact form:', error);

    return res.status(500).json({
      success: false,
      error: 'Failed to send email. Please try again later or contact us directly.',
    });
  }
});

export default router;
