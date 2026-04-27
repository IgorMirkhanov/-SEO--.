import { Module } from '@nestjs/common';
import { FlowiseSeoService } from './flowise-seo.service';
import { SeoController } from './seo.controller';

@Module({
  controllers: [SeoController],
  providers: [FlowiseSeoService],
})
export class SeoModule {}
