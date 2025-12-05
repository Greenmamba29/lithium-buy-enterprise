import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getSuppliers } from '../suppliers';
import type { Request, Response } from 'express';

// Mock Supabase
vi.mock('../../db/client', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            range: vi.fn(() => ({
              data: [],
              error: null,
              count: 0,
            })),
          })),
        })),
        ilike: vi.fn(() => ({
          order: vi.fn(() => ({
            range: vi.fn(() => ({
              data: [],
              error: null,
              count: 0,
            })),
          })),
        })),
      })),
    })),
  },
}));

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
    await getSuppliers(mockReq as Request, mockRes as Response);

    expect(mockRes.json).toHaveBeenCalled();
    const call = (mockRes.json as any).mock.calls[0][0];
    expect(call).toHaveProperty('data');
    expect(call).toHaveProperty('pagination');
  });
});




