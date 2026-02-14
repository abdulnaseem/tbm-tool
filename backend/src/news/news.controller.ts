// // backend/src/news/news.controller.ts
// import { Body, Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
// import { NewsService } from './news.service';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/roles.guard';
// import { Roles } from '../auth/roles.decorator';

// @Controller('news')
// @UseGuards(JwtAuthGuard, RolesGuard)
// export class NewsController {
//   constructor(private readonly newsService: NewsService) {}

//   @Get()
//   @Roles('COACH', 'ADMIN', 'SUPER_ADMIN', 'MEMBER', 'GUARDIAN')
//   findAll() {
//     return this.newsService.findAll();
//   }

//   @Post()
//   @Roles('COACH', 'ADMIN', 'SUPER_ADMIN')
//   create(@Body() dto: { title: string; body: string; gymId: string }, @Request() req) {
//     return this.newsService.create({
//       ...dto,
//       createdByUserId: req.user.sub,
//     });
//   }
// }