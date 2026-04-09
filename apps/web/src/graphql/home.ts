import { gql } from '@apollo/client';
import { PRODUCT_CARD_FRAGMENT } from './fragments';

export const GET_HOME_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      slug
      imageUrl
    }
  }
`;

export const GET_FEATURED_PRODUCTS = gql`
  query GetFeaturedProducts {
    products(limit: 8) {
      ...ProductCardFragment
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;
