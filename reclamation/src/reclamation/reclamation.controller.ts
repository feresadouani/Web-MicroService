import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtUser } from '../auth/jwt.strategy';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateReclamationDto } from './dto/create-reclamation.dto';
import { UpdateReclamationDto } from './dto/update-reclamation.dto';
import { ReclamationService } from './reclamation.service';

@Controller('reclamations')
@UseGuards(RolesGuard)
export class ReclamationController {
  constructor(private readonly reclamationService: ReclamationService) {}

  private isAdmin(user: JwtUser): boolean {
    return user.roles.includes('CLIENT_ADMIN');
  }

  @Post()
  create(
    @Body() dto: CreateReclamationDto,
    @Req() req: Request & { user: JwtUser },
  ) {
    return this.reclamationService.create(
      dto,
      req.user,
      this.isAdmin(req.user),
    );
  }

  @Get()
  findAll(@Req() req: Request & { user: JwtUser }) {
    return this.reclamationService.findAll(req.user, this.isAdmin(req.user));
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() req: Request & { user: JwtUser },
  ) {
    return this.reclamationService.findOne(id, req.user, this.isAdmin(req.user));
  }

  @Patch(':id')
  @Roles('CLIENT_ADMIN')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateReclamationDto,
    @Req() req: Request & { user: JwtUser },
  ) {
    return this.reclamationService.update(id, dto, req.user, true);
  }

  @Delete(':id')
  @Roles('CLIENT_ADMIN')
  remove(
    @Param('id') id: string,
    @Req() req: Request & { user: JwtUser },
  ) {
    return this.reclamationService.remove(id, req.user, true);
  }
}
