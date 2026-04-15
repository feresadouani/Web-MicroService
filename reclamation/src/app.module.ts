import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { AppController } from './app.controller';
import { ReclamationModule } from './reclamation/reclamation.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI ?? 'mongodb://localhost:27017/reclamation', {
      dbName: process.env.MONGO_DB ?? 'reclamation',
    }),
    AuthModule,
    ReclamationModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
