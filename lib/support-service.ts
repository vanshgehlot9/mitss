import { db } from './firebase'
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  Timestamp,
  addDoc,
  limit,
  increment
} from 'firebase/firestore'

export interface SupportTicket {
  id: string
  userId: string
  userName: string
  userEmail: string
  subject: string
  message: string
  category: 'order' | 'product' | 'payment' | 'shipping' | 'return' | 'technical' | 'other'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high'
  orderId?: string
  productId?: number
  assignedTo?: string
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
  responses: TicketResponse[]
}

export interface TicketResponse {
  id: string
  userId: string
  userName: string
  isStaff: boolean
  message: string
  attachments?: string[]
  createdAt: Date
}

export interface FAQ {
  id: string
  category: string
  question: string
  answer: string
  tags: string[]
  helpful: number
  notHelpful: number
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface ProductQuestion {
  id: string
  productId: number
  userId: string
  userName: string
  question: string
  answer?: string
  answeredBy?: string
  answeredAt?: Date
  helpful: number
  notHelpful: number
  status: 'pending' | 'answered'
  createdAt: Date
}

export interface SizeGuide {
  id: string
  productId?: number
  category: string
  title: string
  description: string
  measurements: {
    size: string
    dimensions: Record<string, string>
  }[]
  tips: string[]
  images?: string[]
}

// Create support ticket
export async function createSupportTicket(
  ticketData: Omit<SupportTicket, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'responses'>
): Promise<{ success: boolean; ticketId?: string; message: string }> {
  try {
    const ticketRef = doc(collection(db, 'supportTickets'))

    const ticket: Omit<SupportTicket, 'id'> = {
      ...ticketData,
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
      responses: []
    }

    await setDoc(ticketRef, {
      ...ticket,
      createdAt: Timestamp.fromDate(ticket.createdAt),
      updatedAt: Timestamp.fromDate(ticket.updatedAt)
    })

    return {
      success: true,
      ticketId: ticketRef.id,
      message: 'Support ticket created successfully'
    }
  } catch (error) {
    console.error('Error creating support ticket:', error)
    return {
      success: false,
      message: 'Failed to create support ticket'
    }
  }
}

// Add response to ticket
export async function addTicketResponse(
  ticketId: string,
  userId: string,
  userName: string,
  message: string,
  isStaff: boolean = false,
  attachments?: string[]
): Promise<{ success: boolean; message: string }> {
  try {
    const ticketRef = doc(db, 'supportTickets', ticketId)
    const ticketDoc = await getDoc(ticketRef)

    if (!ticketDoc.exists()) {
      return {
        success: false,
        message: 'Ticket not found'
      }
    }

    const response: TicketResponse = {
      id: Date.now().toString(),
      userId,
      userName,
      isStaff,
      message,
      attachments,
      createdAt: new Date()
    }

    const currentResponses = ticketDoc.data().responses || []
    
    await updateDoc(ticketRef, {
      responses: [
        ...currentResponses,
        {
          ...response,
          createdAt: Timestamp.fromDate(response.createdAt)
        }
      ],
      updatedAt: Timestamp.now(),
      status: isStaff ? 'in_progress' : ticketDoc.data().status
    })

    return {
      success: true,
      message: 'Response added successfully'
    }
  } catch (error) {
    console.error('Error adding ticket response:', error)
    return {
      success: false,
      message: 'Failed to add response'
    }
  }
}

// Get user's support tickets
export async function getUserTickets(userId: string): Promise<SupportTicket[]> {
  try {
    const ticketsRef = collection(db, 'supportTickets')
    const q = query(ticketsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)

    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        resolvedAt: data.resolvedAt?.toDate(),
        responses: data.responses?.map((r: any) => ({
          ...r,
          createdAt: r.createdAt.toDate()
        })) || []
      } as SupportTicket
    })
  } catch (error) {
    console.error('Error fetching user tickets:', error)
    return []
  }
}

// Get FAQs
export async function getFAQs(category?: string): Promise<FAQ[]> {
  try {
    const faqsRef = collection(db, 'faqs')
    let q = query(faqsRef, orderBy('order', 'asc'))

    if (category) {
      q = query(faqsRef, where('category', '==', category), orderBy('order', 'asc'))
    }

    const snapshot = await getDocs(q)

    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as FAQ
    })
  } catch (error) {
    console.error('Error fetching FAQs:', error)
    return []
  }
}

// Mark FAQ as helpful/not helpful
export async function rateFAQ(
  faqId: string,
  isHelpful: boolean
): Promise<{ success: boolean; message: string }> {
  try {
    const faqRef = doc(db, 'faqs', faqId)
    
    await updateDoc(faqRef, {
      [isHelpful ? 'helpful' : 'notHelpful']: increment(1),
      updatedAt: Timestamp.now()
    })

    return {
      success: true,
      message: 'Thank you for your feedback'
    }
  } catch (error) {
    console.error('Error rating FAQ:', error)
    return {
      success: false,
      message: 'Failed to submit feedback'
    }
  }
}

// Ask product question
export async function askProductQuestion(
  productId: number,
  userId: string,
  userName: string,
  question: string
): Promise<{ success: boolean; questionId?: string; message: string }> {
  try {
    const questionRef = doc(collection(db, 'productQuestions'))

    const productQuestion: Omit<ProductQuestion, 'id'> = {
      productId,
      userId,
      userName,
      question,
      helpful: 0,
      notHelpful: 0,
      status: 'pending',
      createdAt: new Date()
    }

    await setDoc(questionRef, {
      ...productQuestion,
      createdAt: Timestamp.fromDate(productQuestion.createdAt)
    })

    return {
      success: true,
      questionId: questionRef.id,
      message: 'Question submitted successfully'
    }
  } catch (error) {
    console.error('Error submitting question:', error)
    return {
      success: false,
      message: 'Failed to submit question'
    }
  }
}

// Answer product question
export async function answerProductQuestion(
  questionId: string,
  answer: string,
  answeredBy: string
): Promise<{ success: boolean; message: string }> {
  try {
    const questionRef = doc(db, 'productQuestions', questionId)

    await updateDoc(questionRef, {
      answer,
      answeredBy,
      answeredAt: Timestamp.now(),
      status: 'answered'
    })

    return {
      success: true,
      message: 'Answer submitted successfully'
    }
  } catch (error) {
    console.error('Error answering question:', error)
    return {
      success: false,
      message: 'Failed to submit answer'
    }
  }
}

// Get product questions
export async function getProductQuestions(
  productId: number,
  answeredOnly: boolean = true
): Promise<ProductQuestion[]> {
  try {
    const questionsRef = collection(db, 'productQuestions')
    let q = query(
      questionsRef,
      where('productId', '==', productId),
      orderBy('createdAt', 'desc'),
      limit(20)
    )

    if (answeredOnly) {
      q = query(
        questionsRef,
        where('productId', '==', productId),
        where('status', '==', 'answered'),
        orderBy('createdAt', 'desc'),
        limit(20)
      )
    }

    const snapshot = await getDocs(q)

    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        answeredAt: data.answeredAt?.toDate()
      } as ProductQuestion
    })
  } catch (error) {
    console.error('Error fetching product questions:', error)
    return []
  }
}

// Get size guide
export async function getSizeGuide(
  productId?: number,
  category?: string
): Promise<SizeGuide | null> {
  try {
    const guidesRef = collection(db, 'sizeGuides')
    let q

    if (productId) {
      q = query(guidesRef, where('productId', '==', productId), limit(1))
    } else if (category) {
      q = query(guidesRef, where('category', '==', category), limit(1))
    } else {
      return null
    }

    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      return null
    }

    const doc = snapshot.docs[0]
    return {
      id: doc.id,
      ...doc.data()
    } as SizeGuide
  } catch (error) {
    console.error('Error fetching size guide:', error)
    return null
  }
}

// Create/update size guide
export async function createSizeGuide(
  sizeGuideData: Omit<SizeGuide, 'id'>
): Promise<{ success: boolean; guideId?: string; message: string }> {
  try {
    const guideRef = doc(collection(db, 'sizeGuides'))

    await setDoc(guideRef, sizeGuideData)

    return {
      success: true,
      guideId: guideRef.id,
      message: 'Size guide created successfully'
    }
  } catch (error) {
    console.error('Error creating size guide:', error)
    return {
      success: false,
      message: 'Failed to create size guide'
    }
  }
}

// Live chat session (basic structure)
export interface ChatSession {
  id: string
  userId: string
  userName: string
  userEmail: string
  status: 'waiting' | 'active' | 'closed'
  assignedAgent?: string
  messages: ChatMessage[]
  createdAt: Date
  closedAt?: Date
}

export interface ChatMessage {
  id: string
  userId: string
  userName: string
  isAgent: boolean
  message: string
  timestamp: Date
}

// Initialize chat session
export async function initializeChatSession(
  userId: string,
  userName: string,
  userEmail: string,
  initialMessage: string
): Promise<{ success: boolean; sessionId?: string; message: string }> {
  try {
    const sessionRef = doc(collection(db, 'chatSessions'))

    const session: Omit<ChatSession, 'id'> = {
      userId,
      userName,
      userEmail,
      status: 'waiting',
      messages: [
        {
          id: Date.now().toString(),
          userId,
          userName,
          isAgent: false,
          message: initialMessage,
          timestamp: new Date()
        }
      ],
      createdAt: new Date()
    }

    await setDoc(sessionRef, {
      ...session,
      createdAt: Timestamp.fromDate(session.createdAt),
      messages: session.messages.map(m => ({
        ...m,
        timestamp: Timestamp.fromDate(m.timestamp)
      }))
    })

    return {
      success: true,
      sessionId: sessionRef.id,
      message: 'Chat session created'
    }
  } catch (error) {
    console.error('Error initializing chat session:', error)
    return {
      success: false,
      message: 'Failed to create chat session'
    }
  }
}
