import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsStorage = await AsyncStorage.getItem(
        '@GoMaerketPlace:products',
      );

      if (productsStorage) {
        setProducts([...JSON.parse(productsStorage)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productExists = products.find(p => p.id === product.id);
      let productsAdd: Product[];

      if (productExists) {
        productsAdd = products.map(p =>
          p.id === product.id ? { ...product, quantity: p.quantity + 1 } : p,
        );
      } else {
        productsAdd = [...products, { ...product, quantity: 1 }];
      }

      setProducts(productsAdd);
      await AsyncStorage.setItem(
        '@GoMaerketPlace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productsIncrement = products.map(product =>
        product.id === id
          ? { ...product, quantity: product.quantity + 1 }
          : product,
      );

      setProducts(productsIncrement);
      await AsyncStorage.setItem(
        '@GoMaerketPlace:products',
        JSON.stringify(productsIncrement),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productsDecrement = products.map(product => {
        if (product.id === id && product.quantity > 0) {
          return { ...product, quantity: product.quantity - 1 };
        }
        return product;
      });

      setProducts(productsDecrement);
      await AsyncStorage.setItem(
        '@GoMaerketPlace:products',
        JSON.stringify(productsDecrement),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
