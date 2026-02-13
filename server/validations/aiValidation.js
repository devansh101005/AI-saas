import { z } from 'zod';

// Max prompt length to prevent abuse and control API costs
const MAX_PROMPT_LENGTH = 2000;

export const generateArticleSchema = z.object({
  prompt: z
    .string({ required_error: 'Prompt is required' })
    .min(3, 'Prompt must be at least 3 characters')
    .max(MAX_PROMPT_LENGTH, `Prompt must be under ${MAX_PROMPT_LENGTH} characters`)
    .trim(),
  length: z
    .number({ required_error: 'Length is required' })
    .int()
    .min(100, 'Length must be at least 100 tokens')
    .max(2000, 'Length must be under 2000 tokens'),
});

export const generateBlogTitleSchema = z.object({
  prompt: z
    .string({ required_error: 'Prompt is required' })
    .min(3, 'Prompt must be at least 3 characters')
    .max(MAX_PROMPT_LENGTH, `Prompt must be under ${MAX_PROMPT_LENGTH} characters`)
    .trim(),
});

export const generateImageSchema = z.object({
  prompt: z
    .string({ required_error: 'Prompt is required' })
    .min(3, 'Prompt must be at least 3 characters')
    .max(MAX_PROMPT_LENGTH, `Prompt must be under ${MAX_PROMPT_LENGTH} characters`)
    .trim(),
  publish: z.boolean().optional().default(false),
});

export const removeObjectSchema = z.object({
  object: z
    .string({ required_error: 'Object name is required' })
    .min(1, 'Object name is required')
    .max(100, 'Object name must be under 100 characters')
    .trim(),
});

export const toggleLikeSchema = z.object({
  id: z
    .number({ required_error: 'Creation ID is required' })
    .int('Creation ID must be an integer')
    .positive('Creation ID must be positive'),
});
