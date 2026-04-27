import type { GenerateSeoInput, SeoResult } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export async function generateSeo(body: GenerateSeoInput): Promise<SeoResult> {
  const response = await fetch(`${API_BASE_URL}/api/generate-seo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  const data = (await response.json()) as { data: SeoResult };
  return data.data;
}

export async function streamSeo(
  body: GenerateSeoInput,
  handlers: {
    onToken: (token: string) => void;
    onDone: (result: SeoResult) => void;
    onFallback: (result: SeoResult, reason?: string) => void;
  },
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/generate-seo/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok || !response.body) {
    throw new Error(`Streaming failed: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }
    buffer += decoder.decode(value, { stream: true });

    let boundary = buffer.indexOf('\n\n');
    while (boundary !== -1) {
      const frame = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);

      const eventMatch = frame.match(/event:\s*(.+)/);
      const dataMatch = frame.match(/data:\s*(.+)/);

      if (eventMatch && dataMatch) {
        const event = eventMatch[1].trim();
        const data = JSON.parse(dataMatch[1]);
        if (event === 'seo-token') {
          handlers.onToken(String(data.chunk ?? ''));
        } else if (event === 'seo-done') {
          handlers.onDone(data as SeoResult);
        } else if (event === 'seo-fallback') {
          handlers.onFallback(data.data as SeoResult, data.reason);
        }
      }

      boundary = buffer.indexOf('\n\n');
    }
  }
}
