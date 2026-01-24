import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { Category } from './category.entity';
import { CategoryService } from './category.service';
import { CreateCategoryInput, UpdateCategoryInput } from './dto/create-category.input';

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private categoryService: CategoryService) {}

  @Query(() => [Category])
  async categories(): Promise<Category[]> {
    return this.categoryService.findAll();
  }

  @Query(() => Category, { nullable: true })
  async category(@Args('id', { type: () => ID }) id: string): Promise<Category> {
    return this.categoryService.findOne(id);
  }

  // Admin mutations
  @Mutation(() => Category)
  async createCategory(@Args('input') input: CreateCategoryInput): Promise<Category> {
    return this.categoryService.create(input);
  }

  @Mutation(() => Category)
  async updateCategory(@Args('input') input: UpdateCategoryInput): Promise<Category> {
    const { id, ...updateData } = input;
    return this.categoryService.update(id, updateData);
  }

  @Mutation(() => Boolean)
  async deleteCategory(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.categoryService.delete(id);
  }
}
