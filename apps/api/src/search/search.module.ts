import { Module } from '@nestjs/common'

import { ProductsModule } from '../products/products.module'

import { LLM_PROVIDER, MistralLlmProvider } from './llm.provider'
import { SearchController } from './search.controller'
import { SearchService } from './search.service'

@Module({
  controllers: [SearchController],
  imports: [ProductsModule],
  providers: [SearchService, { provide: LLM_PROVIDER, useClass: MistralLlmProvider }],
})
export class SearchModule {}
