import { randomUUID } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { access, mkdir, writeFile } from 'node:fs/promises'
import { extname, join } from 'node:path'

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'

export interface UploadedCommunityFile {
  buffer: Buffer
  mimetype: string
  originalname: string
  size: number
}

export interface CommunityUploadDto {
  mediaUrl: string
}

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'video/mp4'])
const maxUploadSizeBytes = 8 * 1024 * 1024

@Injectable()
export class CommunityUploadService {
  private readonly uploadDir = join(process.cwd(), 'uploads/community')

  async save(file: UploadedCommunityFile | undefined): Promise<CommunityUploadDto> {
    if (file === undefined) {
      throw new BadRequestException('Missing upload file')
    }

    if (!allowedMimeTypes.has(file.mimetype)) {
      throw new BadRequestException('Unsupported media type')
    }

    if (file.size > maxUploadSizeBytes) {
      throw new BadRequestException('File is too large')
    }

    await mkdir(this.uploadDir, { recursive: true })

    const extension = this.getExtension(file)
    const filename = `${Date.now()}-${randomUUID()}${extension}`
    await writeFile(join(this.uploadDir, filename), file.buffer)

    return { mediaUrl: `/community/uploads/${filename}` }
  }

  async getReadStream(filename: string): Promise<NodeJS.ReadableStream> {
    if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
      throw new NotFoundException('Upload not found')
    }

    const path = join(this.uploadDir, filename)

    try {
      await access(path)
    } catch {
      throw new NotFoundException('Upload not found')
    }

    return createReadStream(path)
  }

  private getExtension(file: UploadedCommunityFile): string {
    const extension = extname(file.originalname).toLowerCase()

    if (extension.length > 0 && ['.jpg', '.jpeg', '.png', '.webp', '.mp4'].includes(extension)) {
      return extension
    }

    if (file.mimetype === 'image/png') return '.png'
    if (file.mimetype === 'image/webp') return '.webp'
    if (file.mimetype === 'video/mp4') return '.mp4'

    return '.jpg'
  }
}
