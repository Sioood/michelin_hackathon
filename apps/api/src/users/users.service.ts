import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'

import { User } from './user.model'

import type { UserAttributes, UserCreationAttributes } from './user.model'

export type PublicUserDto = Omit<UserAttributes, 'passwordHash'>

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {}

  async create(input: UserCreationAttributes): Promise<User> {
    const existingUser = await this.userModel.findOne({
      where: { email: input.email.toLowerCase() },
    })

    if (existingUser !== null) {
      throw new ConflictException('Email already registered')
    }

    return this.userModel.create({
      ...input,
      email: input.email.toLowerCase(),
    })
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ where: { email: email.toLowerCase() } })
  }

  async findById(id: number): Promise<User> {
    const user = await this.userModel.findByPk(id)

    if (user === null) {
      throw new NotFoundException('User not found')
    }

    return user
  }

  toPublicUser(user: User): PublicUserDto {
    const json = user.toJSON<UserAttributes>()
    const { passwordHash: _passwordHash, ...publicUser } = json

    return publicUser
  }
}
