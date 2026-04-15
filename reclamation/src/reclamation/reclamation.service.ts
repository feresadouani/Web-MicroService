import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { JwtUser } from '../auth/jwt.strategy';
import { CreateReclamationDto } from './dto/create-reclamation.dto';
import { UpdateReclamationDto } from './dto/update-reclamation.dto';
import {
  Reclamation,
  ReclamationDocument,
  ReclamationStatus,
} from './reclamation.entity';

const ALLOWED: ReclamationStatus[] = [
  'OPEN',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
];

@Injectable()
export class ReclamationService {
  constructor(
    @InjectModel(Reclamation.name)
    private readonly model: Model<ReclamationDocument>,
  ) {}

  private ensureObjectId(id: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Identifiant de réclamation invalide');
    }
    return new Types.ObjectId(id);
  }

  private parseStatus(raw?: string): ReclamationStatus | undefined {
    if (raw == null || raw === '') {
      return undefined;
    }
    const u = raw.toUpperCase() as ReclamationStatus;
    if (!ALLOWED.includes(u)) {
      return undefined;
    }
    return u;
  }

  async create(
    dto: CreateReclamationDto,
    user: JwtUser,
    isAdmin: boolean,
  ): Promise<ReclamationDocument> {
    const status = isAdmin
      ? (this.parseStatus(dto.status) ?? 'OPEN')
      : 'OPEN';
    return this.model.create({
      title: dto.title.trim(),
      description: dto.description.trim(),
      status,
      authorSub: user.sub,
    });
  }

  async findAll(user: JwtUser, isAdmin: boolean): Promise<ReclamationDocument[]> {
    if (isAdmin) {
      return this.model.find().sort({ createdAt: -1 }).exec();
    }
    return this.model.find({ authorSub: user.sub }).sort({ createdAt: -1 }).exec();
  }

  async findOne(
    id: string,
    user: JwtUser,
    isAdmin: boolean,
  ): Promise<ReclamationDocument> {
    const row = await this.model.findById(this.ensureObjectId(id)).exec();
    if (!row) {
      throw new NotFoundException(`Réclamation ${id} introuvable`);
    }
    if (!isAdmin && row.authorSub !== user.sub) {
      throw new ForbiddenException();
    }
    return row;
  }

  async update(
    id: string,
    dto: UpdateReclamationDto,
    user: JwtUser,
    isAdmin: boolean,
  ): Promise<ReclamationDocument> {
    const row = await this.findOne(id, user, isAdmin);
    if (dto.title != null) {
      row.title = dto.title.trim();
    }
    if (dto.description != null) {
      row.description = dto.description.trim();
    }
    if (dto.status != null) {
      const s = this.parseStatus(dto.status);
      if (!s) {
        throw new ForbiddenException('Statut invalide');
      }
      row.status = s;
    }
    await row.save();
    return row;
  }

  async remove(id: string, user: JwtUser, isAdmin: boolean): Promise<void> {
    const row = await this.findOne(id, user, isAdmin);
    await row.deleteOne();
  }
}
