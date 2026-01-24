import { gql } from '@apollo/client';

// Product fragments for reusable query parts
export const PRODUCT_FRAGMENT = gql`
  fragment ProductFragment on Product {
    id
    name
    price
    discountedPrice
    stock
    images
    description
    skinType
    features
    category {
      id
      name
      slug
    }
  }
`;

export const PRODUCT_CARD_FRAGMENT = gql`
  fragment ProductCardFragment on Product {
    id
    name
    price
    discountedPrice
    stock
    images
    category {
      id
    }
  }
`;

export const ORDER_ITEM_FRAGMENT = gql`
  fragment OrderItemFragment on OrderItem {
    id
    quantity
    price
    product {
      id
      name
      images
      price
    }
  }
`;

export const ORDER_FRAGMENT = gql`
  fragment OrderFragment on Order {
    id
    totalPrice
    status
    paymentReceiptUrl
    createdAt
    updatedAt
    items {
      ...OrderItemFragment
    }
  }
  ${ORDER_ITEM_FRAGMENT}
`;
