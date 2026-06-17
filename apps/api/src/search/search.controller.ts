import { Body, Controller, Post } from '@nestjs/common'

import { AiSearchDto } from './dto/ai-search.dto'
import { QuestionnaireDto } from './dto/questionnaire.dto'
import { SearchService } from './search.service'

import type { SearchResponse } from './search.types'

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post('ai')
  searchWithAi(@Body() input: AiSearchDto): Promise<SearchResponse> {
    return this.searchService.searchWithAi(input.query)
  }

  @Post('questionnaire')
  searchWithQuestionnaire(@Body() input: QuestionnaireDto): Promise<SearchResponse> {
    return this.searchService.searchWithQuestionnaire(input)
  }
}
