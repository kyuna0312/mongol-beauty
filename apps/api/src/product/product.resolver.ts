import { Resolver, Query, Mutation, Args, ID, Int, Context, ResolveField, Root } from '@nestjs/graphql';
import { NotFoundException, UseGuards } from '@nestjs/common';
import { Product } from './product.entity';
import { ProductService } from './product.service';
import { CreateProductInput, UpdateProductInput } from './dto/create-product.input';
import { User, UserType } from '../user/user.entity';
import { AuthService } from '../auth/auth.service';
import { GqlOptionalAuthGuard } from '../common/guards/gql-optional-auth.guard';
import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { GqlAdminGuard } from '../common/guards/gql-admin.guard';
import { Category } from '../category/category.entity';
import type { GraphqlContext } from '../types/graphql-context';

@Resolver(() => Product)
@UseGuards(GqlOptionalAuthGuard)
export class ProductResolver {
  constructor(
    private productService: ProductService,
    private authService: AuthService,
  ) {}

  /** Nested fields (e.g. category.products) skip top-level guards; fall back to the Bearer token. */
  private async requestUser(context: GraphqlContext | undefined): Promise<User | null> {
    const existing = context?.req?.user as User | null | undefined;
    if (existing) {
      return existing;
    }
    const authHeader = context?.req?.headers?.authorization as string | undefined;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : undefined;
    return this.authService.validateAccessToken(token ?? null);
  }

  @Query(() => [Product])
  async products(
    @Args('categoryId', { type: () => ID, nullable: true }) categoryId?: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('offset', { type: () => Int, nullable: true }) offset?: number,
    @Context() context?: GraphqlContext,
  ): Promise<Product[]> {
    const products = await this.productService.findAll(categoryId, limit, offset);
    const user = await this.requestUser(context);
    if (user?.userType === UserType.SUBSCRIBED_USER) {
      return products.map(p => ({
        ...p,
        discountedPrice: Math.round(p.price * 0.9), // 10% discount
      }));
    }
    return products;
  }

  @Query(() => Product, { nullable: true })
  async product(
    @Args('id', { type: () => ID }) id: string,
    @Context() context?: GraphqlContext,
  ): Promise<Product | null> {
    const product = await this.productService.findOne(id);
    if (!product) return null;

    // Apply discount for subscribed users
    const user = await this.requestUser(context);
    if (user?.userType === UserType.SUBSCRIBED_USER) {
      return {
        ...product,
        discountedPrice: Math.round(product.price * 0.9), // 10% discount
      };
    }
    return product;
  }

  @ResolveField(() => Category)
  async category(@Root() product: Product, @Context() context: GraphqlContext): Promise<Category> {
    if (product.category) {
      return product.category;
    }
    const loaded = await context.loaders.category.load(product.categoryId);
    if (!loaded) {
      throw new NotFoundException(`Category ${product.categoryId} not found`);
    }
    return loaded;
  }

  @ResolveField(() => Int, { nullable: true })
  async discountedPrice(@Root() product: Product, @Context() context?: GraphqlContext): Promise<number | null> {
    const user = await this.requestUser(context);
    if (user?.userType === UserType.SUBSCRIBED_USER) {
      return Math.round(product.price * 0.9); // 10% discount
    }
    return null;
  }

  // Admin mutations
  @Mutation(() => Product)
  @UseGuards(GqlJwtAuthGuard, GqlAdminGuard)
  async createProduct(@Args('input') input: CreateProductInput): Promise<Product> {
    return this.productService.create(input);
  }

  @Mutation(() => Product)
  @UseGuards(GqlJwtAuthGuard, GqlAdminGuard)
  async updateProduct(@Args('input') input: UpdateProductInput): Promise<Product> {
    const { id, ...updateData } = input;
    return this.productService.update(id, updateData);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlJwtAuthGuard, GqlAdminGuard)
  async deleteProduct(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.productService.delete(id);
  }
}
