import { Controller, Get, UseGuards } from '@nestjs/common'

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'

import { AdminService } from './admin.service'

import type { AdminOverviewDto } from './admin.service'

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  getOverview(): Promise<AdminOverviewDto> {
    return this.adminService.getOverview()
  }
}
