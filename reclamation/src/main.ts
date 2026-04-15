import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Eureka } from 'eureka-js-client';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const PORT = Number(process.env.PORT ?? 3000);
  const INSTANCE_HOST = process.env.INSTANCE_HOSTNAME ?? 'localhost';
  const INSTANCE_IP = process.env.INSTANCE_IP ?? '127.0.0.1';
  const EUREKA_HOST = process.env.EUREKA_HOST ?? 'localhost';
  const EUREKA_PORT = Number(process.env.EUREKA_PORT ?? 8761);
  const EUREKA_SERVICE_PATH = process.env.EUREKA_SERVICE_PATH ?? '/eureka/apps/';

  await app.listen(PORT);

  const client = new Eureka({
    instance: {
      app: 'RECLAMATION-SERVICE',
      hostName: INSTANCE_HOST,
      ipAddr: INSTANCE_IP,
      port: {
        '$': PORT,
        '@enabled': true,
      },
      vipAddress: 'RECLAMATION-SERVICE',
      statusPageUrl: `http://${INSTANCE_HOST}:${PORT}/health`,
      healthCheckUrl: `http://${INSTANCE_HOST}:${PORT}/health`,
      dataCenterInfo: {
        name: 'MyOwn',
        '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
      },
    },
    eureka: {
      host: EUREKA_HOST,
      port: EUREKA_PORT,
      servicePath: EUREKA_SERVICE_PATH,
    },
  });

  client.start((error) => {
    if (error) {
      console.log('❌ Eureka registration failed:', error);
    } else {
      console.log('✅ Registered in Eureka');
    }
  });
}

bootstrap();
