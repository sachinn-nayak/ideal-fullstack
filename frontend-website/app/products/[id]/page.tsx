'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiStar, FiArrowLeft, FiShoppingCart, FiTruck, FiShield, FiRotateCcw } from 'react-icons/fi';
import { productsAPI, transformProduct } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import Loader from '@/components/Loader';
import EmptyState from '@/components/EmptyState';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const productId = Number(params.id);
        const backendProduct = await productsAPI.getById(productId);
        const transformedProduct = transformProduct(backendProduct);
        setProduct(transformedProduct);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <EmptyState
            type="products"
            title={error || "Product not found"}
            description="The product you're looking for doesn't exist or couldn't be loaded."
            action={
              <Link
                href="/products"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Products
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const discountPercentage = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  // Get images from backend product data
  const backendProduct = product.backendData || product;
  const productImages = backendProduct.images && backendProduct.images.length > 0 
    ? backendProduct.images 
    : [product.image];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link
            href="/products"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Link>
        </nav>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {productImages && productImages.length > 0 ? (
                  <img
                    src={productImages[selectedImage] || productImages[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center hidden">
                  <span className="text-gray-500 text-lg">No Image Available</span>
                </div>
              </div>
              
              {/* Thumbnail Images */}
              {productImages && productImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {productImages.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-lg border-2 transition-colors overflow-hidden ${
                        selectedImage === index
                          ? 'border-blue-500'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center"><span class="text-gray-500 text-xs">Img</span></div>';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Category and Rating */}
              <div>
                <span className="text-sm text-blue-600 font-medium uppercase tracking-wide">
                  {product.category}
                </span>
                <div className="flex items-center mt-2">
                  <div className="flex items-center">
                    <FiStar className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="text-lg font-semibold text-gray-900 ml-1">
                      {product.rating}
                    </span>
                  </div>
                  <span className="text-gray-500 ml-2">({product.reviews} reviews)</span>
                </div>
              </div>

              {/* Product Name */}
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

              {/* Price */}
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice > product.price && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                    <span className="bg-red-100 text-red-800 text-sm font-semibold px-2 py-1 rounded-full">
                      -{discountPercentage}%
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed">{product.description}</p>

              {/* Specifications */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Specifications</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600 capitalize">{key}:</span>
                      <span className="font-medium text-gray-900">{value as string}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stock Status */}
              <div className="flex items-center space-x-2">
                <span className={`w-3 h-3 rounded-full ${
                  product.inStock ? 'bg-green-500' : 'bg-red-500'
                }`}></span>
                <span className={`text-sm font-medium ${
                  product.inStock ? 'text-green-600' : 'text-red-600'
                }`}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>

              {/* Add to Cart */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700">Quantity:</label>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="px-3 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 border-x border-gray-300 font-medium">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= 10}
                      className="px-3 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <FiShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <FiTruck className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Free Shipping</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiShield className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">1 Year Warranty</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiRotateCcw className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">30 Day Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

