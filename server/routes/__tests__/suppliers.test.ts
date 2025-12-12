import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getSuppliers } from '../suppliers';
import type { Request, Response } from 'express';

// Mock Supabase
vi.mock('../../db/client.js', () => {
  const createBuilder = () => {
    const builder: any = {
      order: vi.fn(() => builder),
      range: vi.fn(async () => ({ data: [], error: null, count: 0 })),
      eq: vi.fn(() => builder),
      ilike: vi.fn(() => builder),
    };

    builder.select = vi.fn(() => builder);

    return builder;
  };

  return {
    supabaseAdmin: {
      from: vi.fn(() => createBuilder()),
    },
  };
});

describe('Supplier Routes', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockReq = {
      query: {},
    };

    mockRes = {
      json: vi.fn(),
      status: vi.fn(() => mockRes as Response),
    };
  });

  it('should return suppliers with pagination', async () => {
    await new Promise((resolve, reject) => {
      (mockRes as any).json = vi.fn((payload: any) => {
        resolve(payload);
        return payload;
      });

      getSuppliers(mockReq as Request, mockRes as Response, reject);
    });

    expect(mockRes.json).toHaveBeenCalled();
    const call = (mockRes.json as any).mock.calls[0][0];
    expect(call).toHaveProperty('data');
    expect(call).toHaveProperty('pagination');
  });
});




