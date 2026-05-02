import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Category } from './category.entity';
import { CategoryService } from './category.service';
import { CreateCategoryInput, UpdateCategoryInput } from './dto/create-category.input';
import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { GqlAdminGuard } from '../common/guards/gql-admin.guard';

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private categoryService: CategoryService) {}

  @Query(() => [Category])
  async categories(): Promise<Category[]> {
    return this.categoryService.findAll();
  }

  @Query(() => [Category])
  async categoriesTree(): Promise<Category[]> {
    return this.categoryService.findTree();
  }

  @Query(() => Category, { nullable: true })
  async category(@Args('id', { type: () => ID }) id: string): Promise<Category> {
    return this.categoryService.findOne(id);
  }

  // Admin mutations
  @Mutation(() => Category)
  @UseGuards(GqlJwtAuthGuard, GqlAdminGuard)
  async createCategory(@Args('input') input: CreateCategoryInput): Promise<Category> {
    return this.categoryService.create(input);
  }

  @Mutation(() => Category)
  @UseGuards(GqlJwtAuthGuard, GqlAdminGuard)
  async updateCategory(@Args('input') input: UpdateCategoryInput): Promise<Category> {
    const { id, ...updateData } = input;
    return this.categoryService.update(id, updateData);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlJwtAuthGuard, GqlAdminGuard)
  async deleteCategory(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.categoryService.delete(id);
  }

  @ResolveField(() => [Category])
  async children(@Parent() cat: Category): Promise<Category[]> {
    return this.categoryService.findChildren(cat.id);
  }
}
