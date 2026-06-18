import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { CommunityChallengeEntry } from './challenges/community-challenge-entry.model'
import { CommunityChallenge } from './challenges/community-challenge.model'
import { CommunityPost } from './community-post.model'
import { CommunityController } from './community.controller'
import { CommunityService } from './community.service'
import { CommunityPostReport } from './moderation/community-post-report.model'
import { CommunityUploadService } from './uploads/community-upload.service'

@Module({
  controllers: [CommunityController],
  imports: [
    SequelizeModule.forFeature([
      CommunityChallenge,
      CommunityChallengeEntry,
      CommunityPost,
      CommunityPostReport,
    ]),
  ],
  providers: [CommunityService, CommunityUploadService],
})
export class CommunityModule {}
