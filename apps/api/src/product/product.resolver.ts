import { Resolver, Query, Mutation, Args, ID, Int, Context, ResolveField, Root } from '@nestjs/graphql';
import { Product } from './product.entity';
import { ProductService } from './product.service';
import { CreateProductInput, UpdateProductInput } from './dto/create-product.input';
import { AuthService } from '../auth/auth.service';
import { UserType } from '../user/user.entity';

@Resolver(() => Product)
export class ProductResolver {
  constructor(
    private productService: ProductService,
    private authService: AuthService,
  ) {}

  @Query(() => [Product])
  async products(
    @Args('categoryId', { type: () => ID, nullable: true }) categoryId?: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('offset', { type: () => Int, nullable: true }) offset?: number,
    @Context() context?: any,
  ): Promise<Product[]> {
    const products = await this.productService.findAll(categoryId, limit, offset);
    // Apply discount for subscribed users
    const user = await this.getCurrentUser(context);
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
    @Context() context?: any,
  ): Promise<Product | null> {
    const product = await this.productService.findOne(id);
    if (!product) return null;

    // Apply discount for subscribed users
    const user = await this.getCurrentUser(context);
    if (user?.userType === UserType.SUBSCRIBED_USER) {
      return {
        ...product,
        discountedPrice: Math.round(product.price * 0.9), // 10% discount
      };
    }
    return product;
  }

  @ResolveField(() => Int, { nullable: true })
  async discountedPrice(@Root() product: Product, @Context() context?: any): Promise<number | null> {
    const user = await this.getCurrentUser(context);
    if (user?.userType === UserType.SUBSCRIBED_USER) {
      return Math.round(product.price * 0.9); // 10% discount
    }
    return null;
  }

  private async getCurrentUser(context: any) {
    try {
      const token = context?.req?.headers?.authorization?.replace('Bearer ', '');
      if (!token) return null;
      return await this.authService.verifyToken(token);
    } catch {
      return null;
    }
  }

  // Admin mutations
  @Mutation(() => Product)
  async createProduct(@Args('input') input: CreateProductInput): Promise<Product> {
    return this.productService.create(input);
  }

  @Mutation(() => Product)
  async updateProduct(@Args('input') input: UpdateProductInput): Promise<Product> {
    const { id, ...updateData } = input;
    return this.productService.update(id, updateData);
  }

  @Mutation(() => Boolean)
  async deleteProduct(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.productService.delete(id);
  }
}
