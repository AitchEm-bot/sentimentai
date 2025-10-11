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
  locale: string;
}

/**
 * Sends the contact form submission to the business email
 */
export async function sendContactSubmission(data: ContactFormData): Promise<void> {
  const { name, email, company, message, locale } = data;

  const isArabic = locale === 'ar';

  const translations = {
    en: {
      title: 'New Contact Form Submission',
      subtitle: 'SentimentAI - Contact Request',
      nameLabel: 'Name:',
      emailLabel: 'Email:',
      companyLabel: 'Company:',
      messageLabel: 'Message:',
      footerText1: 'This email was sent from the SentimentAI contact form',
      footerText2: `Reply directly to this email to respond to ${name}`,
      subject: `New Contact from ${name} - SentimentAI`,
      textBody: `New Contact Form Submission\n\nName: ${name}\nEmail: ${email}\nCompany: ${company || 'N/A'}\n\nMessage:\n${message}`,
    },
    ar: {
      title: 'طلب تواصل جديد من النموذج',
      subtitle: 'SentimentAI - طلب تواصل',
      nameLabel: 'الاسم:',
      emailLabel: 'البريد الإلكتروني:',
      companyLabel: 'الشركة:',
      messageLabel: 'الرسالة:',
      footerText1: 'تم إرسال هذا البريد من نموذج التواصل في SentimentAI',
      footerText2: `رد مباشرة على هذا البريد للرد على ${name}`,
      subject: `طلب تواصل جديد من ${name} - SentimentAI`,
      textBody: `طلب تواصل جديد من النموذج\n\nالاسم: ${name}\nالبريد الإلكتروني: ${email}\nالشركة: ${company || 'غير محدد'}\n\nالرسالة:\n${message}`,
    },
  };

  const t = translations[isArabic ? 'ar' : 'en'];

  const htmlBody = `
    <!DOCTYPE html>
    <html dir="${isArabic ? 'rtl' : 'ltr'}" lang="${locale}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { direction: ${isArabic ? 'rtl' : 'ltr'}; }
          body {
            font-family: ${isArabic ? "'IBM Plex Sans Arabic', " : ""}Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            direction: ${isArabic ? 'rtl' : 'ltr'};
            text-align: ${isArabic ? 'right' : 'left'};
          }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; direction: ${isArabic ? 'rtl' : 'ltr'}; }
          .header {
            background: linear-gradient(135deg, #fb923c 0%, #3b82f6 100%);
            color: white;
            padding: 30px;
            border-radius: 10px 10px 0 0;
            direction: ${isArabic ? 'rtl' : 'ltr'};
            text-align: ${isArabic ? 'right' : 'left'};
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border-radius: 0 0 10px 10px;
            direction: ${isArabic ? 'rtl' : 'ltr'};
            text-align: ${isArabic ? 'right' : 'left'};
          }
          .field {
            margin-bottom: 20px;
            direction: ${isArabic ? 'rtl' : 'ltr'};
            text-align: ${isArabic ? 'right' : 'left'};
          }
          .label {
            font-weight: bold;
            color: #374151;
            margin-bottom: 5px;
            direction: ${isArabic ? 'rtl' : 'ltr'};
            text-align: ${isArabic ? 'right' : 'left'};
          }
          .value {
            background: white;
            padding: 10px;
            border-radius: 5px;
            border-${isArabic ? 'right' : 'left'}: 3px solid #fb923c;
            direction: ${isArabic ? 'rtl' : 'ltr'};
            text-align: ${isArabic ? 'right' : 'left'};
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #6b7280;
            font-size: 12px;
            direction: ${isArabic ? 'rtl' : 'ltr'};
          }
          h1, h2, h3, p, div, span { direction: ${isArabic ? 'rtl' : 'ltr'}; }
        </style>
      </head>
      <body dir="${isArabic ? 'rtl' : 'ltr'}">
        <div class="container" dir="${isArabic ? 'rtl' : 'ltr'}">
          <div class="header" dir="${isArabic ? 'rtl' : 'ltr'}">
            <h1 style="margin: 0; direction: ${isArabic ? 'rtl' : 'ltr'}; text-align: ${isArabic ? 'right' : 'left'};">${t.title}</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9; direction: ${isArabic ? 'rtl' : 'ltr'}; text-align: ${isArabic ? 'right' : 'left'};">${t.subtitle}</p>
          </div>
          <div class="content" dir="${isArabic ? 'rtl' : 'ltr'}">
            <div class="field" dir="${isArabic ? 'rtl' : 'ltr'}">
              <div class="label" dir="${isArabic ? 'rtl' : 'ltr'}">${t.nameLabel}</div>
              <div class="value" dir="${isArabic ? 'rtl' : 'ltr'}">${name}</div>
            </div>
            <div class="field" dir="${isArabic ? 'rtl' : 'ltr'}">
              <div class="label" dir="${isArabic ? 'rtl' : 'ltr'}">${t.emailLabel}</div>
              <div class="value" dir="ltr" style="text-align: left;"><a href="mailto:${email}">${email}</a></div>
            </div>
            ${company ? `
            <div class="field" dir="${isArabic ? 'rtl' : 'ltr'}">
              <div class="label" dir="${isArabic ? 'rtl' : 'ltr'}">${t.companyLabel}</div>
              <div class="value" dir="${isArabic ? 'rtl' : 'ltr'}">${company}</div>
            </div>
            ` : ''}
            <div class="field" dir="${isArabic ? 'rtl' : 'ltr'}">
              <div class="label" dir="${isArabic ? 'rtl' : 'ltr'}">${t.messageLabel}</div>
              <div class="value" dir="${isArabic ? 'rtl' : 'ltr'}">${message.replace(/\n/g, '<br>')}</div>
            </div>
            <div class="footer" dir="${isArabic ? 'rtl' : 'ltr'}">
              <p dir="${isArabic ? 'rtl' : 'ltr'}">${t.footerText1}</p>
              <p dir="${isArabic ? 'rtl' : 'ltr'}">${t.footerText2}</p>
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
        Data: t.subject,
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: htmlBody,
          Charset: 'UTF-8',
        },
        Text: {
          Data: t.textBody,
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
  const { name, email, locale } = data;

  const isArabic = locale === 'ar';

  const translations = {
    en: {
      headerSubtitle: 'Thank you for reaching out!',
      greeting: `Hi ${name},`,
      messageTitle: "We've received your message!",
      messageBody: "Thank you for your interest in SentimentAI. Our team has been notified and we'll review your inquiry carefully.",
      nextStepsTitle: 'What happens next?',
      step1: 'Our team will review your message within 1-3 business days',
      step2: `A member of our team will reach out to you directly at <strong>${email}</strong>`,
      step3: "We'll discuss how SentimentAI can help transform your customer service",
      closingText: 'In the meantime, feel free to explore our platform or reach out if you have any urgent questions.',
      ctaButton: 'Contact Us Directly',
      footerTagline1: 'Transform Customer Service with AI',
      footerTagline2: 'Real-time sentiment analysis powered by advanced AI',
      subject: 'Thank you for contacting SentimentAI',
      textBody: `Hi ${name},\n\nWe've received your message!\n\nThank you for your interest in SentimentAI. Our team has been notified and we'll review your inquiry carefully.\n\nWhat happens next?\n- Our team will review your message within 1-3 business days\n- A member of our team will reach out to you directly at ${email}\n- We'll discuss how SentimentAI can help transform your customer service\n\nBest regards,\nThe SentimentAI Team\n\n${TO_EMAIL}`,
    },
    ar: {
      headerSubtitle: 'شكراً لتواصلك معنا!',
      greeting: `مرحباً ${name}،`,
      messageTitle: 'لقد استلمنا رسالتك!',
      messageBody: 'شكراً لاهتمامك بـ SentimentAI. تم إشعار فريقنا وسنراجع استفسارك بعناية.',
      nextStepsTitle: 'ما الخطوات التالية؟',
      step1: 'سيقوم فريقنا بمراجعة رسالتك خلال 1-3 أيام عمل',
      step2: `سيتواصل معك أحد أعضاء فريقنا مباشرة على <strong>${email}</strong>`,
      step3: 'سنناقش كيف يمكن لـ SentimentAI المساعدة في تحويل خدمة العملاء لديك',
      closingText: 'في هذه الأثناء، لا تتردد في استكشاف منصتنا أو التواصل معنا إذا كان لديك أي أسئلة عاجلة.',
      ctaButton: 'تواصل معنا مباشرة',
      footerTagline1: 'حوّل خدمة العملاء بالذكاء الاصطناعي',
      footerTagline2: 'تحليل المشاعر في الوقت الفعلي مدعوم بالذكاء الاصطناعي المتقدم',
      subject: 'شكراً لتواصلك مع SentimentAI',
      textBody: `مرحباً ${name}،\n\nلقد استلمنا رسالتك!\n\nشكراً لاهتمامك بـ SentimentAI. تم إشعار فريقنا وسنراجع استفسارك بعناية.\n\nما الخطوات التالية؟\n- سيقوم فريقنا بمراجعة رسالتك خلال 1-3 أيام عمل\n- سيتواصل معك أحد أعضاء فريقنا مباشرة على ${email}\n- سنناقش كيف يمكن لـ SentimentAI المساعدة في تحويل خدمة العملاء لديك\n\nأطيب التحيات،\nفريق SentimentAI\n\n${TO_EMAIL}`,
    },
  };

  const t = translations[isArabic ? 'ar' : 'en'];

  const htmlBody = `
    <!DOCTYPE html>
    <html dir="${isArabic ? 'rtl' : 'ltr'}" lang="${locale}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { direction: ${isArabic ? 'rtl' : 'ltr'}; }
          body {
            font-family: ${isArabic ? "'IBM Plex Sans Arabic', " : ""}Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            direction: ${isArabic ? 'rtl' : 'ltr'};
            text-align: ${isArabic ? 'right' : 'left'};
          }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; direction: ${isArabic ? 'rtl' : 'ltr'}; }
          .header {
            background: linear-gradient(135deg, #fb923c 0%, #3b82f6 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
            direction: ${isArabic ? 'rtl' : 'ltr'};
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border-radius: 0 0 10px 10px;
            direction: ${isArabic ? 'rtl' : 'ltr'};
            text-align: ${isArabic ? 'right' : 'left'};
          }
          .logo { font-size: 32px; font-weight: bold; margin: 0; direction: ${isArabic ? 'rtl' : 'ltr'}; }
          .message {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-${isArabic ? 'right' : 'left'}: 4px solid #fb923c;
            direction: ${isArabic ? 'rtl' : 'ltr'};
            text-align: ${isArabic ? 'right' : 'left'};
          }
          .cta {
            background: linear-gradient(135deg, #fb923c 0%, #f97316 100%);
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            display: inline-block;
            margin: 20px 0;
            direction: ${isArabic ? 'rtl' : 'ltr'};
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 12px;
            direction: ${isArabic ? 'rtl' : 'ltr'};
          }
          ul {
            direction: ${isArabic ? 'rtl' : 'ltr'};
            text-align: ${isArabic ? 'right' : 'left'};
            list-style-position: ${isArabic ? 'inside' : 'outside'};
            padding-${isArabic ? 'right' : 'left'}: 20px;
          }
          li {
            direction: ${isArabic ? 'rtl' : 'ltr'};
            text-align: ${isArabic ? 'right' : 'left'};
            margin-bottom: 8px;
          }
          h1, h2, h3, p, div, span { direction: ${isArabic ? 'rtl' : 'ltr'}; }
        </style>
      </head>
      <body dir="${isArabic ? 'rtl' : 'ltr'}">
        <div class="container" dir="${isArabic ? 'rtl' : 'ltr'}">
          <div class="header" dir="${isArabic ? 'rtl' : 'ltr'}">
            <h1 class="logo" dir="${isArabic ? 'rtl' : 'ltr'}">SentimentAI</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9; direction: ${isArabic ? 'rtl' : 'ltr'};">${t.headerSubtitle}</p>
          </div>
          <div class="content" dir="${isArabic ? 'rtl' : 'ltr'}">
            <p style="font-size: 18px; margin-top: 0; direction: ${isArabic ? 'rtl' : 'ltr'}; text-align: ${isArabic ? 'right' : 'left'};">${t.greeting}</p>

            <div class="message" dir="${isArabic ? 'rtl' : 'ltr'}">
              <p dir="${isArabic ? 'rtl' : 'ltr'}"><strong>${t.messageTitle}</strong></p>
              <p dir="${isArabic ? 'rtl' : 'ltr'}">${t.messageBody}</p>
            </div>

            <p style="direction: ${isArabic ? 'rtl' : 'ltr'}; text-align: ${isArabic ? 'right' : 'left'};"><strong>${t.nextStepsTitle}</strong></p>
            <ul style="color: #374151; direction: ${isArabic ? 'rtl' : 'ltr'}; text-align: ${isArabic ? 'right' : 'left'};">
              <li dir="${isArabic ? 'rtl' : 'ltr'}">${t.step1}</li>
              <li dir="${isArabic ? 'rtl' : 'ltr'}">${t.step2}</li>
              <li dir="${isArabic ? 'rtl' : 'ltr'}">${t.step3}</li>
            </ul>

            <p style="direction: ${isArabic ? 'rtl' : 'ltr'}; text-align: ${isArabic ? 'right' : 'left'};">${t.closingText}</p>

            <div style="text-align: center;">
              <a href="mailto:${TO_EMAIL}" class="cta" dir="${isArabic ? 'rtl' : 'ltr'}">${t.ctaButton}</a>
            </div>

            <div class="footer" dir="${isArabic ? 'rtl' : 'ltr'}">
              <p dir="${isArabic ? 'rtl' : 'ltr'}"><strong>SentimentAI</strong></p>
              <p dir="${isArabic ? 'rtl' : 'ltr'}">${t.footerTagline1}</p>
              <p dir="${isArabic ? 'rtl' : 'ltr'}">${t.footerTagline2}</p>
              <p style="margin-top: 15px;" dir="ltr">
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
        Data: t.subject,
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: htmlBody,
          Charset: 'UTF-8',
        },
        Text: {
          Data: t.textBody,
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
