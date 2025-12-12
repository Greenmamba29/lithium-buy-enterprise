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

/**
 * PRD: Send auction launch notification to watchlist users
 */
export async function sendAuctionLaunchNotification(
  userEmail: string,
  auctionId: string,
  auctionTitle: string,
  materialType: string,
  grade: string,
  startingPrice: number,
  scheduledEnd: string
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
          .button { display: inline-block; padding: 12px 24px; background: #D4AF37; color: white; text-decoration: none; border-radius: 4px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: white; margin: 0;">New Auction Launched</h1>
          </div>
          <div class="content">
            <h2>${auctionTitle}</h2>
            <p>A new auction you're watching has just launched!</p>
            <ul>
              <li><strong>Material:</strong> ${materialType}</li>
              <li><strong>Grade:</strong> ${grade}%</li>
              <li><strong>Starting Price:</strong> $${startingPrice.toLocaleString()}/MT</li>
              <li><strong>Ends:</strong> ${new Date(scheduledEnd).toLocaleString()}</li>
            </ul>
            <p>
              <a href="${process.env.FRONTEND_URL || "https://lithiumbuy.com"}/auctions/${auctionId}" class="button">
                View Auction
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: userEmail,
    subject: `New Auction: ${auctionTitle}`,
    html,
  });
}

/**
 * PRD: Send bid confirmation email
 */
export async function sendBidConfirmation(
  userEmail: string,
  auctionId: string,
  auctionTitle: string,
  bidAmount: number,
  bidRank: number
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
          .button { display: inline-block; padding: 12px 24px; background: #D4AF37; color: white; text-decoration: none; border-radius: 4px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: white; margin: 0;">Bid Confirmed</h1>
          </div>
          <div class="content">
            <h2>Your bid has been placed</h2>
            <p>Bid details:</p>
            <ul>
              <li><strong>Auction:</strong> ${auctionTitle}</li>
              <li><strong>Bid Amount:</strong> $${bidAmount.toLocaleString()}/MT</li>
              <li><strong>Your Rank:</strong> #${bidRank}</li>
            </ul>
            <p>You'll be notified if you're outbid.</p>
            <p>
              <a href="${process.env.FRONTEND_URL || "https://lithiumbuy.com"}/auctions/${auctionId}" class="button">
                View Auction
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: userEmail,
    subject: `Bid Confirmed: ${auctionTitle}`,
    html,
  });
}

/**
 * PRD: Send outbid alert
 */
export async function sendOutbidAlert(
  userEmail: string,
  auctionId: string,
  auctionTitle: string,
  yourBid: number,
  newHighestBid: number
): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b6b 0%, #ff8787 50%, #ff6b6b 100%); padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #D4AF37; color: white; text-decoration: none; border-radius: 4px; margin-top: 20px; }
          .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: white; margin: 0;">You've Been Outbid</h1>
          </div>
          <div class="content">
            <div class="alert">
              <strong>Your bid of $${yourBid.toLocaleString()}/MT has been outbid.</strong>
            </div>
            <h2>${auctionTitle}</h2>
            <p>Current highest bid: <strong>$${newHighestBid.toLocaleString()}/MT</strong></p>
            <p>Place a new bid to stay in the running!</p>
            <p>
              <a href="${process.env.FRONTEND_URL || "https://lithiumbuy.com"}/auctions/${auctionId}" class="button">
                Place New Bid
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: userEmail,
    subject: `You've Been Outbid: ${auctionTitle}`,
    html,
  });
}

/**
 * PRD: Send auction closed notification (winner)
 */
export async function sendAuctionClosedNotification(
  userEmail: string,
  auctionId: string,
  auctionTitle: string,
  isWinner: boolean,
  finalPrice: number | null,
  quantity: number | null
): Promise<void> {
  const html = isWinner
    ? `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #28a745 0%, #5cb85c 50%, #28a745 100%); padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #28a745; color: white; text-decoration: none; border-radius: 4px; margin-top: 20px; }
          .success { background: #d4edda; border-left: 4px solid #28a745; padding: 12px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: white; margin: 0;">Congratulations! You Won!</h1>
          </div>
          <div class="content">
            <div class="success">
              <strong>You are the winning bidder for this auction!</strong>
            </div>
            <h2>${auctionTitle}</h2>
            <ul>
              <li><strong>Winning Price:</strong> $${finalPrice?.toLocaleString() || "N/A"}/MT</li>
              ${quantity ? `<li><strong>Quantity:</strong> ${quantity.toLocaleString()} MT</li>` : ""}
              <li><strong>Total Amount:</strong> $${finalPrice && quantity ? (finalPrice * quantity).toLocaleString() : "N/A"}</li>
            </ul>
            <p>Next steps: Complete settlement and contract signing.</p>
            <p>
              <a href="${process.env.FRONTEND_URL || "https://lithiumbuy.com"}/auctions/${auctionId}" class="button">
                View Details
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `
    : `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6c757d 0%, #868e96 50%, #6c757d 100%); padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: white; margin: 0;">Auction Closed</h1>
          </div>
          <div class="content">
            <h2>${auctionTitle}</h2>
            <p>This auction has closed. Unfortunately, your bid was not the winning bid.</p>
            <p>Thank you for participating! Check out other active auctions.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: userEmail,
    subject: isWinner ? `You Won: ${auctionTitle}` : `Auction Closed: ${auctionTitle}`,
    html,
  });
}

/**
 * PRD: Send settlement ready notification
 */
export async function sendSettlementReadyNotification(
  userEmail: string,
  auctionId: string,
  auctionTitle: string,
  contractUrl: string
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
          .button { display: inline-block; padding: 12px 24px; background: #D4AF37; color: white; text-decoration: none; border-radius: 4px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: white; margin: 0;">Settlement Ready</h1>
          </div>
          <div class="content">
            <h2>${auctionTitle}</h2>
            <p>Your auction settlement is ready. Please review and sign the contract to complete the transaction.</p>
            <p>
              <a href="${contractUrl}" class="button">
                Review Contract
              </a>
            </p>
            <p>
              <a href="${process.env.FRONTEND_URL || "https://lithiumbuy.com"}/auctions/${auctionId}">
                View Auction Details
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: userEmail,
    subject: `Settlement Ready: ${auctionTitle}`,
    html,
  });
}




