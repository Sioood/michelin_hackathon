import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'

import { OrderItem } from '../orders/order-item.model'
import { Order } from '../orders/order.model'
import { Product } from '../products/product.model'
import { ProductsService } from '../products/products.service'

import { BikeTireInstallation } from './bike-tire-installation.model'
import { Bike } from './bike.model'
import { GarageReminderService } from './reminder.service'

import type { TirePosition } from './bike-tire-installation.model'
import type { BikeType } from './bike.model'
import type { CreateBikeDto } from './dto/create-bike.dto'
import type { InstallTireDto } from './dto/install-tire.dto'
import type { UpdateBikeDto } from './dto/update-bike.dto'
import type { UpdateTireInstallationDto } from './dto/update-tire-installation.dto'
import type { GarageReminderDto } from './reminder.service'
import type { ProductDto } from '../products/products.service'

export interface TireInstallationDto {
  id: number
  bikeId: number
  currentDistanceKm: number
  distanceKmAtInstall: number
  installedAt: Date
  notes: string | null
  orderId: number | null
  orderItemId: number | null
  position: TirePosition
  product: ProductDto
  productId: number
  reminder: GarageReminderDto | null
}

export interface BikeDto {
  id: number
  annualDistanceKm: number
  brand: string | null
  model: string | null
  name: string
  reminders: GarageReminderDto[]
  tireInstallations: TireInstallationDto[]
  type: BikeType
  userId: number
  wheelDiameter: string | null
}

interface UpdateTireInstallationRequest {
  bikeId: number
  input: UpdateTireInstallationDto
  installationId: number
  userId: number
}

@Injectable()
export class GarageService {
  @InjectModel(Bike)
  private readonly bikeModel!: typeof Bike

  @InjectModel(BikeTireInstallation)
  private readonly tireInstallationModel!: typeof BikeTireInstallation

  @InjectModel(OrderItem)
  private readonly orderItemModel!: typeof OrderItem

  constructor(
    private readonly productsService: ProductsService,
    private readonly reminderService: GarageReminderService,
  ) {}

  async findAll(userId: number): Promise<BikeDto[]> {
    const bikes = await this.bikeModel.findAll({
      include: this.includeTires(),
      order: [['createdAt', 'DESC']],
      where: { userId },
    })

    return bikes.map((bike) => this.toBikeDto(bike))
  }

  async create(userId: number, input: CreateBikeDto): Promise<BikeDto> {
    const bike = await this.bikeModel.create({
      annualDistanceKm: input.annualDistanceKm ?? 2500,
      brand: input.brand ?? null,
      model: input.model ?? null,
      name: input.name,
      type: input.type,
      userId,
      wheelDiameter: input.wheelDiameter ?? null,
    })

    return this.findForUser(userId, this.requireBikeId(bike))
  }

  async findForUser(userId: number, bikeId: number): Promise<BikeDto> {
    const bike = await this.findBikeModel(userId, bikeId)

    return this.toBikeDto(bike)
  }

  async update(userId: number, bikeId: number, input: UpdateBikeDto): Promise<BikeDto> {
    const bike = await this.findBikeModel(userId, bikeId)
    await bike.update({
      annualDistanceKm: input.annualDistanceKm ?? bike.annualDistanceKm,
      brand: input.brand ?? bike.brand,
      model: input.model ?? bike.model,
      name: input.name ?? bike.name,
      type: input.type ?? bike.type,
      wheelDiameter: input.wheelDiameter ?? bike.wheelDiameter,
    })

    return this.findForUser(userId, bikeId)
  }

  async remove(userId: number, bikeId: number): Promise<void> {
    const bike = await this.findBikeModel(userId, bikeId)
    await this.tireInstallationModel.destroy({ where: { bikeId } })
    await bike.destroy()
  }

  async installTire(userId: number, bikeId: number, input: InstallTireDto): Promise<BikeDto> {
    const bike = await this.findBikeModel(userId, bikeId)
    const product = await this.productsService.findModelById(input.productId)
    const orderLink = await this.resolveOrderLink(userId, input)

    await this.tireInstallationModel.create({
      bikeId: this.requireBikeId(bike),
      currentDistanceKm: input.currentDistanceKm ?? input.distanceKmAtInstall ?? 0,
      distanceKmAtInstall: input.distanceKmAtInstall ?? 0,
      installedAt: input.installedAt === undefined ? new Date() : new Date(input.installedAt),
      notes: input.notes ?? null,
      orderId: orderLink.orderId,
      orderItemId: orderLink.orderItemId,
      position: input.position ?? 'both',
      productId: product.id as number,
    })

    return this.findForUser(userId, bikeId)
  }

  async updateTireInstallation(request: UpdateTireInstallationRequest): Promise<BikeDto> {
    const { bikeId, input, installationId, userId } = request

    await this.findBikeModel(userId, bikeId)
    const installation = await this.findInstallationModel(bikeId, installationId)
    await installation.update({
      currentDistanceKm: input.currentDistanceKm ?? installation.currentDistanceKm,
      distanceKmAtInstall: input.distanceKmAtInstall ?? installation.distanceKmAtInstall,
      installedAt:
        input.installedAt === undefined ? installation.installedAt : new Date(input.installedAt),
      notes: input.notes ?? installation.notes,
      position: input.position ?? installation.position,
    })

    return this.findForUser(userId, bikeId)
  }

  async removeTireInstallation(
    userId: number,
    bikeId: number,
    installationId: number,
  ): Promise<BikeDto> {
    await this.findBikeModel(userId, bikeId)
    const installation = await this.findInstallationModel(bikeId, installationId)
    await installation.destroy()

    return this.findForUser(userId, bikeId)
  }

  private async findBikeModel(userId: number, bikeId: number): Promise<Bike> {
    const bike = await this.bikeModel.findOne({
      include: this.includeTires(),
      where: { id: bikeId, userId },
    })

    if (bike === null) {
      throw new NotFoundException('Bike not found')
    }

    return bike
  }

  private async findInstallationModel(
    bikeId: number,
    installationId: number,
  ): Promise<BikeTireInstallation> {
    const installation = await this.tireInstallationModel.findOne({
      where: { bikeId, id: installationId },
    })

    if (installation === null) {
      throw new NotFoundException('Tire installation not found')
    }

    return installation
  }

  private async resolveOrderLink(
    userId: number,
    input: InstallTireDto,
  ): Promise<{ orderId: number | null; orderItemId: number | null }> {
    if (input.orderId === undefined && input.orderItemId === undefined) {
      return { orderId: null, orderItemId: null }
    }

    if (input.orderId === undefined || input.orderItemId === undefined) {
      throw new BadRequestException('orderId and orderItemId must be provided together')
    }

    const orderItem = await this.orderItemModel.findOne({
      include: [{ model: Order, where: { id: input.orderId, userId } }],
      where: { id: input.orderItemId, productId: input.productId },
    })

    if (orderItem === null) {
      throw new BadRequestException('Order item does not match this user and product')
    }

    return { orderId: input.orderId, orderItemId: input.orderItemId }
  }

  private includeTires() {
    return [{ include: [Product, Order, OrderItem], model: BikeTireInstallation }]
  }

  private toBikeDto(bike: Bike): BikeDto {
    const tireInstallations =
      bike.tireInstallations?.map((installation) => this.toTireInstallationDto(installation)) ?? []

    return {
      annualDistanceKm: bike.annualDistanceKm,
      brand: bike.brand,
      id: this.requireBikeId(bike),
      model: bike.model,
      name: bike.name,
      reminders: tireInstallations
        .map((installation) => installation.reminder)
        .filter((reminder): reminder is GarageReminderDto => reminder !== null),
      tireInstallations,
      type: bike.type,
      userId: bike.userId,
      wheelDiameter: bike.wheelDiameter,
    }
  }

  private toTireInstallationDto(installation: BikeTireInstallation): TireInstallationDto {
    if (installation.id === undefined || installation.product === undefined) {
      throw new BadRequestException('Invalid tire installation')
    }

    return {
      bikeId: installation.bikeId,
      currentDistanceKm: installation.currentDistanceKm,
      distanceKmAtInstall: installation.distanceKmAtInstall,
      id: installation.id,
      installedAt: installation.installedAt,
      notes: installation.notes,
      orderId: installation.orderId,
      orderItemId: installation.orderItemId,
      position: installation.position,
      product: installation.product.toJSON<ProductDto>(),
      productId: installation.productId,
      reminder: this.reminderService.createReminder(installation),
    }
  }

  private requireBikeId(bike: Bike): number {
    if (bike.id === undefined) {
      throw new BadRequestException('Invalid bike')
    }

    return bike.id
  }
}
