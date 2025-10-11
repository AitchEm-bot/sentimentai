// Core integration functions for SentimentAI

export async function InvokeLLM(userMessage: string): Promise<string> {
  // Placeholder for LLM integration
  // In production, this would call your LLM API (OpenAI, Anthropic, etc.)
  console.log("InvokeLLM called with:", userMessage);

  // Simulate API response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("Thank you for your message. This is a placeholder response from the AI assistant.");
    }, 1000);
  });
}

export async function SendEmail(data: {
  name: string;
  email: string;
  company?: string;
  message: string;
  locale?: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    // Use Railway backend URL from environment variable
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const response = await fetch(`${apiUrl}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Failed to send email');
    }

    return {
      success: true,
      message: result.message || 'Email sent successfully',
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}
