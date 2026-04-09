import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useCallback, useEffect, useMemo } from 'react';
import { useAuth } from './useAuth';
import { CLEAR_CART, GET_MY_CART, MERGE_CART, REMOVE_CART_ITEM, SET_CART_ITEM } from '@/graphql/cart';
import type { GetMyCartQuery } from '@/graphql/generated/graphql';
import { LocalCartItem } from '@/interfaces/cart';
import {
  clearLocalCart,
  hydrateLocalCartFromStorage,
  localCartVar,
  removeLocalCartItem,
  upsertLocalCartItem,
} from '@/features/cart/store';

export function useCart() {
  const { isAuthenticated } = useAuth();

  const { data, loading, refetch } = useQuery<GetMyCartQuery>(GET_MY_CART, {
    skip: !isAuthenticated,
    fetchPolicy: 'cache-and-network',
  });

  const [setCartItemMutation] = useMutation(SET_CART_ITEM);
  const [removeCartItemMutation] = useMutation(REMOVE_CART_ITEM);
  const [clearCartMutation] = useMutation(CLEAR_CART);
  const [mergeCartMutation] = useMutation(MERGE_CART);

  const localCart = useReactiveVar(localCartVar);

  useEffect(() => {
    hydrateLocalCartFromStorage();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      void refetch();
    }
  }, [isAuthenticated, refetch]);

  const items = useMemo(
    () =>
      isAuthenticated
        ? (data?.myCart ?? []).map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product?.price ?? 0,
            product: item.product,
          }))
        : localCart,
    [isAuthenticated, data, localCart],
  );

  const count = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );
  const getCount = useCallback(() => count, [count]);

  const setItem = async (productId: string, quantity: number, fallbackPrice?: number) => {
    if (isAuthenticated) {
      await setCartItemMutation({ variables: { productId, quantity } });
      await refetch();
      return;
    }
    upsertLocalCartItem(productId, quantity, fallbackPrice || 0);
  };

  const removeItem = async (productId: string) => {
    if (isAuthenticated) {
      await removeCartItemMutation({ variables: { productId } });
      await refetch();
      return;
    }
    removeLocalCartItem(productId);
  };

  const clear = async () => {
    if (isAuthenticated) {
      await clearCartMutation();
      await refetch();
      return;
    }
    clearLocalCart();
  };

  const mergeLocalCartToServer = async () => {
    if (!isAuthenticated || typeof window === 'undefined') return;
    const local = localCartVar() as LocalCartItem[];
    if (!local.length) return;
    await mergeCartMutation({
      variables: {
        items: local.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      },
    });
    clearLocalCart();
    await refetch();
  };

  return {
    items,
    loading,
    refetch,
    count,
    getCount,
    setItem,
    removeItem,
    clear,
    mergeLocalCartToServer,
  };
}
