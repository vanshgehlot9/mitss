import { db } from './firebase'
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  arrayUnion,
  arrayRemove,
  addDoc
} from 'firebase/firestore'

export interface WishlistItem {
  id: string
  userId: string
  productId: number
  productName: string
  productImage: string
  currentPrice: number
  originalPrice: number
  addedAt: Date
  priceAlertEnabled: boolean
  targetPrice?: number
  stockAlertEnabled: boolean
  isAvailable: boolean
  variantId?: string
  notes?: string
}

export interface SharedWishlist {
  id: string
  ownerId: string
  ownerName: string
  shareCode: string
  items: number[] // productIds
  isPublic: boolean
  createdAt: Date
  expiresAt?: Date
  views: number
}

export interface PriceAlert {
  id: string
  userId: string
  productId: number
  targetPrice: number
  currentPrice: number
  isActive: boolean
  createdAt: Date
  notifiedAt?: Date
}

export interface StockAlert {
  id: string
  userId: string
  productId: number
  variantId?: string
  isActive: boolean
  createdAt: Date
  notifiedAt?: Date
}

// Add item to wishlist
export async function addToWishlist(
  userId: string,
  productId: number,
  productData: {
    name: string
    image: string
    currentPrice: number
    originalPrice: number
    isAvailable: boolean
    variantId?: string
  }
): Promise<{ success: boolean; message: string; itemId?: string }> {
  try {
    // Check if item already exists
    const wishlistRef = collection(db, 'wishlists')
    const q = query(wishlistRef, where('userId', '==', userId), where('productId', '==', productId))
    const existingDocs = await getDocs(q)

    if (!existingDocs.empty) {
      return {
        success: false,
        message: 'Product already in wishlist'
      }
    }

    // Add to wishlist
    const itemRef = doc(collection(db, 'wishlists'))
    const wishlistItem: WishlistItem = {
      id: itemRef.id,
      userId,
      productId,
      productName: productData.name,
      productImage: productData.image,
      currentPrice: productData.currentPrice,
      originalPrice: productData.originalPrice,
      addedAt: new Date(),
      priceAlertEnabled: false,
      stockAlertEnabled: !productData.isAvailable,
      isAvailable: productData.isAvailable,
      variantId: productData.variantId
    }

    await setDoc(itemRef, {
      ...wishlistItem,
      addedAt: Timestamp.fromDate(wishlistItem.addedAt)
    })

    // Update user's wishlist count
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      wishlistCount: arrayUnion(productId)
    })

    return {
      success: true,
      message: 'Added to wishlist',
      itemId: itemRef.id
    }
  } catch (error) {
    console.error('Error adding to wishlist:', error)
    return {
      success: false,
      message: 'Failed to add to wishlist'
    }
  }
}

// Remove item from wishlist
export async function removeFromWishlist(
  userId: string,
  productId: number
): Promise<{ success: boolean; message: string }> {
  try {
    const wishlistRef = collection(db, 'wishlists')
    const q = query(wishlistRef, where('userId', '==', userId), where('productId', '==', productId))
    const docs = await getDocs(q)

    if (docs.empty) {
      return {
        success: false,
        message: 'Item not found in wishlist'
      }
    }

    await deleteDoc(docs.docs[0].ref)

    // Update user's wishlist count
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      wishlistCount: arrayRemove(productId)
    })

    return {
      success: true,
      message: 'Removed from wishlist'
    }
  } catch (error) {
    console.error('Error removing from wishlist:', error)
    return {
      success: false,
      message: 'Failed to remove from wishlist'
    }
  }
}

// Get user's wishlist
export async function getUserWishlist(userId: string): Promise<WishlistItem[]> {
  try {
    const wishlistRef = collection(db, 'wishlists')
    const q = query(wishlistRef, where('userId', '==', userId), orderBy('addedAt', 'desc'))
    const snapshot = await getDocs(q)

    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        ...data,
        addedAt: data.addedAt.toDate()
      } as WishlistItem
    })
  } catch (error) {
    console.error('Error fetching wishlist:', error)
    return []
  }
}

// Move wishlist item to cart
export async function moveToCart(
  userId: string,
  productId: number,
  quantity: number = 1
): Promise<{ success: boolean; message: string }> {
  try {
    // Get wishlist item
    const wishlistRef = collection(db, 'wishlists')
    const q = query(wishlistRef, where('userId', '==', userId), where('productId', '==', productId))
    const docs = await getDocs(q)

    if (docs.empty) {
      return {
        success: false,
        message: 'Item not found in wishlist'
      }
    }

    const wishlistItem = docs.docs[0].data() as WishlistItem

    // Add to cart
    const cartRef = doc(db, 'carts', userId)
    const cartDoc = await getDoc(cartRef)

    if (cartDoc.exists()) {
      const cartData = cartDoc.data()
      const existingItem = cartData.items?.find((item: any) => item.id === productId)

      if (existingItem) {
        // Update quantity
        const updatedItems = cartData.items.map((item: any) =>
          item.id === productId ? { ...item, quantity: item.quantity + quantity } : item
        )
        await updateDoc(cartRef, { items: updatedItems, updatedAt: Timestamp.now() })
      } else {
        // Add new item
        await updateDoc(cartRef, {
          items: arrayUnion({
            id: productId,
            name: wishlistItem.productName,
            price: wishlistItem.currentPrice,
            quantity,
            image: wishlistItem.productImage,
            variantId: wishlistItem.variantId
          }),
          updatedAt: Timestamp.now()
        })
      }
    } else {
      // Create new cart
      await setDoc(cartRef, {
        userId,
        items: [
          {
            id: productId,
            name: wishlistItem.productName,
            price: wishlistItem.currentPrice,
            quantity,
            image: wishlistItem.productImage,
            variantId: wishlistItem.variantId
          }
        ],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })
    }

    // Remove from wishlist
    await deleteDoc(docs.docs[0].ref)

    return {
      success: true,
      message: 'Moved to cart'
    }
  } catch (error) {
    console.error('Error moving to cart:', error)
    return {
      success: false,
      message: 'Failed to move to cart'
    }
  }
}

// Create shared wishlist
export async function createSharedWishlist(
  userId: string,
  userName: string,
  productIds: number[],
  isPublic: boolean = true,
  expiresInDays?: number
): Promise<{ success: boolean; shareCode?: string; message: string }> {
  try {
    const shareCode = Math.random().toString(36).substring(2, 10).toUpperCase()
    const sharedRef = doc(collection(db, 'sharedWishlists'))

    const sharedWishlist: Omit<SharedWishlist, 'id'> = {
      ownerId: userId,
      ownerName: userName,
      shareCode,
      items: productIds,
      isPublic,
      createdAt: new Date(),
      expiresAt: expiresInDays ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000) : undefined,
      views: 0
    }

    await setDoc(sharedRef, {
      ...sharedWishlist,
      createdAt: Timestamp.fromDate(sharedWishlist.createdAt),
      expiresAt: sharedWishlist.expiresAt ? Timestamp.fromDate(sharedWishlist.expiresAt) : null
    })

    return {
      success: true,
      shareCode,
      message: 'Wishlist shared successfully'
    }
  } catch (error) {
    console.error('Error creating shared wishlist:', error)
    return {
      success: false,
      message: 'Failed to share wishlist'
    }
  }
}

// Get shared wishlist
export async function getSharedWishlist(
  shareCode: string
): Promise<SharedWishlist | null> {
  try {
    const sharedRef = collection(db, 'sharedWishlists')
    const q = query(sharedRef, where('shareCode', '==', shareCode.toUpperCase()))
    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      return null
    }

    const doc = snapshot.docs[0]
    const data = doc.data()

    // Check if expired
    if (data.expiresAt && data.expiresAt.toDate() < new Date()) {
      return null
    }

    // Increment views
    await updateDoc(doc.ref, {
      views: (data.views || 0) + 1
    })

    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt.toDate(),
      expiresAt: data.expiresAt?.toDate()
    } as SharedWishlist
  } catch (error) {
    console.error('Error fetching shared wishlist:', error)
    return null
  }
}

// Enable price alert
export async function setPriceAlert(
  userId: string,
  productId: number,
  targetPrice: number,
  currentPrice: number
): Promise<{ success: boolean; message: string }> {
  try {
    const alertRef = doc(collection(db, 'priceAlerts'))

    const priceAlert: Omit<PriceAlert, 'id'> = {
      userId,
      productId,
      targetPrice,
      currentPrice,
      isActive: true,
      createdAt: new Date()
    }

    await setDoc(alertRef, {
      ...priceAlert,
      createdAt: Timestamp.fromDate(priceAlert.createdAt)
    })

    // Update wishlist item
    const wishlistRef = collection(db, 'wishlists')
    const q = query(wishlistRef, where('userId', '==', userId), where('productId', '==', productId))
    const docs = await getDocs(q)

    if (!docs.empty) {
      await updateDoc(docs.docs[0].ref, {
        priceAlertEnabled: true,
        targetPrice
      })
    }

    return {
      success: true,
      message: 'Price alert enabled'
    }
  } catch (error) {
    console.error('Error setting price alert:', error)
    return {
      success: false,
      message: 'Failed to set price alert'
    }
  }
}

// Enable stock alert
export async function setStockAlert(
  userId: string,
  productId: number,
  variantId?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const alertRef = doc(collection(db, 'stockAlerts'))

    const stockAlert: Omit<StockAlert, 'id'> = {
      userId,
      productId,
      variantId,
      isActive: true,
      createdAt: new Date()
    }

    await setDoc(alertRef, {
      ...stockAlert,
      createdAt: Timestamp.fromDate(stockAlert.createdAt)
    })

    // Update wishlist item
    const wishlistRef = collection(db, 'wishlists')
    const q = query(wishlistRef, where('userId', '==', userId), where('productId', '==', productId))
    const docs = await getDocs(q)

    if (!docs.empty) {
      await updateDoc(docs.docs[0].ref, {
        stockAlertEnabled: true
      })
    }

    return {
      success: true,
      message: 'Stock alert enabled'
    }
  } catch (error) {
    console.error('Error setting stock alert:', error)
    return {
      success: false,
      message: 'Failed to set stock alert'
    }
  }
}

// Check for price drops (should be run as a cron job)
export async function checkPriceDrops(products: any[]): Promise<void> {
  try {
    const alertsRef = collection(db, 'priceAlerts')
    const q = query(alertsRef, where('isActive', '==', true))
    const snapshot = await getDocs(q)

    for (const doc of snapshot.docs) {
      const alert = doc.data() as PriceAlert
      const product = products.find(p => p.id === alert.productId)

      if (product && product.price <= alert.targetPrice) {
        // Trigger notification (implement notification service)
        console.log(`Price drop alert for product ${alert.productId} - User ${alert.userId}`)

        // Mark as notified
        await updateDoc(doc.ref, {
          isActive: false,
          notifiedAt: Timestamp.now()
        })

        // Create notification record
        await addDoc(collection(db, 'notifications'), {
          userId: alert.userId,
          type: 'price_drop',
          productId: alert.productId,
          message: `Price dropped to ₹${product.price}! Your target was ₹${alert.targetPrice}`,
          read: false,
          createdAt: Timestamp.now()
        })
      }
    }
  } catch (error) {
    console.error('Error checking price drops:', error)
  }
}

// Check for back-in-stock (should be run when inventory updates)
export async function checkBackInStock(productId: number, variantId?: string): Promise<void> {
  try {
    const alertsRef = collection(db, 'stockAlerts')
    let q = query(alertsRef, where('productId', '==', productId), where('isActive', '==', true))

    if (variantId) {
      q = query(q, where('variantId', '==', variantId))
    }

    const snapshot = await getDocs(q)

    for (const doc of snapshot.docs) {
      const alert = doc.data() as StockAlert

      // Trigger notification
      console.log(`Back in stock alert for product ${productId} - User ${alert.userId}`)

      // Mark as notified
      await updateDoc(doc.ref, {
        isActive: false,
        notifiedAt: Timestamp.now()
      })

      // Create notification record
      await addDoc(collection(db, 'notifications'), {
        userId: alert.userId,
        type: 'back_in_stock',
        productId: alert.productId,
        variantId: alert.variantId,
        message: 'Product is back in stock!',
        read: false,
        createdAt: Timestamp.now()
      })
    }
  } catch (error) {
    console.error('Error checking back in stock:', error)
  }
}
