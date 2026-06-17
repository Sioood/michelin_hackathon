import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'

import { CurrentUser } from '../common/decorators/current-user.decorator'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'

import { CreateBikeDto } from './dto/create-bike.dto'
import { InstallTireDto } from './dto/install-tire.dto'
import { UpdateBikeDto } from './dto/update-bike.dto'
import { UpdateTireInstallationDto } from './dto/update-tire-installation.dto'
import { GarageService } from './garage.service'
import { GarageSuggestionsService } from './suggestions.service'

import type { BikeType } from './bike.model'
import type { BikeDto } from './garage.service'
import type { ProductDto } from '../products/products.service'
import type { PublicUserDto } from '../users/users.service'

interface TireInstallationParams {
  id: string
  installationId: string
}

@Controller('garage')
@UseGuards(JwtAuthGuard)
export class GarageController {
  constructor(
    private readonly garageService: GarageService,
    private readonly suggestionsService: GarageSuggestionsService,
  ) {}

  @Get('bikes')
  findAll(@CurrentUser() user: PublicUserDto): Promise<BikeDto[]> {
    return this.garageService.findAll(user.id as number)
  }

  @Post('bikes')
  create(@Body() input: CreateBikeDto, @CurrentUser() user: PublicUserDto): Promise<BikeDto> {
    return this.garageService.create(user.id as number, input)
  }

  @Get('bikes/:id')
  findOne(
    @CurrentUser() user: PublicUserDto,
    @Param('id', ParseIntPipe) bikeId: number,
  ): Promise<BikeDto> {
    return this.garageService.findForUser(user.id as number, bikeId)
  }

  @Patch('bikes/:id')
  update(
    @Body() input: UpdateBikeDto,
    @CurrentUser() user: PublicUserDto,
    @Param('id', ParseIntPipe) bikeId: number,
  ): Promise<BikeDto> {
    return this.garageService.update(user.id as number, bikeId, input)
  }

  @Delete('bikes/:id')
  async remove(
    @CurrentUser() user: PublicUserDto,
    @Param('id', ParseIntPipe) bikeId: number,
  ): Promise<{ deleted: true }> {
    await this.garageService.remove(user.id as number, bikeId)

    return { deleted: true }
  }

  @Post('bikes/:id/tires')
  installTire(
    @Body() input: InstallTireDto,
    @CurrentUser() user: PublicUserDto,
    @Param('id', ParseIntPipe) bikeId: number,
  ): Promise<BikeDto> {
    return this.garageService.installTire(user.id as number, bikeId, input)
  }

  @Patch('bikes/:id/tires/:installationId')
  updateTire(
    @Body() input: UpdateTireInstallationDto,
    @CurrentUser() user: PublicUserDto,
    @Param() params: TireInstallationParams,
  ): Promise<BikeDto> {
    return this.garageService.updateTireInstallation({
      bikeId: this.parseId(params.id),
      input,
      installationId: this.parseId(params.installationId),
      userId: user.id as number,
    })
  }

  @Delete('bikes/:id/tires/:installationId')
  removeTire(
    @CurrentUser() user: PublicUserDto,
    @Param('id', ParseIntPipe) bikeId: number,
    @Param('installationId', ParseIntPipe) installationId: number,
  ): Promise<BikeDto> {
    return this.garageService.removeTireInstallation(user.id as number, bikeId, installationId)
  }

  @Get('suggestions')
  suggest(
    @Query('type') type?: BikeType,
    @Query('diameter') diameter?: string,
  ): Promise<ProductDto[]> {
    return this.suggestionsService.suggestForBike(type, diameter)
  }

  private parseId(value: string): number {
    const parsed = Number(value)

    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new BadRequestException('Invalid id')
    }

    return parsed
  }
}
