import nodemailer from "nodemailer";
import { InternalServerError } from "../utils/errors.js";
import { validateServiceEnv } from "../utils/envValidation.js";
import { emailQueue } from "../jobs/queue.js";

// Validate email service configuration
const isEmailConfigured = validateServiceEnv("email");

// Create transporter
const transporter =
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587", 10),
        secure: process.env.SMTP_PORT === "465",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })
    : null;

/**
 * Send email
 */
/**
 * Send email (enqueues job for async processing)
 */
export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<void> {
  if (!isEmailConfigured) {
    throw new InternalServerError("Email service not configured. SMTP credentials required.");
  }

  // Enqueue email job for async processing
  await emailQueue.add("send-email", {
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text || options.html.replace(/<[^>]*>/g, ""),
  });
}

/**
 * Send email synchronously (for critical emails that must be sent immediately)
 */
export async function sendEmailSync(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<void> {
  if (!isEmailConfigured) {
    throw new InternalServerError("Email service not configured. SMTP credentials required.");
  }
  if (!transporter) {
    throw new InternalServerError("Email service not configured");
  }

  try {
    await transporter.sendMail({
      from: `LithiumBuy Enterprise <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ""),
    });
  } catch (error) {
    throw new InternalServerError(
      `Failed to send email: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Send quote request notification
 */
export async function sendQuoteRequestEmail(
  supplierEmail: string,
  buyerEmail: string,
  supplierName: string,
  productName: string,
  quantity: number
): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #D4AF37 0%, #F5E6A3 50%, #D4AF37 100%); padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #D4AF37; color: white; text-decoration: none; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: white; margin: 0;">LithiumBuy Enterprise</h1>
          </div>
          <div class="content">
            <h2>New Quote Request</h2>
            <p>You have received a new quote request:</p>
            <ul>
              <li><strong>Buyer:</strong> ${buyerEmail}</li>
              <li><strong>Product:</strong> ${productName}</li>
              <li><strong>Quantity:</strong> ${quantity}</li>
            </ul>
            <p>
              <a href="${process.env.FRONTEND_URL || "https://lithiumbuy.com"}/supplier/${supplierName}" class="button">
                View Request
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: supplierEmail,
    subject: `New Quote Request for ${productName}`,
    html,
  });
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(
  buyerEmail: string,
  orderId: string,
  supplierName: string,
  totalAmount: number,
  currency: string = "USD"
): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #D4AF37 0%, #F5E6A3 50%, #D4AF37 100%); padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: white; margin: 0;">Order Confirmed</h1>
          </div>
          <div class="content">
            <h2>Thank you for your order!</h2>
            <p>Your order has been confirmed:</p>
            <ul>
              <li><strong>Order ID:</strong> ${orderId}</li>
              <li><strong>Supplier:</strong> ${supplierName}</li>
              <li><strong>Total:</strong> ${currency} ${totalAmount.toLocaleString()}</li>
            </ul>
            <p>You will receive updates on your order status via email.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: buyerEmail,
    subject: `Order Confirmation - ${orderId}`,
    html,
  });
}




