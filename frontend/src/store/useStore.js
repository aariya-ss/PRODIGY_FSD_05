import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set, get) => ({
      // Theme State
      theme: 'light',
      setTheme: (newTheme) => {
        set({ theme: newTheme });
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      // Auth State
      token: null,
      role: 'customer',
      user: null,
      setAuth: (token, role) => set({ token, role }),
      setUser: (user) => set({ user }),
      logout: () => {
        set({ token: null, role: 'customer', user: null, cart: [] });
        localStorage.removeItem('smartbuy-storage');
      },

      // Cart State
      cart: [],
      addToCart: (product, quantity = 1) => {
        const cart = get().cart;
        const existingIndex = cart.findIndex(item => item.product.id === product.id);
        
        let newCart;
        if (existingIndex >= 0) {
          newCart = [...cart];
          // Cap at product stock
          const newQty = newCart[existingIndex].quantity + quantity;
          newCart[existingIndex].quantity = Math.min(newQty, product.stock);
        } else {
          newCart = [...cart, { product, quantity: Math.min(quantity, product.stock) }];
        }
        
        set({ cart: newCart });
      },
      updateCartQuantity: (productId, quantity) => {
        const cart = get().cart;
        if (quantity <= 0) {
          set({ cart: cart.filter(item => item.product.id !== productId) });
          return;
        }
        
        const newCart = cart.map(item => {
          if (item.product.id === productId) {
            return { ...item, quantity: Math.min(quantity, item.product.stock) };
          }
          return item;
        });
        
        set({ cart: newCart });
      },
      removeFromCart: (productId) => {
        const cart = get().cart;
        set({ cart: cart.filter(item => item.product.id !== productId) });
      },
      clearCart: () => set({ cart: [] }),

      // Formatting & Calculations helpers
      formatRupees: (amount) => {
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 0
        }).format(amount);
      },

      getCartSubtotal: () => {
        const cart = get().cart;
        return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      },

      getDeliveryFee: () => {
        const subtotal = get().getCartSubtotal();
        if (subtotal === 0) return 0;
        return subtotal >= 500 ? 0 : 40; // Flat ₹40 delivery, free above ₹500
      },

      getGrandTotal: () => {
        return get().getCartSubtotal() + get().getDeliveryFee();
      },

      getAmtNeededForFreeDelivery: () => {
        const subtotal = get().getCartSubtotal();
        if (subtotal === 0) return 500;
        return Math.max(0, 500 - subtotal);
      }
    }),
    {
      name: 'smartbuy-storage', // name of item in localStorage
      partialize: (state) => ({
        theme: state.theme,
        token: state.token,
        role: state.role,
        user: state.user,
        cart: state.cart
      }),
    }
  )
);
