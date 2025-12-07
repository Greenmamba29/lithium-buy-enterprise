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
  config: DailyRoomConfig;
  created_at: string;
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
      const response = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.DAILY_CO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: config.name || `telebuy-${Date.now()}`,
        privacy: config.privacy,
        properties: {
          enable_screenshare: true,
          enable_recording: config.properties?.enable_recording || false,
          enable_chat: true,
          exp: config.properties?.exp || Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours default
          ...config.properties,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Daily.co API error: ${error.error || response.statusText}`);
    }

    const room = await response.json();

    return {
      id: room.id,
      name: room.name,
      url: room.url,
      config,
      created_at: room.config.created_at || new Date().toISOString(),
    };
    } catch (error) {
      if (error instanceof CircuitBreakerError) {
        throw error;
      }
      throw new InternalServerError(
        `Failed to create meeting room: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  });
}

/**
 * Get meeting room details
 */
export async function getMeetingRoom(roomName: string): Promise<DailyRoom | null> {
  if (!process.env.DAILY_CO_API_KEY) {
    throw new InternalServerError("Daily.co API not configured");
  }

  return dailyCircuitBreaker.execute(async () => {
    try {
    const response = await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.DAILY_CO_API_KEY}`,
      },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Daily.co API error: ${response.statusText}`);
    }

    const room = await response.json();

    return {
      id: room.id,
      name: room.name,
      url: room.url,
      config: room.config,
      created_at: room.config.created_at,
    };
    } catch (error) {
      if (error instanceof CircuitBreakerError) {
        throw error;
      }
      throw new InternalServerError(
        `Failed to get meeting room: ${error instanceof Error ? error.message : "Unknown error"}`
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
    const response = await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${process.env.DAILY_CO_API_KEY}`,
      },
    });

    if (!response.ok && response.status !== 404) {
      throw new Error(`Daily.co API error: ${response.statusText}`);
    }
  } catch (error) {
    throw new InternalServerError(
      `Failed to delete meeting room: ${error instanceof Error ? error.message : "Unknown error"}`
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
      throw new Error(`Daily.co API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.token;
    } catch (error) {
      if (error instanceof CircuitBreakerError) {
        throw error;
      }
      throw new InternalServerError(
        `Failed to generate meeting token: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  });
}




