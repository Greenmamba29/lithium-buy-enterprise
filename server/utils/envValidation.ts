/**
 * Environment Variable Validation
 * Validates all required environment variables at startup
 */

interface EnvVar {
  name: string;
  required: boolean;
  description: string;
}

function hydrateSupabaseEnv() {
  // Netlify exposes Supabase URL to the client as VITE_SUPABASE_URL; mirror it for the server when missing.
  if (!process.env.SUPABASE_URL && process.env.VITE_SUPABASE_URL) {
    process.env.SUPABASE_URL = process.env.VITE_SUPABASE_URL;
  }

  // In CI/test runs we still want the process to boot even if secrets are not provided.
  if (process.env.NODE_ENV === "test") {
    if (!process.env.SUPABASE_URL) {
      process.env.SUPABASE_URL = "https://example.supabase.test";
      console.warn("Using placeholder SUPABASE_URL for tests; set a real value if needed.");
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
      console.warn("Using placeholder SUPABASE_SERVICE_ROLE_KEY for tests; set a real value if needed.");
    }
  }
}

const requiredEnvVars: EnvVar[] = [
  // Supabase
  { name: "SUPABASE_URL", required: true, description: "Supabase project URL" },
  { name: "SUPABASE_SERVICE_ROLE_KEY", required: true, description: "Supabase service role key" },
  { name: "SUPABASE_ANON_KEY", required: false, description: "Supabase anonymous key (optional)" },

  // Daily.co
  { name: "DAILY_CO_API_KEY", required: false, description: "Daily.co API key for video rooms" },

  // Email (SMTP)
  { name: "SMTP_HOST", required: false, description: "SMTP server hostname" },
  { name: "SMTP_USER", required: false, description: "SMTP username" },
  { name: "SMTP_PASS", required: false, description: "SMTP password" },
  { name: "SMTP_PORT", required: false, description: "SMTP port (default: 587)" },

  // Gemini AI
  { name: "GEMINI_API_KEY", required: false, description: "Google Gemini API key" },

  // Perplexity
  { name: "PERPLEXITY_API_KEY", required: false, description: "Perplexity Labs API key" },
  { name: "PERPLEXITY_MODEL", required: false, description: "Perplexity model (default: sonar-pro)" },

  // Redis (for job queues)
  { name: "REDIS_URL", required: false, description: "Redis connection URL" },

  // Stripe
  { name: "STRIPE_SECRET_KEY", required: false, description: "Stripe secret key for payments" },
  { name: "STRIPE_PUBLISHABLE_KEY", required: false, description: "Stripe publishable key" },

  // DocuSign
  { name: "DOCUSIGN_CLIENT_ID", required: false, description: "DocuSign client ID" },
  { name: "DOCUSIGN_CLIENT_SECRET", required: false, description: "DocuSign client secret" },
  { name: "DOCUSIGN_ACCOUNT_ID", required: false, description: "DocuSign account ID" },
  { name: "DOCUSIGN_REDIRECT_URI", required: false, description: "DocuSign OAuth redirect URI" },
  { name: "DOCUSIGN_BASE_URL", required: false, description: "DocuSign base URL (default: https://demo.docusign.net)" },
  { name: "DOCUSIGN_ACCESS_TOKEN", required: false, description: "DocuSign access token (for testing, use JWT in production)" },

  // Server
  { name: "PORT", required: false, description: "Server port (default: 5000)" },
  { name: "NODE_ENV", required: false, description: "Node environment (development/production)" },
];

/**
 * Validate URL format
 */
function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate environment variables
 * Throws error if required variables are missing
 */
export function validateEnvironment(): void {
  hydrateSupabaseEnv();

  const missing: string[] = [];
  const warnings: string[] = [];
  const formatErrors: string[] = [];

  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar.name];

    if (envVar.required && !value) {
      missing.push(`${envVar.name} - ${envVar.description}`);
    } else if (value) {
      // Format validation for specific types
      if (envVar.name.includes("URL") && !isValidUrl(value)) {
        formatErrors.push(
          `${envVar.name} must be a valid URL (e.g., https://example.com)`
        );
      }
      
      if (envVar.name.includes("EMAIL") || (envVar.name.includes("SMTP_USER") && value.includes("@"))) {
        if (!isValidEmail(value)) {
          formatErrors.push(
            `${envVar.name} must be a valid email address`
          );
        }
      }
      
      if (envVar.name.includes("PORT")) {
        const port = parseInt(value, 10);
        if (isNaN(port) || port < 1 || port > 65535) {
          formatErrors.push(
            `${envVar.name} must be a valid port number (1-65535)`
          );
        }
      }
    } else if (!value && (envVar.name.includes("API_KEY") || envVar.name.includes("SECRET"))) {
      warnings.push(`${envVar.name} - ${envVar.description} (optional but recommended)`);
    }
  }

  if (formatErrors.length > 0) {
    throw new Error(
      `Environment variable format errors:\n${formatErrors.map((v) => `  - ${v}`).join("\n")}`
    );
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map((v) => `  - ${v}`).join("\n")}\n\n` +
      `Please check your .env file or environment configuration.`
    );
  }

  if (warnings.length > 0) {
    console.warn(
      `Optional environment variables not set (some features may not work):\n${warnings
        .map((v) => `  - ${v}`)
        .join("\n")}`
    );
  }
}

/**
 * Validate service-specific environment variables
 */
export function validateServiceEnv(service: "daily" | "email" | "gemini" | "perplexity" | "docusign"): boolean {
  switch (service) {
    case "daily":
      if (!process.env.DAILY_CO_API_KEY) {
        console.warn("Daily.co API key not set. Video features will not work.");
        return false;
      }
      return true;

    case "email":
      if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn("SMTP credentials not set. Email features will not work.");
        return false;
      }
      return true;

    case "gemini":
      if (!process.env.GEMINI_API_KEY) {
        console.warn("Gemini API key not set. AI image enhancement will not work.");
        return false;
      }
      return true;

    case "perplexity":
      if (!process.env.PERPLEXITY_API_KEY) {
        console.warn("Perplexity API key not set. Market intelligence features will not work.");
        return false;
      }
      return true;

    case "docusign":
      if (!process.env.DOCUSIGN_CLIENT_ID || !process.env.DOCUSIGN_CLIENT_SECRET || !process.env.DOCUSIGN_ACCOUNT_ID) {
        console.warn("DocuSign credentials not set. E-signature features will not work.");
        return false;
      }
      return true;

    default:
      return false;
  }
}
