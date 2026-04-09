import { useMutation, useQuery } from '@apollo/client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from './useAuth';
import { CLEAR_CART, GET_MY_CART, MERGE_CART, REMOVE_CART_ITEM, SET_CART_ITEM } from '@/graphql/cart';
import { LocalCartItem } from '@/interfaces/cart';

export function useCart() {
  const { isAuthenticated } = useAuth();

  const { data, loading, refetch } = useQuery(GET_MY_CART, {
    skip: !isAuthenticated,
    fetchPolicy: 'cache-and-network',
  });

  const [setCartItemMutation] = useMutation(SET_CART_ITEM);
  const [removeCartItemMutation] = useMutation(REMOVE_CART_ITEM);
  const [clearCartMutation] = useMutation(CLEAR_CART);
  const [mergeCartMutation] = useMutation(MERGE_CART);

  const [localCart, setLocalCart] = useState<LocalCartItem[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const load = () => setLocalCart(JSON.parse(localStorage.getItem('cart') || '[]'));
    load();
    window.addEventListener('cartUpdated', load);
    return () => window.removeEventListener('cartUpdated', load);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !isAuthenticated) return;
    const refresh = () => {
      refetch();
    };
    window.addEventListener('cartUpdated', refresh);
    return () => window.removeEventListener('cartUpdated', refresh);
  }, [isAuthenticated, refetch]);

  const items = useMemo(
    () =>
      isAuthenticated
        ? (data?.myCart ?? []).map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product?.price ?? 0,
            product: item.product,
          }))
        : localCart,
    [isAuthenticated, data, localCart],
  );

  const count = useMemo(
    () => items.reduce((sum: number, item: any) => sum + item.quantity, 0),
    [items],
  );
  const getCount = useCallback(() => count, [count]);

  const setItem = async (productId: string, quantity: number, fallbackPrice?: number) => {
    if (isAuthenticated) {
      await setCartItemMutation({ variables: { productId, quantity } });
      await refetch();
      window.dispatchEvent(new Event('cartUpdated'));
      return;
    }

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find((i: LocalCartItem) => i.productId === productId);
    const normalizedQty = Math.max(0, quantity);
    if (existing) {
      if (normalizedQty === 0) {
        const filtered = cart.filter((i: LocalCartItem) => i.productId !== productId);
        localStorage.setItem('cart', JSON.stringify(filtered));
        setLocalCart(filtered);
      } else {
        existing.quantity = normalizedQty;
        localStorage.setItem('cart', JSON.stringify(cart));
        setLocalCart(cart);
      }
    } else if (normalizedQty > 0) {
      cart.push({ productId, quantity: normalizedQty, price: fallbackPrice || 0 });
      localStorage.setItem('cart', JSON.stringify(cart));
      setLocalCart(cart);
    }
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeItem = async (productId: string) => {
    if (isAuthenticated) {
      await removeCartItemMutation({ variables: { productId } });
      await refetch();
      window.dispatchEvent(new Event('cartUpdated'));
      return;
    }
    const cart = JSON.parse(localStorage.getItem('cart') || '[]').filter(
      (i: LocalCartItem) => i.productId !== productId,
    );
    localStorage.setItem('cart', JSON.stringify(cart));
    setLocalCart(cart);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const clear = async () => {
    if (isAuthenticated) {
      await clearCartMutation();
      await refetch();
      window.dispatchEvent(new Event('cartUpdated'));
      return;
    }
    localStorage.removeItem('cart');
    setLocalCart([]);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const mergeLocalCartToServer = async () => {
    if (!isAuthenticated || typeof window === 'undefined') return;
    const local = JSON.parse(localStorage.getItem('cart') || '[]') as LocalCartItem[];
    if (!local.length) return;
    await mergeCartMutation({
      variables: {
        items: local.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      },
    });
    localStorage.removeItem('cart');
    setLocalCart([]);
    await refetch();
    window.dispatchEvent(new Event('cartUpdated'));
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
