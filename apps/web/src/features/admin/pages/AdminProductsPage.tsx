import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { Button } from '@mongol-beauty/ui';
import { PRODUCT_FRAGMENT } from '@/graphql/fragments';
import { DELETE_PRODUCT } from '@/graphql/mutations';

const GET_PRODUCTS = gql`
  query GetAdminProducts {
    products {
      ...ProductFragment
    }
  }
  ${PRODUCT_FRAGMENT}
`;

export function AdminProductsPage() {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useQuery(GET_PRODUCTS);
  const [deleteProduct] = useMutation(DELETE_PRODUCT, {
    onCompleted: () => {
      refetch();
    },
  });

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`"${name}" бүтээгдэхүүнийг устгах уу?`)) {
      try {
        await deleteProduct({ variables: { id } });
      } catch (err) {
        alert('Алдаа гарлаа');
      }
    }
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded-lg w-64"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <div className="text-red-500 text-4xl mb-3">⚠️</div>
          <p className="text-red-800 font-semibold mb-1">Алдаа гарлаа</p>
          <p className="text-red-600 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  const products = data?.products || [];

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            Бүтээгдэхүүн удирдах
          </h1>
          <p className="text-gray-500">{products.length} бүтээгдэхүүн</p>
        </div>
        <Button
          onClick={() => navigate('/admin/products/new')}
          className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          Шинэ бүтээгдэхүүн
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
          <p className="text-xl font-semibold text-gray-700 mb-2">Бүтээгдэхүүн байхгүй</p>
          <p className="text-gray-500 mb-6">Эхний бүтээгдэхүүнээ нэмж эхлээрэй</p>
          <Button 
            onClick={() => navigate('/admin/products/new')}
            className="shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="w-5 h-5 mr-2" />
            Эхний бүтээгдэхүүн нэмэх
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {products.map((product: any) => (
            <div
              key={product.id}
              className="bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300 overflow-hidden group"
            >
              <div className="flex items-center gap-4 p-4">
                {product.images?.[0] ? (
                  <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 flex-shrink-0 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1 truncate group-hover:text-primary-600 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="font-bold text-primary-600">{product.price.toLocaleString()}₮</span>
                    <span className="text-gray-500">•</span>
                    <span className={`font-medium ${product.stock < 10 ? 'text-red-600' : 'text-gray-600'}`}>
                      Нөөц: {product.stock}
                    </span>
                    {product.category && (
                      <>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-600 truncate">{product.category.name}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                    className="hover:bg-primary-50 hover:border-primary-300 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(product.id, product.name)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
