import { Module } from '@nestjs/common';

import { BlogService } from './blog.service';
import { PostsController } from './posts.controller';
import { CategoriesController } from './categories.controller';
import { BlogPublicController } from './blog-public.controller';

@Module({
  controllers: [PostsController, CategoriesController, BlogPublicController],
  providers: [BlogService],
})
export class BlogModule {}
