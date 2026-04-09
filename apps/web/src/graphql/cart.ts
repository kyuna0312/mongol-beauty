import { gql } from '@apollo/client';

export const GET_MY_CART = gql`
  query GetMyCart {
    myCart {
      quantity
      product {
        id
        name
        price
        images
        stock
      }
    }
  }
`;

export const SET_CART_ITEM = gql`
  mutation SetCartItem($productId: ID!, $quantity: Int!) {
    setCartItem(productId: $productId, quantity: $quantity) {
      id
      quantity
      product {
        id
      }
    }
  }
`;

export const REMOVE_CART_ITEM = gql`
  mutation RemoveCartItem($productId: ID!) {
    removeCartItem(productId: $productId) {
      id
      quantity
      product {
        id
      }
    }
  }
`;

export const CLEAR_CART = gql`
  mutation ClearCart {
    clearCart
  }
`;

export const MERGE_CART = gql`
  mutation MergeCart($items: [CartItemInput!]!) {
    mergeCart(items: $items) {
      id
      quantity
      product {
        id
      }
    }
  }
`;

export const GET_PRODUCTS_FOR_CART = gql`
  query GetProductsForCart($ids: [ID!]!) {
    productsByIds(ids: $ids) {
      id
      name
      price
      images
      stock
    }
  }
`;
