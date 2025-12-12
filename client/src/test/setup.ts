/// <reference types="@testing-library/jest-dom" />
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Declare jest-dom matchers for TypeScript
declare module 'vitest' {
  interface Assertion<T = any> extends jest.Matchers<void, T> {
    toBeInTheDocument(): T;
    toHaveTextContent(text: string | RegExp): T;
    toBeVisible(): T;
    toBeDisabled(): T;
    toBeEnabled(): T;
    toHaveValue(value: string | string[] | number | null): T;
    toHaveClass(...classNames: string[]): T;
    toHaveAttribute(attr: string, value?: string | RegExp): T;
    toHaveStyle(css: Record<string, any>): T;
  }
}

// Cleanup after each test
afterEach(() => {
  cleanup();
});




