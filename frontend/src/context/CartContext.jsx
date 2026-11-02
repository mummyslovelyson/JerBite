import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

// In-memory cart state (Zero localStorage persistence)
export function CartProvider({ children }) {
  const [cart, setCart] = useState({ restaurant: null, items: [] });

  // Explicitly purge any legacy cart from browser localStorage
  useEffect(() => {
    try {
      localStorage.removeItem('cart');
    } catch {
      // Ignore if localStorage unavailable
    }
  }, []);

  const add = (restaurant, product) => {
    if (cart.restaurant && cart.restaurant.id !== restaurant.id) {
      if (!window.confirm(`Your cart has items from ${cart.restaurant.name}. Start a new cart from ${restaurant.name}?`)) return;
      setCart({
        restaurant: {
          id: restaurant.id,
          name: restaurant.name,
          delivery_fee: restaurant.delivery_fee,
          min_order: restaurant.min_order
        },
        items: [{ ...product, quantity: 1 }]
      });
      return;
    }
    setCart((c) => {
      const found = c.items.find((i) => i.id === product.id);
      const items = found
        ? c.items.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i))
        : [...c.items, { ...product, quantity: 1 }];
      return {
        restaurant: {
          id: restaurant.id,
          name: restaurant.name,
          delivery_fee: restaurant.delivery_fee,
          min_order: restaurant.min_order
        },
        items
      };
    });
  };

  const setQty = (id, quantity) =>
    setCart((c) => {
      const items = c.items
        .map((i) => (i.id === id ? { ...i, quantity } : i))
        .filter((i) => i.quantity > 0);
      return { restaurant: items.length ? c.restaurant : null, items };
    });

  const clear = () => setCart({ restaurant: null, items: [] });
  const count = cart.items.reduce((n, i) => n + i.quantity, 0);
  const subtotal = cart.items.reduce((n, i) => n + Number(i.price) * i.quantity, 0);

  return (
    <CartContext.Provider value={{ ...cart, add, setQty, clear, count, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}
