import { Args, ID, Int, Mutation, Query, Resolver, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CartItem } from './cart-item.entity';
import { CartService } from './cart.service';
import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { User } from '../user/user.entity';
import { CartItemInput } from './dto/cart-item.input';

@Resolver(() => CartItem)
@UseGuards(GqlJwtAuthGuard)
export class CartResolver {
  constructor(private readonly cartService: CartService) {}

  @Query(() => [CartItem])
  async myCart(@Context() ctx: any): Promise<CartItem[]> {
    const user = ctx.req.user as User;
    return this.cartService.getMyCart(user.id);
  }

  @Mutation(() => [CartItem])
  async setCartItem(
    @Args('productId', { type: () => ID }) productId: string,
    @Args('quantity', { type: () => Int }) quantity: number,
    @Context() ctx: any,
  ): Promise<CartItem[]> {
    const user = ctx.req.user as User;
    return this.cartService.setItem(user.id, productId, quantity);
  }

  @Mutation(() => [CartItem])
  async mergeCart(
    @Args({ name: 'items', type: () => [CartItemInput] }) items: CartItemInput[],
    @Context() ctx: any,
  ): Promise<CartItem[]> {
    const user = ctx.req.user as User;
    return this.cartService.mergeCart(user.id, items);
  }

  @Mutation(() => [CartItem])
  async removeCartItem(
    @Args('productId', { type: () => ID }) productId: string,
    @Context() ctx: any,
  ): Promise<CartItem[]> {
    const user = ctx.req.user as User;
    return this.cartService.removeItem(user.id, productId);
  }

  @Mutation(() => Boolean)
  async clearCart(@Context() ctx: any): Promise<boolean> {
    const user = ctx.req.user as User;
    return this.cartService.clearCart(user.id);
  }
}
