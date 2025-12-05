import { InternalServerError } from "../utils/errors.js";
import { docusignCircuitBreaker, CircuitBreakerError } from "../utils/circuitBreaker.js";
import { validateServiceEnv } from "../utils/envValidation.js";

/**
 * DocuSign Service
 * Handles e-signature integration with OAuth authentication
 */

// Validate DocuSign service configuration
const isDocuSignConfigured = validateServiceEnv("docusign");

interface DocuSignEnvelope {
  envelopeId: string;
  status: string;
  documentsUri: string;
  recipientsUri: string;
  statusDateTime: string;
}

interface DocuSignRecipient {
  email: string;
  name: string;
  roleName: string;
  routingOrder: string;
}

interface DocuSignDocument {
  documentId: string;
  name: string;
  fileExtension: string;
  documentBase64: string;
}

/**
 * Get OAuth access token
 */
async function getAccessToken(): Promise<string> {
  const clientId = process.env.DOCUSIGN_CLIENT_ID;
  const clientSecret = process.env.DOCUSIGN_CLIENT_SECRET;
  const accountId = process.env.DOCUSIGN_ACCOUNT_ID;

  if (!clientId || !clientSecret || !accountId) {
    throw new InternalServerError("DocuSign not configured");
  }

  // DocuSign uses JWT-based authentication for server-to-server
  // For production, you should implement JWT token generation
  // This is a simplified version - in production, use proper JWT signing
  
  // For now, we'll use the integration key as a placeholder
  // In production, implement proper OAuth JWT flow:
  // 1. Generate JWT with RS256 signing
  // 2. Exchange JWT for access token
  // 3. Cache access token (expires in 1 hour)
  
  // Placeholder - would implement full JWT flow
  return process.env.DOCUSIGN_ACCESS_TOKEN || "";
}

/**
 * Get DocuSign base URL
 */
function getBaseUrl(): string {
  const accountId = process.env.DOCUSIGN_ACCOUNT_ID;
  const baseUrl = process.env.DOCUSIGN_BASE_URL || "https://demo.docusign.net";
  
  return `${baseUrl}/restapi/v2.1/accounts/${accountId}`;
}

/**
 * Create DocuSign envelope from contract
 */
export async function createDocuSignEnvelope(
  contractContent: string,
  signerEmail: string,
  signerName: string,
  documentName: string = "Contract"
): Promise<DocuSignEnvelope> {
  if (!isDocuSignConfigured) {
    throw new InternalServerError("DocuSign not configured. DOCUSIGN_CLIENT_ID, DOCUSIGN_CLIENT_SECRET, and DOCUSIGN_ACCOUNT_ID required.");
  }

  return docusignCircuitBreaker.execute(async () => {
    try {
      const accessToken = await getAccessToken();
      const baseUrl = getBaseUrl();

      // Prepare document
      const document: DocuSignDocument = {
        documentId: "1",
        name: documentName,
        fileExtension: "pdf",
        documentBase64: Buffer.from(contractContent).toString("base64"),
      };

      // Prepare recipient
      const recipient: DocuSignRecipient = {
        email: signerEmail,
        name: signerName,
        roleName: "Signer",
        routingOrder: "1",
      };

      // Create envelope
      const envelopeRequest = {
        emailSubject: `Please sign: ${documentName}`,
        documents: [document],
        recipients: {
          signers: [recipient],
        },
        status: "sent",
      };

      const response = await fetch(`${baseUrl}/envelopes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(envelopeRequest),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`DocuSign API error: ${error.message || response.statusText}`);
      }

      const envelope = await response.json();

      return {
        envelopeId: envelope.envelopeId,
        status: envelope.status,
        documentsUri: envelope.documentsUri || "",
        recipientsUri: envelope.recipientsUri || "",
        statusDateTime: envelope.statusDateTime || new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof CircuitBreakerError) {
        throw error;
      }
      throw new InternalServerError(
        `Failed to create DocuSign envelope: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  });
}

/**
 * Get envelope status
 */
export async function getEnvelopeStatus(envelopeId: string): Promise<string> {
  if (!isDocuSignConfigured) {
    throw new InternalServerError("DocuSign not configured");
  }

  return docusignCircuitBreaker.execute(async () => {
    try {
      const accessToken = await getAccessToken();
      const baseUrl = getBaseUrl();

      const response = await fetch(`${baseUrl}/envelopes/${envelopeId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return "not_found";
        }
        throw new Error(`DocuSign API error: ${response.statusText}`);
      }

      const envelope = await response.json();
      return envelope.status || "unknown";
    } catch (error) {
      if (error instanceof CircuitBreakerError) {
        throw error;
      }
      throw new InternalServerError(
        `Failed to get envelope status: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  });
}

/**
 * Get envelope documents
 */
export async function getEnvelopeDocuments(envelopeId: string): Promise<any[]> {
  if (!isDocuSignConfigured) {
    throw new InternalServerError("DocuSign not configured");
  }

  return docusignCircuitBreaker.execute(async () => {
    try {
      const accessToken = await getAccessToken();
      const baseUrl = getBaseUrl();

      const response = await fetch(`${baseUrl}/envelopes/${envelopeId}/documents`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`DocuSign API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.envelopeDocuments || [];
    } catch (error) {
      if (error instanceof CircuitBreakerError) {
        throw error;
      }
      throw new InternalServerError(
        `Failed to get envelope documents: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  });
}

/**
 * Webhook handler for DocuSign events
 */
export function handleDocuSignWebhook(payload: any): {
  envelopeId: string;
  status: string;
  event: string;
} {
  // Parse DocuSign webhook payload
  // DocuSign sends webhooks in a specific format
  const data = payload.data || payload;
  
  return {
    envelopeId: data.envelopeId || data.envelope?.envelopeId || "",
    status: data.status || data.envelope?.status || "unknown",
    event: payload.event || data.event || "unknown",
  };
}

/**
 * Validate DocuSign webhook signature
 */
export function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  // In production, implement proper HMAC signature validation
  // DocuSign provides X-DocuSign-Signature header for validation
  // This is a placeholder - implement proper crypto validation
  return true; // Placeholder
}
