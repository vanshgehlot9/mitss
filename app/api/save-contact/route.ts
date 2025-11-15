import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { sendEmail } from "@/lib/email-service"

interface ContactData {
  name: string
  email: string
  phone: string
  subject: string
  message: string
  createdAt: Date
  status: 'new' | 'read' | 'responded'
}

export async function POST(request: Request) {
  try {
    const { name, email, phone, subject, message } = await request.json()

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Validate phone if provided
    if (phone && !/^[6-9]\d{9}$/.test(phone.replace(/\D/g, ''))) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      )
    }

    // Connect to database
    const db = await getDatabase()
    const contactsCollection = db.collection('contacts')

    // Create contact document
    const contactData: ContactData = {
      name,
      email,
      phone: phone || '',
      subject: subject || 'general',
      message,
      createdAt: new Date(),
      status: 'new'
    }

    // Save to database
    const result = await contactsCollection.insertOne(contactData)

    console.log("✅ Contact saved to database:", { name, email, subject })

    // Send email notification to admin
    try {
      await sendEmail({
        to: process.env.ADMIN_EMAIL || 'info@mitss.store',
        subject: `New Contact Form Submission: ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1A2642; border-bottom: 3px solid #D4AF37; padding-bottom: 10px;">
              New Contact Form Submission
            </h2>
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
              <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
              <p><strong>Subject:</strong> ${subject}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleString('en-IN')}</p>
            </div>
            <div style="margin: 20px 0;">
              <h3 style="color: #1A2642;">Message:</h3>
              <p style="background: white; padding: 15px; border-left: 4px solid #D4AF37; white-space: pre-wrap;">${message}</p>
            </div>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">This is an automated message from MITSS Contact Form</p>
          </div>
        `
      })

      // Send confirmation email to customer
      await sendEmail({
        to: email,
        subject: 'We received your message - MITSS',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1A2642; border-bottom: 3px solid #D4AF37; padding-bottom: 10px;">
              Thank You for Contacting Us!
            </h2>
            <p>Dear ${name},</p>
            <p>We have received your message and will get back to you as soon as possible.</p>
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Your Message:</strong></p>
              <p style="background: white; padding: 15px; border-left: 4px solid #D4AF37; white-space: pre-wrap;">${message}</p>
            </div>
            <p>Our team typically responds within 24 hours during business days (Monday-Saturday, 9 AM - 7 PM).</p>
            <p>If you need immediate assistance, feel free to call us at <strong>+91 99500 36077</strong>.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #666;">Best regards,<br><strong style="color: #D4AF37;">MITSS - Modern Celluloid Industries</strong></p>
          </div>
        `
      })

      console.log("📧 Email notifications sent successfully")
    } catch (emailError) {
      console.error("⚠️ Email notification failed (contact saved):", emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "Message sent successfully! We'll get back to you soon.",
        contactId: result.insertedId 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("❌ Error saving contact:", error)
    return NextResponse.json(
      { error: "Failed to save contact. Please try again." },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve contacts (Admin only)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const db = await getDatabase()
    const contactsCollection = db.collection('contacts')

    const filter = status ? { status } : {}
    const contacts = await contactsCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray()

    return NextResponse.json({
      success: true,
      contacts,
      total: contacts.length,
    })
  } catch (error) {
    console.error("Error fetching contacts:", error)
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: 500 }
    )
  }
}
