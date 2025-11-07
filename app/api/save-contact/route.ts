import { NextResponse } from "next/server"

// This is a simple in-memory storage for demo
// In production, connect to your database (MongoDB, PostgreSQL, etc.)
const contacts: { phoneNumber: string; timestamp: string }[] = []

export async function POST(request: Request) {
  try {
    const { phoneNumber, timestamp } = await request.json()

    // Validate phone number
    if (!phoneNumber || !/^[6-9]\d{9}$/.test(phoneNumber)) {
      return NextResponse.json(
        { error: "Invalid phone number" },
        { status: 400 }
      )
    }

    // Store contact (in real app, save to database)
    contacts.push({ phoneNumber, timestamp })

    // Log to console (in production, save to your database)
    console.log("New contact saved:", { phoneNumber, timestamp })
    console.log("Total contacts:", contacts.length)

    // TODO: Connect to your database here
    // Example with MongoDB:
    // await db.collection('contacts').insertOne({ phoneNumber, timestamp })
    
    // Example with PostgreSQL:
    // await pool.query('INSERT INTO contacts (phone, created_at) VALUES ($1, $2)', [phoneNumber, timestamp])

    return NextResponse.json(
      { success: true, message: "Contact saved successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error saving contact:", error)
    return NextResponse.json(
      { error: "Failed to save contact" },
      { status: 500 }
    )
  }
}

// Optional: GET endpoint to retrieve contacts
export async function GET() {
  return NextResponse.json({
    contacts,
    total: contacts.length,
  })
}
