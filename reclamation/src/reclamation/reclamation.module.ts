import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { Reclamation, ReclamationSchema } from './reclamation.entity';
import { ReclamationController } from './reclamation.controller';
import { ReclamationService } from './reclamation.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Reclamation.name, schema: ReclamationSchema }]),
    AuthModule,
  ],
  controllers: [ReclamationController],
  providers: [ReclamationService],
})
export class ReclamationModule {}
