import { gql } from '@apollo/client';
import { PRODUCT_CARD_FRAGMENT } from './fragments';

export const GET_PRODUCTS_PAGED = gql`
  query GetProducts($categoryId: ID, $limit: Int, $offset: Int, $search: String) {
    products(categoryId: $categoryId, limit: $limit, offset: $offset, search: $search) {
      ...ProductCardFragment
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

export const GET_CATEGORY_BASIC = gql`
  query GetCategory($id: ID!) {
    category(id: $id) {
      id
      name
    }
  }
`;

export const GET_PRODUCT_DETAIL = gql`
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      name
      price
      discountedPrice
      stock
      description
      images
      skinType
      features
      category {
        id
        name
      }
    }
  }
`;

export const GET_RELATED_PRODUCTS = gql`
  query GetRelatedProducts($categoryId: ID!) {
    products(categoryId: $categoryId) {
      ...ProductCardFragment
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;
