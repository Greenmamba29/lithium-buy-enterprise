/**
 * Circuit Breaker Pattern Implementation
 * Prevents cascading failures by stopping requests to failing services
 */

export interface CircuitBreakerOptions {
  failureThreshold: number; // Number of failures before opening circuit
  resetTimeout: number; // Time in ms before attempting to close circuit
  monitoringPeriod: number; // Time window for failure counting
}

export enum CircuitState {
  CLOSED = "closed", // Normal operation
  OPEN = "open", // Circuit is open, rejecting requests
  HALF_OPEN = "half_open", // Testing if service recovered
}

interface CircuitBreakerState {
  state: CircuitState;
  failureCount: number;
  lastFailureTime: number;
  successCount: number;
  nextAttemptTime: number;
}

const defaultOptions: CircuitBreakerOptions = {
  failureThreshold: 5,
  resetTimeout: 60000, // 1 minute
  monitoringPeriod: 60000, // 1 minute
};

class CircuitBreaker {
  private state: CircuitBreakerState;
  private options: CircuitBreakerOptions;
  private name: string;

  constructor(name: string, options?: Partial<CircuitBreakerOptions>) {
    this.name = name;
    this.options = { ...defaultOptions, ...options };
    this.state = {
      state: CircuitState.CLOSED,
      failureCount: 0,
      lastFailureTime: 0,
      successCount: 0,
      nextAttemptTime: 0,
    };
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit is open
    if (this.state.state === CircuitState.OPEN) {
      if (Date.now() < this.state.nextAttemptTime) {
        throw new CircuitBreakerError(
          `Circuit breaker is OPEN for ${this.name}. Retry after ${new Date(this.state.nextAttemptTime).toISOString()}`
        );
      }
      // Transition to half-open
      this.state.state = CircuitState.HALF_OPEN;
      this.state.successCount = 0;
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Handle successful execution
   */
  private onSuccess(): void {
    if (this.state.state === CircuitState.HALF_OPEN) {
      this.state.successCount++;
      // If we get enough successes, close the circuit
      if (this.state.successCount >= 2) {
        this.state.state = CircuitState.CLOSED;
        this.state.failureCount = 0;
        this.state.successCount = 0;
      }
    } else {
      // Reset failure count on success
      this.state.failureCount = 0;
    }
  }

  /**
   * Handle failed execution
   */
  private onFailure(): void {
    this.state.failureCount++;
    this.state.lastFailureTime = Date.now();

    if (this.state.state === CircuitState.HALF_OPEN) {
      // If we fail in half-open, immediately open again
      this.state.state = CircuitState.OPEN;
      this.state.nextAttemptTime = Date.now() + this.options.resetTimeout;
    } else if (this.state.failureCount >= this.options.failureThreshold) {
      // Open the circuit
      this.state.state = CircuitState.OPEN;
      this.state.nextAttemptTime = Date.now() + this.options.resetTimeout;
    }

    // Reset failure count if monitoring period has passed
    if (Date.now() - this.state.lastFailureTime > this.options.monitoringPeriod) {
      this.state.failureCount = 0;
    }
  }

  /**
   * Get current circuit state
   */
  getState(): CircuitState {
    return this.state.state;
  }

  /**
   * Get circuit breaker statistics
   */
  getStats(): {
    state: CircuitState;
    failureCount: number;
    lastFailureTime: number;
    nextAttemptTime: number;
  } {
    return {
      state: this.state.state,
      failureCount: this.state.failureCount,
      lastFailureTime: this.state.lastFailureTime,
      nextAttemptTime: this.state.nextAttemptTime,
    };
  }

  /**
   * Manually reset circuit breaker
   */
  reset(): void {
    this.state = {
      state: CircuitState.CLOSED,
      failureCount: 0,
      lastFailureTime: 0,
      successCount: 0,
      nextAttemptTime: 0,
    };
  }
}

export class CircuitBreakerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CircuitBreakerError";
  }
}

// Create circuit breakers for external services
export const dailyCircuitBreaker = new CircuitBreaker("daily-co", {
  failureThreshold: 5,
  resetTimeout: 60000, // 1 minute
});

export const geminiCircuitBreaker = new CircuitBreaker("gemini", {
  failureThreshold: 5,
  resetTimeout: 60000,
});

export const perplexityCircuitBreaker = new CircuitBreaker("perplexity", {
  failureThreshold: 5,
  resetTimeout: 60000,
});

export const docusignCircuitBreaker = new CircuitBreaker("docusign", {
  failureThreshold: 5,
  resetTimeout: 60000,
});
