import { supabaseAdmin } from "../db/client.js";
import { InternalServerError, NotFoundError } from "../utils/errors.js";

/**
 * Contract Service
 * Handles contract generation, editing, and management
 */

interface ContractTemplate {
  supplierName: string;
  buyerName: string;
  productName: string;
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
  currency: string;
  deliveryTerms?: string;
  paymentTerms?: string;
  notes?: string;
}

/**
 * Generate contract from template
 */
export function generateContractTemplate(data: ContractTemplate): string {
  return `
LITHIUM SUPPLY AGREEMENT

This agreement is entered into on ${new Date().toLocaleDateString()} between:

SUPPLIER: ${data.supplierName}
BUYER: ${data.buyerName}

PRODUCT DETAILS:
- Product: ${data.productName}
- Quantity: ${data.quantity} tons
- Price per Unit: ${data.currency} ${data.pricePerUnit.toLocaleString()}
- Total Amount: ${data.currency} ${data.totalAmount.toLocaleString()}

DELIVERY TERMS:
${data.deliveryTerms || "To be agreed upon"}

PAYMENT TERMS:
${data.paymentTerms || "Net 30 days"}

ADDITIONAL NOTES:
${data.notes || "None"}

This contract is subject to the terms and conditions agreed upon during the TELEBUY session.

By signing below, both parties agree to the terms outlined in this agreement.

_________________________          _________________________
Supplier Signature                  Buyer Signature

Date: _______________              Date: _______________
  `.trim();
}

/**
 * Create contract document for TELEBUY session
 */
export async function createContractDocument(
  sessionId: string,
  contractData: ContractTemplate
): Promise<string> {
  // Verify session exists
  const { data: session, error: sessionError } = await supabaseAdmin
    .from("telebuy_sessions")
    .select("id")
    .eq("id", sessionId)
    .single();

  if (sessionError || !session) {
    throw new NotFoundError("TELEBUY session");
  }

  // Generate contract content
  const contractContent = generateContractTemplate(contractData);

  // Create document record
  const { data: document, error: docError } = await supabaseAdmin
    .from("telebuy_documents")
    .insert({
      session_id: sessionId,
      document_type: "contract",
      content: {
        template: contractContent,
        data: contractData,
        version: 1,
        created_at: new Date().toISOString(),
      },
      version: 1,
    })
    .select()
    .single();

  if (docError || !document) {
    throw new InternalServerError(`Failed to create contract: ${docError?.message}`);
  }

  return document.id;
}

/**
 * Update contract document
 */
export async function updateContractDocument(
  documentId: string,
  updates: Partial<ContractTemplate>
): Promise<void> {
  const { data: document, error: docError } = await supabaseAdmin
    .from("telebuy_documents")
    .select("content, version")
    .eq("id", documentId)
    .single();

  if (docError || !document) {
    throw new NotFoundError("Contract document");
  }

  const currentContent = document.content as any;
  const newContent = {
    ...currentContent,
    data: {
      ...currentContent.data,
      ...updates,
    },
    version: (document.version || 1) + 1,
    updated_at: new Date().toISOString(),
  };

  // Regenerate contract with updated data
  newContent.template = generateContractTemplate(newContent.data);

  const { error: updateError } = await supabaseAdmin
    .from("telebuy_documents")
    .update({
      content: newContent,
      version: newContent.version,
    })
    .eq("id", documentId);

  if (updateError) {
    throw new InternalServerError(`Failed to update contract: ${updateError.message}`);
  }
}

/**
 * Get contract document
 */
export async function getContractDocument(documentId: string) {
  const { data, error } = await supabaseAdmin
    .from("telebuy_documents")
    .select("*")
    .eq("id", documentId)
    .eq("document_type", "contract")
    .single();

  if (error || !data) {
    throw new NotFoundError("Contract document");
  }

  return data;
}




