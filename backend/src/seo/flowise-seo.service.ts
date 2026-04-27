import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GenerateSeoDto } from './dto/generate-seo.dto';
import {
  FlowiseNonStreamingResponse,
  FlowisePredictionRequest,
  SeoChunkEvent,
  SeoGenerationResult,
} from './seo.types';
import { seoResultSchema } from './seo.schema';

const DEFAULT_TIMEOUT_MS = 45_000;

@Injectable()
export class FlowiseSeoService {
  private readonly logger = new Logger(FlowiseSeoService.name);
  private readonly flowiseBaseUrl: string;
  private readonly defaultFlowId: string;
  private readonly timeoutMs: number;
  private readonly flowiseApiKey?: string;

  constructor(private readonly configService: ConfigService) {
    this.flowiseBaseUrl = this.configService.get<string>('FLOWISE_BASE_URL', '');
    this.defaultFlowId = this.configService.get<string>('FLOWISE_SEO_FLOW_ID', '');
    this.timeoutMs = this.configService.get<number>('FLOWISE_TIMEOUT_MS', DEFAULT_TIMEOUT_MS);
    this.flowiseApiKey = this.configService.get<string>('FLOWISE_API_KEY');
  }

  async *generateSeoStream(dto: GenerateSeoDto): AsyncGenerator<SeoChunkEvent> {
    let finalText = '';

    this.logger.log(`Flowise stream started for "${dto.input.product_name}"`);

    try {
      this.guardConfig();
      const flowId = dto.flowId ?? this.defaultFlowId;
      const payload = this.buildPredictionRequest(dto, true);
      const url = `${this.flowiseBaseUrl}/api/v1/prediction/${flowId}`;
      const response = await this.fetchWithTimeout(url, payload);
      if (!response.ok || !response.body) {
        const bodyText = await response.text();
        throw new Error(`Flowise API failed: ${response.status} ${bodyText}`);
      }

      const decoder = new TextDecoder();
      const reader = response.body.getReader();

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }
        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) {
          continue;
        }
        finalText += chunk;
        yield { type: 'token', chunk };
      }

      if (!finalText.trim()) {
        throw new Error('Flowise returned empty streamed response');
      }

      const result = this.validateResultOrThrow(this.extractJsonObject(finalText));
      yield { type: 'done', data: result };
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Unknown Flowise streaming error';
      this.logger.error(`Flowise stream fallback: ${reason}`);
      yield { type: 'fallback', reason, data: this.buildFallback(dto, finalText) };
    }
  }

  async generateSeoNonStreaming(dto: GenerateSeoDto): Promise<SeoGenerationResult> {
    this.logger.log(`Flowise request started for "${dto.input.product_name}"`);

    try {
      this.guardConfig();
      const flowId = dto.flowId ?? this.defaultFlowId;
      const payload = this.buildPredictionRequest(dto, false);
      const url = `${this.flowiseBaseUrl}/api/v1/prediction/${flowId}`;
      const response = await this.fetchWithTimeout(url, payload);
      if (!response.ok) {
        const bodyText = await response.text();
        throw new Error(`Flowise API failed: ${response.status} ${bodyText}`);
      }

      const rawResponse = (await response.json()) as FlowiseNonStreamingResponse;
      const rawData = rawResponse.json ?? rawResponse.text;

      if (!rawData) {
        throw new Error('Flowise returned empty response payload');
      }

      const parsed = typeof rawData === 'string' ? this.extractJsonObject(rawData) : rawData;
      return this.validateResultOrThrow(parsed);
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Unknown Flowise error';
      this.logger.error(`Flowise non-stream fallback: ${reason}`);
      return this.buildFallback(dto);
    }
  }

  private guardConfig(): void {
    if (!this.flowiseBaseUrl) {
      throw new Error('FLOWISE_BASE_URL is not configured');
    }
    if (!this.defaultFlowId) {
      throw new Error('FLOWISE_SEO_FLOW_ID is not configured');
    }
  }

  private buildPredictionRequest(dto: GenerateSeoDto, streaming: boolean): FlowisePredictionRequest {
    const { product_name, category, keywords } = dto.input;
    const strictPrompt = [
      'You are a senior e-commerce SEO copywriter.',
      'Return ONLY valid JSON with no markdown and no additional text.',
      'Required JSON schema:',
      '{"title":string,"meta_description":string,"h1":string,"description":string,"bullets":string[]}',
      'Rules: title 50-70 chars, meta_description 120-160 chars, bullets 3-7 items.',
      `product_name: ${product_name}`,
      `category: ${category}`,
      `keywords: ${keywords.join(', ')}`,
    ].join('\n');

    return {
      question: strictPrompt,
      streaming,
    };
  }

  private async fetchWithTimeout(url: string, body: FlowisePredictionRequest): Promise<Response> {
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      return await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.flowiseApiKey ? { Authorization: `Bearer ${this.flowiseApiKey}` } : {}),
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutHandle);
    }
  }

  private extractJsonObject(raw: string): unknown {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start < 0 || end <= start) {
      throw new Error('JSON object not found in LLM output');
    }
    return JSON.parse(raw.slice(start, end + 1));
  }

  private validateResultOrThrow(raw: unknown): SeoGenerationResult {
    const parsed = seoResultSchema.safeParse(raw);
    if (!parsed.success) {
      throw new Error(`Invalid SEO schema: ${parsed.error.message}`);
    }
    return parsed.data;
  }

  private buildFallback(dto: GenerateSeoDto, partialText?: string): SeoGenerationResult {
    const { product_name, category, keywords } = dto.input;
    const keywordsText = keywords.slice(0, 5).join(', ');

    return {
      title: `${product_name} - ${category} с быстрой доставкой`,
      meta_description: `${product_name} в категории ${category}. Ключевые преимущества: ${keywordsText}. Подробные характеристики и выгодные условия покупки.`,
      h1: `${product_name} (${category})`,
      description:
        partialText?.trim().slice(0, 400) ||
        `${product_name} - товар категории ${category}. Решение для пользователей, ищущих: ${keywordsText}. Подходит для размещения в карточке товара и SEO-оптимизации.`,
      bullets: [
        `Категория: ${category}`,
        `SEO-ключи: ${keywordsText}`,
        'Оптимизировано для карточки товара',
      ],
    };
  }
}
