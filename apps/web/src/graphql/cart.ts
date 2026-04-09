import { gql } from '@apollo/client';

export const GET_MY_CART = gql`
  query GetMyCart {
    myCart {
      productId
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
      productId
      quantity
    }
  }
`;

export const REMOVE_CART_ITEM = gql`
  mutation RemoveCartItem($productId: ID!) {
    removeCartItem(productId: $productId) {
      productId
      quantity
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
      productId
      quantity
    }
  }
`;

export const GET_PRODUCTS_FOR_CART = gql`
  query GetProductsForCart {
    products {
      id
      name
      price
      images
      stock
    }
  }
`;
