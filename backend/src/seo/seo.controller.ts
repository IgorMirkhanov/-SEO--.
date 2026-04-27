import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { GenerateSeoDto } from './dto/generate-seo.dto';
import { FlowiseSeoService } from './flowise-seo.service';
import { SeoChunkEvent } from './seo.types';

@Controller('api')
export class SeoController {
  constructor(private readonly flowiseSeoService: FlowiseSeoService) {}

  @Post('generate-seo')
  @HttpCode(HttpStatus.OK)
  async generateSeo(@Body() body: GenerateSeoDto) {
    const data = await this.flowiseSeoService.generateSeoNonStreaming(body);
    return { data };
  }

  @Post('generate-seo/stream')
  @HttpCode(HttpStatus.OK)
  async streamSeo(@Body() body: GenerateSeoDto, @Res() res: Response): Promise<void> {
    res.status(HttpStatus.OK);
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const stream = this.flowiseSeoService.generateSeoStream(body);
    for await (const event of stream) {
      const output = this.toSseEvent(event);
      res.write(`event: ${output.event}\n`);
      res.write(`data: ${JSON.stringify(output.data)}\n\n`);
    }

    res.end();
  }

  private toSseEvent(event: SeoChunkEvent): { event: string; data: unknown } {
    switch (event.type) {
      case 'token':
        return { event: 'seo-token', data: { chunk: event.chunk } };
      case 'done':
        return { event: 'seo-done', data: event.data };
      case 'fallback':
        return { event: 'seo-fallback', data: { reason: event.reason, data: event.data } };
      default:
        return { event: 'seo-error', data: { reason: event.reason ?? 'Unknown error' } };
    }
  }
}
