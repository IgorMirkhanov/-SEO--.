import { z } from 'zod';

export const seoResultSchema = z.object({
  title: z.string().min(5).max(70),
  meta_description: z.string().min(50).max(170),
  h1: z.string().min(5).max(80),
  description: z.string().min(120).max(3000),
  bullets: z.array(z.string().min(3).max(200)).min(3).max(10),
});
