import { create } from 'zustand';

export const useStore = create((set, get) => {
  // Read initial states from localStorage
  const storedTheme = localStorage.getItem('theme');
  const initialDarkMode = storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  // Apply initial theme class to HTML/Body
  if (initialDarkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  const storedCart = localStorage.getItem('cart');
  const initialCart = storedCart ? JSON.parse(storedCart) : [];

  const storedToken = localStorage.getItem('auth_token');
  const storedUser = localStorage.getItem('auth_user');
  const initialToken = storedToken || null;
  const initialUser = storedUser ? JSON.parse(storedUser) : null;

  return {
    // --- THEME STATE ---
    darkMode: initialDarkMode,
    toggleTheme: () => {
      const nextMode = !get().darkMode;
      localStorage.setItem('theme', nextMode ? 'dark' : 'light');
      if (nextMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      set({ darkMode: nextMode });
    },

    // --- AUTH STATE ---
    user: initialUser,
    token: initialToken,
    setAuth: (user, token) => {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
      set({ user, token });
    },
    clearAuth: () => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      set({ user: null, token: null });
    },

    // --- CART STATE ---
    cart: initialCart,
    addToCart: (product, quantity = 1) => {
      const currentCart = get().cart;
      const existingItem = currentCart.find((item) => item.id === product.id);
      
      let updatedCart;
      if (existingItem) {
        // Enforce stock limits
        const newQty = existingItem.quantity + quantity;
        if (newQty > product.stock) {
          throw new Error(`Cannot add more than available stock (${product.stock} items available)`);
        }
        updatedCart = currentCart.map((item) =>
          item.id === product.id ? { ...item, quantity: newQty } : item
        );
      } else {
        if (quantity > product.stock) {
          throw new Error(`Cannot add more than available stock (${product.stock} items available)`);
        }
        updatedCart = [...currentCart, { ...product, quantity }];
      }

      localStorage.setItem('cart', JSON.stringify(updatedCart));
      set({ cart: updatedCart });
    },
    removeFromCart: (productId) => {
      const updatedCart = get().cart.filter((item) => item.id !== productId);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      set({ cart: updatedCart });
    },
    updateQuantity: (productId, quantity) => {
      if (quantity <= 0) {
        get().removeFromCart(productId);
        return;
      }
      
      const currentCart = get().cart;
      const updatedCart = currentCart.map((item) => {
        if (item.id === productId) {
          if (quantity > item.stock) {
            throw new Error(`Cannot add more than available stock (${item.stock} items available)`);
          }
          return { ...item, quantity };
        }
        return item;
      });

      localStorage.setItem('cart', JSON.stringify(updatedCart));
      set({ cart: updatedCart });
    },
    clearCart: () => {
      localStorage.removeItem('cart');
      set({ cart: [] });
    },

    // --- CART CALCULATIONS ---
    getCartSubtotal: () => {
      return get().cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    },
    getCartTax: () => {
      return get().getCartSubtotal() * 0.08; // 8% sales tax
    },
    getCartDelivery: () => {
      const subtotal = get().getCartSubtotal();
      if (subtotal === 0) return 0;
      return subtotal >= 100 ? 0 : 5.00; // Free delivery for orders $100+
    },
    getCartTotal: () => {
      return get().getCartSubtotal() + get().getCartTax() + get().getCartDelivery();
    },

    // --- DATA STATE ---
    products: [],
    setProducts: (products) => set({ products }),
    orders: [],
    setOrders: (orders) => set({ orders }),
  };
});
