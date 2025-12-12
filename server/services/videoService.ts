import { InternalServerError } from "../utils/errors.js";
import { dailyCircuitBreaker, CircuitBreakerError } from "../utils/circuitBreaker.js";

/**
 * Daily.co Video Service
 * Handles video room creation and management
 */

interface DailyRoomConfig {
  name?: string;
  privacy: "public" | "private";
  properties?: {
    enable_screenshare?: boolean;
    enable_recording?: boolean;
    enable_chat?: boolean;
    exp?: number; // Expiration timestamp
  };
}

interface DailyRoom {
  id: string;
  name: string;
  url: string;
  config: DailyRoomConfig | Record<string, unknown>;
  created_at: string;
}

/** Helper: try to parse JSON safely */
async function tryParseJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Create a Daily.co meeting room
 */
export async function createMeetingRoom(
  config: DailyRoomConfig
): Promise<DailyRoom> {
  if (!process.env.DAILY_CO_API_KEY) {
    throw new InternalServerError("Daily.co API not configured");
  }

  return dailyCircuitBreaker.execute(async () => {
    try {
      const defaultExpiry =
        config.properties?.exp ?? Math.floor(Date.now() / 1000) + 24 * 60 * 60;
      const properties = {
        ...config.properties,
        enable_screenshare: config.properties?.enable_screenshare ?? true,
        enable_recording: config.properties?.enable_recording ?? false,
        enable_chat: config.properties?.enable_chat ?? true,
        exp: config.properties?.exp ?? defaultExpiry,
      };

      const requestConfig = { ...config, properties };

      const response = await fetch("https://api.daily.co/v1/rooms", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.DAILY_CO_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: config.name || `telebuy-${Date.now()}`,
          privacy: config.privacy,
          properties,
        }),
      });

      if (!response.ok) {
        const errorBody = await tryParseJson(response);
        const message =
          (errorBody && (errorBody as any).error) ||
          response.statusText ||
          `status ${response.status}`;
        throw new Error(`Daily.co API error: ${message}`);
      }

      const room = (await tryParseJson(response)) || {};

      return {
        id: (room as any).id || "",
        name: (room as any).name || (config.name ?? ""),
        url: (room as any).url || "",
        config: requestConfig,
        created_at: (room as any).created_at || new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof CircuitBreakerError) {
        throw error;
      }
      throw new InternalServerError(
        `Failed to create meeting room: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  });
}

/**
 * Get meeting room details
 */
export async function getMeetingRoom(
  roomName: string
): Promise<DailyRoom | null> {
  if (!process.env.DAILY_CO_API_KEY) {
    throw new InternalServerError("Daily.co API not configured");
  }

  return dailyCircuitBreaker.execute(async () => {
    try {
      const response = await fetch(
        `https://api.daily.co/v1/rooms/${encodeURIComponent(roomName)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${process.env.DAILY_CO_API_KEY}`,
          },
        }
      );

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        const errorBody = await tryParseJson(response);
        const message =
          (errorBody && (errorBody as any).error) ||
          response.statusText ||
          `status ${response.status}`;
        throw new Error(`Daily.co API error: ${message}`);
      }

      const room = (await tryParseJson(response)) || {};

      return {
        id: (room as any).id || "",
        name: (room as any).name || roomName,
        url: (room as any).url || "",
        config: (room as any).config || {},
        created_at: (room as any).created_at || new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof CircuitBreakerError) {
        throw error;
      }
      throw new InternalServerError(
        `Failed to get meeting room: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  });
}

/**
 * Delete a meeting room
 */
export async function deleteMeetingRoom(roomName: string): Promise<void> {
  if (!process.env.DAILY_CO_API_KEY) {
    throw new InternalServerError("Daily.co API not configured");
  }

  try {
    const response = await fetch(
      `https://api.daily.co/v1/rooms/${encodeURIComponent(roomName)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${process.env.DAILY_CO_API_KEY}`,
        },
      }
    );

    if (!response.ok && response.status !== 404) {
      const errorBody = await tryParseJson(response);
      const message =
        (errorBody && (errorBody as any).error) ||
        response.statusText ||
        `status ${response.status}`;
      throw new Error(`Daily.co API error: ${message}`);
    }
  } catch (error) {
    throw new InternalServerError(
      `Failed to delete meeting room: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Generate meeting token for participant
 */
export async function generateMeetingToken(
  roomName: string,
  userId: string,
  isOwner: boolean = false
): Promise<string> {
  if (!process.env.DAILY_CO_API_KEY) {
    throw new InternalServerError("Daily.co API not configured");
  }

  return dailyCircuitBreaker.execute(async () => {
    try {
      const response = await fetch("https://api.daily.co/v1/meeting-tokens", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.DAILY_CO_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          properties: {
            room_name: roomName,
            user_id: userId,
            is_owner: isOwner,
            exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
          },
        }),
      });

      if (!response.ok) {
        const errorBody = await tryParseJson(response);
        const message =
          (errorBody && (errorBody as any).error) ||
          response.statusText ||
          `status ${response.status}`;
        throw new Error(`Daily.co API error: ${message}`);
      }

      const data = (await tryParseJson(response)) || {};
      if (!((data as any).token && typeof (data as any).token === "string")) {
        throw new Error("Daily.co API returned no token");
      }
      return (data as any).token as string;
    } catch (error) {
      if (error instanceof CircuitBreakerError) {
        throw error;
      }
      throw new InternalServerError(
        `Failed to generate meeting token: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  });
}
