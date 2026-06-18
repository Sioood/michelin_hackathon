import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'

import { CurrentUser } from '../common/decorators/current-user.decorator'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'

import { CommunityService } from './community.service'
import { CommunityFeedQueryDto } from './dto/community-feed-query.dto'
import { CreateCommunityPostDto } from './dto/create-community-post.dto'
import { JoinChallengeDto } from './dto/join-challenge.dto'
import { ReportPostDto } from './dto/report-post.dto'
import { CommunityUploadService } from './uploads/community-upload.service'

import type {
  ChallengeLeaderboardEntryDto,
  CommunityChallengeDto,
  CommunityFeedDto,
  CommunityPostDto,
} from './community.service'
import type { CommunityUploadDto, UploadedCommunityFile } from './uploads/community-upload.service'
import type { PublicUserDto } from '../users/users.service'
import type { Response } from 'express'

@Controller('community')
export class CommunityController {
  constructor(
    private readonly communityService: CommunityService,
    private readonly uploadService: CommunityUploadService,
  ) {}

  @Get('posts')
  findFeed(@Query() query: CommunityFeedQueryDto): Promise<CommunityFeedDto> {
    return this.communityService.findFeed(query)
  }

  @Post('posts')
  @UseGuards(JwtAuthGuard)
  createPost(
    @Body() input: CreateCommunityPostDto,
    @CurrentUser() user: PublicUserDto,
  ): Promise<CommunityPostDto> {
    return this.communityService.createPost(user.id as number, input)
  }

  @Post('posts/:postId/report')
  @UseGuards(JwtAuthGuard)
  reportPost(
    @Body() input: ReportPostDto,
    @CurrentUser() user: PublicUserDto,
    @Param('postId', ParseIntPipe) postId: number,
  ): Promise<CommunityPostDto> {
    return this.communityService.reportPost(postId, user.id as number, input)
  }

  @Patch('posts/:postId/hide')
  @UseGuards(JwtAuthGuard)
  hidePost(
    @CurrentUser() user: PublicUserDto,
    @Param('postId', ParseIntPipe) postId: number,
  ): Promise<CommunityPostDto> {
    return this.communityService.hidePost(postId, user.id as number)
  }

  @Post('uploads')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  uploadMedia(@UploadedFile() file?: UploadedCommunityFile): Promise<CommunityUploadDto> {
    return this.uploadService.save(file)
  }

  @Get('uploads/:filename')
  @Header('Cache-Control', 'public, max-age=86400')
  async getUpload(@Param('filename') filename: string, @Res() response: Response): Promise<void> {
    const stream = await this.uploadService.getReadStream(filename)
    stream.pipe(response)
  }

  @Get('challenges')
  findChallenges(): Promise<CommunityChallengeDto[]> {
    return this.communityService.findChallenges()
  }

  @Post('challenges/:challengeId/join')
  @UseGuards(JwtAuthGuard)
  joinChallenge(
    @Body() input: JoinChallengeDto,
    @CurrentUser() user: PublicUserDto,
    @Param('challengeId', ParseIntPipe) challengeId: number,
  ): Promise<ChallengeLeaderboardEntryDto> {
    return this.communityService.joinChallenge(challengeId, user.id as number, input)
  }

  @Get('challenges/:challengeId/leaderboard')
  findLeaderboard(
    @Param('challengeId', ParseIntPipe) challengeId: number,
  ): Promise<ChallengeLeaderboardEntryDto[]> {
    return this.communityService.findLeaderboard(challengeId)
  }
}
