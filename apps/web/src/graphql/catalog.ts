import { gql } from '@apollo/client';
import { PRODUCT_CARD_FRAGMENT } from './fragments';

export const GET_PRODUCTS_PAGED = gql`
  query GetProductsPaged($categoryId: ID, $limit: Int, $offset: Int, $search: String) {
    productsPaged(categoryId: $categoryId, limit: $limit, offset: $offset, search: $search) {
      items {
        ...ProductCardFragment
      }
      totalCount
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
      descriptionHtml
      images
      skinType
      features
      isKoreanProduct
      isVisible
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
