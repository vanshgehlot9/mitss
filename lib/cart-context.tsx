"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './auth-context'

export interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image: string
  category: string
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (item: Omit<CartItem, 'quantity'>) => void
  removeFromCart: (id: number) => void
  updateQuantity: (id: number, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  syncCartWithDB: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const { user } = useAuth ? useAuth() : { user: null }

  // Load cart from localStorage or MongoDB API
  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        // Load from MongoDB for logged-in users
        try {
          const response = await fetch('/api/cart', {
            headers: {
              'x-user-id': user.uid
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            const dbCart = data.items || []
            
            // Merge with localStorage cart if exists
            const localCart = localStorage.getItem('mitss-cart')
            if (localCart) {
              const parsedLocalCart = JSON.parse(localCart)
              const mergedCart = mergeCart(dbCart, parsedLocalCart)
              setCart(mergedCart)
              // Save merged cart to MongoDB
              await fetch('/api/cart', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-user-id': user.uid
                },
                body: JSON.stringify({ items: mergedCart })
              })
              // Clear localStorage
              localStorage.removeItem('mitss-cart')
            } else {
              setCart(dbCart)
            }
          } else {
            // Check localStorage
            const localCart = localStorage.getItem('mitss-cart')
            if (localCart) {
              const parsedCart = JSON.parse(localCart)
              setCart(parsedCart)
              // Save to MongoDB
              await fetch('/api/cart', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-user-id': user.uid
                },
                body: JSON.stringify({ items: parsedCart })
              })
              localStorage.removeItem('mitss-cart')
            }
          }
        } catch (error) {
          console.error('Error loading cart from MongoDB:', error)
          // Fallback to localStorage
          const savedCart = localStorage.getItem('mitss-cart')
          if (savedCart) {
            setCart(JSON.parse(savedCart))
          }
        }
      } else {
        // Load from localStorage for non-logged-in users
        const savedCart = localStorage.getItem('mitss-cart')
        if (savedCart) {
          setCart(JSON.parse(savedCart))
        }
      }
    }

    loadCart()
  }, [user])

  // Helper function to merge carts
  const mergeCart = (dbCart: CartItem[], localCart: CartItem[]): CartItem[] => {
    const merged = [...dbCart]
    
    localCart.forEach(localItem => {
      const existingIndex = merged.findIndex(item => item.id === localItem.id)
      if (existingIndex >= 0) {
        // Increase quantity if item exists
        merged[existingIndex].quantity += localItem.quantity
      } else {
        // Add new item
        merged.push(localItem)
      }
    })
    
    return merged
  }

  // Save cart to MongoDB or localStorage
  const saveCart = async (newCart: CartItem[]) => {
    if (user) {
      try {
        await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.uid
          },
          body: JSON.stringify({ items: newCart })
        })
      } catch (error) {
        console.error('Error saving cart to MongoDB:', error)
        // Fallback to localStorage
        localStorage.setItem('mitss-cart', JSON.stringify(newCart))
      }
    } else {
      localStorage.setItem('mitss-cart', JSON.stringify(newCart))
    }
  }

  // Sync cart with database (called when cart changes)
  useEffect(() => {
    if (cart.length >= 0) {
      saveCart(cart)
    }
  }, [cart, user])

  // Sync cart with DB manually
  const syncCartWithDB = async () => {
    if (user) {
      await saveCart(cart)
    }
  }

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id)
      
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      }
      
      return [...prevCart, { ...item, quantity: 1 }]
    })
  }

  const removeFromCart = (id: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id))
  }

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        syncCartWithDB,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
