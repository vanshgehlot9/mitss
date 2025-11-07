"use client"

import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { motion } from "framer-motion"
import { 
  Package, 
  CreditCard, 
  Truck, 
  RefreshCw, 
  Shield, 
  Users, 
  MessageCircle, 
  Phone, 
  Mail, 
  HelpCircle,
  Search,
  ChevronRight,
  Clock,
  MapPin,
  FileText,
  Settings,
  ShoppingCart,
  Star,
  Wrench
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useState } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const helpCategories = [
  {
    title: "Orders & Tracking",
    icon: Package,
    color: "bg-blue-500",
    links: [
      { name: "Track Your Order", href: "/track-order" },
      { name: "Order Status", href: "/help-center#order-status" },
      { name: "Modify Order", href: "/help-center#modify-order" },
      { name: "Cancel Order", href: "/help-center#cancel-order" },
    ]
  },
  {
    title: "Payment & Pricing",
    icon: CreditCard,
    color: "bg-green-500",
    links: [
      { name: "Payment Methods", href: "/help-center#payment-methods" },
      { name: "EMI Options", href: "/help-center#emi" },
      { name: "Pricing & Offers", href: "/deals" },
      { name: "Gift Cards", href: "/help-center#gift-cards" },
    ]
  },
  {
    title: "Shipping & Delivery",
    icon: Truck,
    color: "bg-purple-500",
    links: [
      { name: "Shipping Policy", href: "/shipping-policy" },
      { name: "Delivery Timeline", href: "/help-center#delivery" },
      { name: "Delivery Areas", href: "/help-center#areas" },
      { name: "Installation Services", href: "/help-center#installation" },
    ]
  },
  {
    title: "Returns & Refunds",
    icon: RefreshCw,
    color: "bg-red-500",
    links: [
      { name: "Return Policy", href: "/return-refund" },
      { name: "Refund Process", href: "/return-refund#refund" },
      { name: "Damaged Products", href: "/help-center#damaged" },
      { name: "Exchange Policy", href: "/help-center#exchange" },
    ]
  },
  {
    title: "Product Information",
    icon: Star,
    color: "bg-yellow-500",
    links: [
      { name: "Product Care", href: "/help-center#care" },
      { name: "Warranty Info", href: "/help-center#warranty" },
      { name: "Assembly Guide", href: "/help-center#assembly" },
      { name: "Material Details", href: "/help-center#materials" },
    ]
  },
  {
    title: "Custom Furniture",
    icon: Wrench,
    color: "bg-indigo-500",
    links: [
      { name: "Custom Design Process", href: "/custom-design" },
      { name: "Design Consultation", href: "/help-center#consultation" },
      { name: "Custom Pricing", href: "/help-center#custom-pricing" },
      { name: "Timeline for Custom Orders", href: "/help-center#custom-timeline" },
    ]
  },
  {
    title: "Account & Security",
    icon: Shield,
    color: "bg-teal-500",
    links: [
      { name: "My Account", href: "/account" },
      { name: "Privacy Policy", href: "/privacy-policy" },
      { name: "Update Profile", href: "/account#profile" },
      { name: "Security & Privacy", href: "/privacy-policy" },
    ]
  },
  {
    title: "Contact & Support",
    icon: MessageCircle,
    color: "bg-pink-500",
    links: [
      { name: "Contact Us", href: "/contact" },
      { name: "Raise a Complaint", href: "/help-center#complaint" },
      { name: "Give Feedback", href: "/help-center#feedback" },
      { name: "Support Hours", href: "/help-center#support-hours" },
    ]
  },
]

const faqs = [
  {
    question: "How do I track my order?",
    answer: "You can track your order by visiting the Track Order page and entering your order number and email address. You'll receive tracking updates via SMS and email once your order is dispatched."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept Credit/Debit Cards, UPI, Net Banking, Wallets (Paytm, PhonePe, etc.), and Cash on Delivery. We also offer EMI options on select cards and third-party EMI providers like Bajaj Finserv."
  },
  {
    question: "How long does delivery take?",
    answer: "Standard delivery takes 7-15 business days depending on your location. Custom furniture orders may take 3-6 weeks. Metro cities typically receive orders within 7-10 days."
  },
  {
    question: "Can I return my furniture?",
    answer: "All products are non-returnable except in cases of manufacturing defects or damage during delivery. You must report such issues within 48 hours of delivery with photos for inspection."
  },
  {
    question: "Do you provide installation services?",
    answer: "Yes, we provide free installation and assembly services for most furniture items. Our expert technicians will set up your furniture at your preferred location."
  },
  {
    question: "What is your warranty policy?",
    answer: "Warranty varies by product: Furniture frames (5-10 years), Hardware & fittings (1 year), Upholstery fabric (1 year). Warranty covers manufacturing defects only, not normal wear and tear."
  },
  {
    question: "Can I customize furniture designs?",
    answer: "Yes! We offer complete customization services. You can choose wood type, finish, dimensions, and design. Our design team will help you create furniture that perfectly matches your vision."
  },
  {
    question: "How do I cancel my order?",
    answer: "Orders can be cancelled before shipment for a full refund. Once shipped, our return policy applies. Custom orders cannot be cancelled once production starts. Contact our support team immediately."
  },
  {
    question: "Do you deliver to my area?",
    answer: "We deliver across India to major cities and towns. Enter your pincode during checkout to check serviceability. We're constantly expanding our delivery network."
  },
  {
    question: "What if my product arrives damaged?",
    answer: "Report damaged products within 48 hours with clear photos. We'll arrange immediate pickup and provide a replacement or full refund. Do not assemble damaged furniture."
  },
]

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-32 pb-20">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-[#1A2642] to-[#0F1829] text-white py-16 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-64 h-64 bg-[#D4AF37] rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-64 h-64 bg-[#D4AF37] rounded-full blur-3xl" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-[#D4AF37]/20 rounded-full mb-6">
                <HelpCircle className="w-10 h-10 text-[#D4AF37]" />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                How Can We Help You?
              </h1>
              <p className="text-lg text-white/80 mb-8">
                Find answers to your questions, track orders, and get support
              </p>
              
              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for help articles, FAQs, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 h-14 text-lg bg-white/95 backdrop-blur-sm border-0 shadow-xl"
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Help Categories */}
        <div className="container mx-auto px-4 -mt-12 relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {helpCategories.map((category, index) => {
              const Icon = category.icon
              return (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1 cursor-pointer"
                  onClick={() => setActiveCategory(activeCategory === category.title ? null : category.title)}
                >
                  <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mb-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1A2642] mb-3">
                    {category.title}
                  </h3>
                  <ul className="space-y-2">
                    {category.links.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className="text-sm text-gray-600 hover:text-[#D4AF37] flex items-center gap-2 group"
                        >
                          <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* FAQs */}
        <div className="container mx-auto px-4 mb-16 mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A2642] mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Quick answers to common questions
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-white rounded-lg shadow-sm border border-gray-100 px-6"
                >
                  <AccordionTrigger className="text-left font-semibold text-[#1A2642] hover:text-[#D4AF37] hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-br from-[#1A2642] to-[#0F1829] text-white py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
              <p className="text-lg text-white/80">
                Our customer support team is here to help you
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20"
              >
                <Phone className="w-10 h-10 text-[#D4AF37] mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Call Us</h3>
                <a href="tel:+919314444747" className="text-[#D4AF37] hover:underline text-lg">
                  +91-9314444747
                </a>
                <p className="text-sm text-white/70 mt-2">Mon-Sat, 10 AM - 7 PM</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20"
              >
                <Mail className="w-10 h-10 text-[#D4AF37] mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Email Us</h3>
                <a href="mailto:support@mitss.in" className="text-[#D4AF37] hover:underline">
                  support@mitss.in
                </a>
                <p className="text-sm text-white/70 mt-2">Response within 24 hours</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20"
              >
                <MessageCircle className="w-10 h-10 text-[#D4AF37] mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">WhatsApp</h3>
                <a href="https://wa.me/919314444747" className="text-[#D4AF37] hover:underline">
                  Chat with us
                </a>
                <p className="text-sm text-white/70 mt-2">Quick responses</p>
              </motion.div>
            </div>

            <div className="text-center mt-12">
              <Link href="/contact">
                <Button className="bg-[#D4AF37] hover:bg-[#B8941F] text-white px-8 py-6 text-lg">
                  <Mail className="w-5 h-5 mr-2" />
                  Raise a Support Ticket
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Business Hours */}
        <div className="container mx-auto px-4 mt-16">
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#1A2642] mb-4">
                  Customer Support Hours
                </h3>
                <div className="space-y-2 text-gray-600">
                  <p className="flex justify-between">
                    <span className="font-medium">Monday - Saturday:</span>
                    <span>10:00 AM - 7:00 PM IST</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-medium">Sunday:</span>
                    <span>Closed</span>
                  </p>
                  <p className="text-sm text-gray-500 mt-4">
                    * WhatsApp support available 24/7 for urgent queries
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
