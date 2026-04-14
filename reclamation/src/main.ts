import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Eureka } from 'eureka-js-client';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const PORT = process.env.PORT ?? 3000;

  await app.listen(PORT);

  const client = new Eureka({
    instance: {
      app: 'RECLAMATION-SERVICE',
      hostName: 'localhost',
      ipAddr: '127.0.0.1',
      port: {
        '$': PORT,
        '@enabled': true,
      },
      vipAddress: 'RECLAMATION-SERVICE',
      statusPageUrl: `http://localhost:${PORT}`,
      healthCheckUrl: `http://localhost:${PORT}`,
      dataCenterInfo: {
        name: 'MyOwn',
        '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
      },
    },
    eureka: {
      host: 'localhost',
      port: 8761,
      servicePath: '/eureka/apps/',
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