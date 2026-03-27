import { useState, useRef, useEffect } from "react";
import {
  useRealEstateNews,
  computeImportance,
  type NewsArticle,
} from "@/hooks/useRealEstateNews";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/* ───────────────── data ───────────────── */

const allUpdates = [
  /* ── Market Trends ── */
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&h=500&fit=crop",
    tag: "Market Trends",
    title: "Mumbai's Skyline Is Changing — 30% Surge in Luxury Launches",
    excerpt:
      "Premium housing in Mumbai sees unprecedented demand as NRIs and HNIs drive the luxury segment above Rs 5 Cr. South Mumbai and BKC lead the charge with record-breaking sales numbers this quarter.",
    date: "Feb 22, 2026",
    readTime: "4 min read",
    author: "Priya Sharma",
    authorAvatar: "https://i.pravatar.cc/80?img=1",
  },
  {
    id: 10,
    image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&h=500&fit=crop",
    tag: "Market Trends",
    title: "Delhi-NCR Records Highest Ever Quarterly Registrations",
    excerpt:
      "Noida and Gurugram lead the national capital region with over 25,000 property registrations in Q4 2025, marking a 40% YoY increase driven by end-user demand.",
    date: "Feb 8, 2026",
    readTime: "3 min read",
    author: "Kavita Singh",
    authorAvatar: "https://i.pravatar.cc/80?img=16",
  },
  {
    id: 11,
    image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&h=500&fit=crop",
    tag: "Market Trends",
    title: "Hyderabad Emerges as India's Fastest-Growing Realty Market in 2026",
    excerpt:
      "Driven by IT expansion and infrastructure development, Hyderabad's residential market has seen a 35% jump in new launches. Financial District and Kokapet are the hottest micro-markets to watch.",
    date: "Jan 30, 2026",
    readTime: "5 min read",
    author: "Rohan Mehta",
    authorAvatar: "https://i.pravatar.cc/80?img=8",
  },
  /* ── Home Loans ── */
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=500&fit=crop",
    tag: "Home Loans",
    title: "RBI Holds Repo Rate — What It Means for Your EMI",
    excerpt:
      "With the repo rate steady at 6.5%, home loan EMIs remain unchanged. Experts suggest this is the best window to lock in fixed-rate loans before potential hikes in the upcoming monetary review.",
    date: "Feb 20, 2026",
    readTime: "3 min read",
    author: "Vikram Desai",
    authorAvatar: "https://i.pravatar.cc/80?img=3",
  },
  {
    id: 12,
    image: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=800&h=500&fit=crop",
    tag: "Home Loans",
    title: "Fixed vs Floating: Choosing the Right Home Loan in 2026",
    excerpt:
      "With interest rate cycles shifting, financial advisors weigh in on whether borrowers should lock in fixed rates now or ride the floating rate wave for potential savings.",
    date: "Feb 14, 2026",
    readTime: "4 min read",
    author: "Sneha Iyer",
    authorAvatar: "https://i.pravatar.cc/80?img=9",
  },
  {
    id: 13,
    image: "https://images.unsplash.com/photo-1461088945293-0c17689e48ac?w=800&h=500&fit=crop",
    tag: "Home Loans",
    title: "How Your CIBIL Score Can Save You Lakhs on a Home Loan",
    excerpt:
      "A credit score above 780 can unlock interest rates 0.5-1% lower than average. Here's a step-by-step guide to improving your CIBIL score before applying for a home loan.",
    date: "Jan 25, 2026",
    readTime: "6 min read",
    author: "Arjun Nair",
    authorAvatar: "https://i.pravatar.cc/80?img=11",
  },
  /* ── Policy Update ── */
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=500&fit=crop",
    tag: "Policy Update",
    title: "New Stamp Duty Rebate for Women Homebuyers in Maharashtra",
    excerpt:
      "The state government announces a 1% stamp duty reduction for women buyers, potentially saving Rs 1-3 lakhs on properties under Rs 1 Cr. Here's how to claim the benefit.",
    date: "Feb 18, 2026",
    readTime: "5 min read",
    author: "Ananya Patel",
    authorAvatar: "https://i.pravatar.cc/80?img=5",
  },
  {
    id: 14,
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=500&fit=crop",
    tag: "Policy Update",
    title: "RERA 2.0: Stricter Deadlines and Bigger Penalties for Builders",
    excerpt:
      "The revised RERA framework mandates quarterly progress reports from developers and introduces penalty clauses up to 10% of project cost for delays beyond 6 months.",
    date: "Feb 6, 2026",
    readTime: "4 min read",
    author: "Priya Sharma",
    authorAvatar: "https://i.pravatar.cc/80?img=1",
  },
  {
    id: 15,
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=500&fit=crop",
    tag: "Policy Update",
    title: "GST Council Clarifies Tax Treatment for Under-Construction Homes",
    excerpt:
      "A new GST circular eliminates ambiguity on input tax credit for buyers of under-construction properties, potentially reducing costs by 2-4% for new bookings made after April 2026.",
    date: "Jan 20, 2026",
    readTime: "3 min read",
    author: "Vikram Desai",
    authorAvatar: "https://i.pravatar.cc/80?img=3",
  },
  /* ── Investment ── */
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=500&fit=crop",
    tag: "Investment",
    title: "Bengaluru's ORR Corridor — The Next Real Estate Goldmine?",
    excerpt:
      "Infrastructure upgrades and IT expansion make Outer Ring Road properties appreciate 22% in just 18 months. Here's where smart money is flowing and which micro-markets to watch.",
    date: "Feb 15, 2026",
    readTime: "6 min read",
    author: "Rohan Mehta",
    authorAvatar: "https://i.pravatar.cc/80?img=8",
  },
  {
    id: 16,
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=500&fit=crop",
    tag: "Investment",
    title: "REITs Deliver 14% Returns in FY2025 — Is It Time to Diversify?",
    excerpt:
      "Real Estate Investment Trusts have outperformed FDs and gold over the last two years. We break down the top-performing REITs and what to look for before investing.",
    date: "Feb 10, 2026",
    readTime: "5 min read",
    author: "Kavita Singh",
    authorAvatar: "https://i.pravatar.cc/80?img=16",
  },
  {
    id: 17,
    image: "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&h=500&fit=crop",
    tag: "Investment",
    title: "Pune's Wakad-Hinjewadi Belt: Best ROI for Rs 80L Budgets",
    excerpt:
      "With rental yields hitting 4.2% and capital appreciation of 18% in 2025, Pune's western corridor is emerging as the go-to bet for mid-ticket investors seeking balanced returns.",
    date: "Jan 28, 2026",
    readTime: "4 min read",
    author: "Sneha Iyer",
    authorAvatar: "https://i.pravatar.cc/80?img=9",
  },
  /* ── Affordable Housing ── */
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=500&fit=crop",
    tag: "Affordable Housing",
    title: "Under 50L — Top 5 Cities for First-Time Homebuyers in 2026",
    excerpt:
      "From Pune's Hinjewadi to Hyderabad's Kompally, affordable housing hotspots offer quality living at accessible price points with strong appreciation potential.",
    date: "Feb 12, 2026",
    readTime: "4 min read",
    author: "Sneha Iyer",
    authorAvatar: "https://i.pravatar.cc/80?img=9",
  },
  {
    id: 18,
    image: "https://images.unsplash.com/photo-1558618047-3c8c76ca1f6c?w=800&h=500&fit=crop",
    tag: "Affordable Housing",
    title: "PMAY 2.0 Extended: 2 Lakh More Homes for Urban Poor in FY2026",
    excerpt:
      "The government's flagship housing scheme gets a fresh allocation of Rs 60,000 Cr, targeting EWS and LIG categories in 150 cities with completion deadlines tightened.",
    date: "Feb 3, 2026",
    readTime: "3 min read",
    author: "Arjun Nair",
    authorAvatar: "https://i.pravatar.cc/80?img=11",
  },
  {
    id: 19,
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=500&fit=crop",
    tag: "Affordable Housing",
    title: "Tier-2 Cities Lead Affordable Housing Demand Post-Pandemic",
    excerpt:
      "Cities like Nashik, Coimbatore, and Bhubaneswar are seeing a surge in sub-40L housing demand from young professionals seeking quality living away from metro price tags.",
    date: "Jan 22, 2026",
    readTime: "5 min read",
    author: "Priya Sharma",
    authorAvatar: "https://i.pravatar.cc/80?img=1",
  },
  /* ── Technology ── */
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop",
    tag: "Technology",
    title: "Smart Homes Are No Longer a Luxury — They're the Standard",
    excerpt:
      "IoT integration, energy-efficient systems, and AI-powered security are now expected in mid-range apartments. Builders who don't adapt risk losing the millennial buyer.",
    date: "Feb 10, 2026",
    readTime: "5 min read",
    author: "Arjun Nair",
    authorAvatar: "https://i.pravatar.cc/80?img=11",
  },
  {
    id: 20,
    image: "https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=800&h=500&fit=crop",
    tag: "Technology",
    title: "How AI Is Transforming Property Searches in India",
    excerpt:
      "AI-powered recommendation engines now process 50+ data points — from commute time to noise levels — to match buyers with their ideal homes. Platforms report 3x higher conversion rates.",
    date: "Feb 1, 2026",
    readTime: "4 min read",
    author: "Rohan Mehta",
    authorAvatar: "https://i.pravatar.cc/80?img=8",
  },
  {
    id: 21,
    image: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800&h=500&fit=crop",
    tag: "Technology",
    title: "VR Property Tours: Sales Close 40% Faster for Developers Using Them",
    excerpt:
      "Immersive 3D walkthroughs are no longer just a marketing gimmick — they're driving faster decision-making and reducing site visit friction for NRI buyers especially.",
    date: "Jan 18, 2026",
    readTime: "3 min read",
    author: "Kavita Singh",
    authorAvatar: "https://i.pravatar.cc/80?img=16",
  },
  /* ── Sustainability ── */
  {
    id: 8,
    image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=800&h=500&fit=crop",
    tag: "Sustainability",
    title: "Green Certifications Now Add 12-18% Premium to Property Values",
    excerpt:
      "IGBC and GRIHA rated buildings command significantly higher valuations. Buyers increasingly prioritize sustainability, driving developers to go green.",
    date: "Feb 5, 2026",
    readTime: "4 min read",
    author: "Priya Sharma",
    authorAvatar: "https://i.pravatar.cc/80?img=1",
  },
  {
    id: 22,
    image: "https://images.unsplash.com/photo-1508450859948-4e04fabd4526?w=800&h=500&fit=crop",
    tag: "Sustainability",
    title: "Solar Rooftops Becoming Mandatory for New Residential Projects in 5 States",
    excerpt:
      "Rajasthan, Karnataka, Maharashtra, Gujarat, and Tamil Nadu have passed bylaws requiring rooftop solar for new buildings above 500 sq m. Here's what buyers need to know.",
    date: "Jan 29, 2026",
    readTime: "4 min read",
    author: "Sneha Iyer",
    authorAvatar: "https://i.pravatar.cc/80?img=9",
  },
  {
    id: 23,
    image: "https://images.unsplash.com/photo-1490750967868-88df5691cc44?w=800&h=500&fit=crop",
    tag: "Sustainability",
    title: "India's First Net-Zero Residential Township Launches in Pune",
    excerpt:
      "A 200-acre township in Pune's Wagholi area has achieved net-zero carbon certification — combining passive cooling design, rainwater harvesting, and 100% renewable energy.",
    date: "Jan 15, 2026",
    readTime: "6 min read",
    author: "Arjun Nair",
    authorAvatar: "https://i.pravatar.cc/80?img=11",
  },
  /* ── Lifestyle ── */
  {
    id: 9,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=500&fit=crop",
    tag: "Lifestyle",
    title: "Co-Living 2.0: How Shared Spaces Are Redefining Urban Living",
    excerpt:
      "The co-living market is projected to reach $13 billion by 2028. New-age operators are offering premium amenities, flexible leases, and community-driven experiences.",
    date: "Feb 2, 2026",
    readTime: "5 min read",
    author: "Vikram Desai",
    authorAvatar: "https://i.pravatar.cc/80?img=3",
  },
  {
    id: 24,
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&h=500&fit=crop",
    tag: "Lifestyle",
    title: "Beyond a Pool: The Amenities Redefining Premium Apartments in 2026",
    excerpt:
      "Rooftop sky decks, pet spas, coworking lounges, and curated farm-to-table gardens — the amenity race is intensifying as developers compete for discerning buyers.",
    date: "Jan 26, 2026",
    readTime: "4 min read",
    author: "Priya Sharma",
    authorAvatar: "https://i.pravatar.cc/80?img=1",
  },
  {
    id: 25,
    image: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&h=500&fit=crop",
    tag: "Lifestyle",
    title: "Designing the Perfect WFH Corner: What Home Buyers Want Now",
    excerpt:
      "Post-pandemic buyers consistently rank dedicated work-from-home spaces in their top-3 must-haves. Developers are responding with flex rooms and sound-insulated study alcoves.",
    date: "Jan 12, 2026",
    readTime: "3 min read",
    author: "Kavita Singh",
    authorAvatar: "https://i.pravatar.cc/80?img=16",
  },
  /* ── Market Trends (4 & 5) ── */
  {
    id: 26,
    image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&h=500&fit=crop",
    tag: "Market Trends",
    title: "Chennai's OMR Overtakes Traditional Hotspots as Price Gains Hit 28%",
    excerpt:
      "Old Mahabalipuram Road has emerged as Chennai's fastest-appreciating corridor. IT park expansions and improved metro connectivity are pulling mid-segment buyers in droves.",
    date: "Jan 10, 2026",
    readTime: "4 min read",
    author: "Sneha Iyer",
    authorAvatar: "https://i.pravatar.cc/80?img=9",
  },
  {
    id: 27,
    image: "https://images.unsplash.com/photo-1517490232338-06b912a786b5?w=800&h=500&fit=crop",
    tag: "Market Trends",
    title: "Navi Mumbai Airport Catalyst: 20% Jump in Property Values Since 2024",
    excerpt:
      "Panvel, Ulwe, and Dronagiri micro-markets are witnessing a buying frenzy as builders race to launch projects before the airport's commercial operations start next year.",
    date: "Jan 5, 2026",
    readTime: "5 min read",
    author: "Vikram Desai",
    authorAvatar: "https://i.pravatar.cc/80?img=3",
  },
  /* ── Home Loans (4 & 5) ── */
  {
    id: 28,
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=500&fit=crop",
    tag: "Home Loans",
    title: "Pre-Approved Home Loans: How They Give Buyers a Negotiation Edge",
    excerpt:
      "Having a pre-approval in hand before visiting a developer site has been shown to cut purchase timelines by 45% and help buyers negotiate up to 2% off listed prices.",
    date: "Jan 18, 2026",
    readTime: "3 min read",
    author: "Rohan Mehta",
    authorAvatar: "https://i.pravatar.cc/80?img=8",
  },
  {
    id: 29,
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=500&fit=crop",
    tag: "Home Loans",
    title: "Top 5 NBFC Home Loan Deals of 2026 for Self-Employed Buyers",
    excerpt:
      "Banks often reject self-employed applications on irregular income grounds. Here are the top NBFCs offering competitive rates with flexible documentation norms for entrepreneurs.",
    date: "Jan 8, 2026",
    readTime: "5 min read",
    author: "Ananya Patel",
    authorAvatar: "https://i.pravatar.cc/80?img=5",
  },
  /* ── Policy Update (4 & 5) ── */
  {
    id: 30,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop",
    tag: "Policy Update",
    title: "Digital Land Records Go Nationwide: What Buyers Must Know",
    excerpt:
      "The government's Bhu-Aadhaar and DILRMP initiative will link all land parcels to a unique ID by March 2026, drastically reducing title disputes and speeding up loan sanction.",
    date: "Jan 16, 2026",
    readTime: "4 min read",
    author: "Arjun Nair",
    authorAvatar: "https://i.pravatar.cc/80?img=11",
  },
  {
    id: 31,
    image: "https://images.unsplash.com/photo-1568607689150-17e625c1586e?w=800&h=500&fit=crop",
    tag: "Policy Update",
    title: "30-Minute SRO Registration: Maharashtra Pilots Express Property Transfer",
    excerpt:
      "A new digital-first sub-registrar process in 12 Maharashtra districts allows end-to-end property registration in under an hour, compared to the previous 2-3 day wait.",
    date: "Jan 2, 2026",
    readTime: "3 min read",
    author: "Priya Sharma",
    authorAvatar: "https://i.pravatar.cc/80?img=1",
  },
  /* ── Investment (4 & 5) ── */
  {
    id: 32,
    image: "https://images.unsplash.com/photo-1497366754035-f200581b4b08?w=800&h=500&fit=crop",
    tag: "Investment",
    title: "Fractional Ownership Platforms: Earn Grade-A Office Rental Yields from Rs 10L",
    excerpt:
      "Platforms like Strata and hBits let retail investors co-own premium commercial real estate. We compare lock-ins, dividend frequency, and exit mechanisms of the top 4 platforms.",
    date: "Jan 24, 2026",
    readTime: "6 min read",
    author: "Vikram Desai",
    authorAvatar: "https://i.pravatar.cc/80?img=3",
  },
  {
    id: 33,
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=500&fit=crop",
    tag: "Investment",
    title: "Industrial Plots Near Logistics Hubs Deliver 30% Returns in 24 Months",
    excerpt:
      "Warehousing demand driven by e-commerce has made DMIC and NICDC corridor plots high-return assets. Here's a guide to understanding zoning rules and entry price points.",
    date: "Jan 11, 2026",
    readTime: "5 min read",
    author: "Kavita Singh",
    authorAvatar: "https://i.pravatar.cc/80?img=16",
  },
  /* ── Affordable Housing (4 & 5) ── */
  {
    id: 34,
    image: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=800&h=500&fit=crop",
    tag: "Affordable Housing",
    title: "Government Rental Housing Scheme to Add 3 Lakh Units in 50 Cities",
    excerpt:
      "The Affordable Rental Housing Complexes scheme is being expanded to urban migrant workers in 50 cities, with monthly rent capped at Rs 3,000 for single-room units.",
    date: "Jan 17, 2026",
    readTime: "3 min read",
    author: "Rohan Mehta",
    authorAvatar: "https://i.pravatar.cc/80?img=8",
  },
  {
    id: 35,
    image: "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=800&h=500&fit=crop",
    tag: "Affordable Housing",
    title: "Satellite Towns of Delhi: Sub-30L Homes with 1-Hour Metro Commute",
    excerpt:
      "Neemrana, Bhiwadi, and Greater Faridabad offer affordable plots and apartments with upcoming RRTS and expressway links that will cut Delhi commute times in half.",
    date: "Jan 6, 2026",
    readTime: "4 min read",
    author: "Sneha Iyer",
    authorAvatar: "https://i.pravatar.cc/80?img=9",
  },
  /* ── Technology (4 & 5) ── */
  {
    id: 36,
    image: "https://images.unsplash.com/photo-1639762681057-408e52192e55?w=800&h=500&fit=crop",
    tag: "Technology",
    title: "Telangana Goes Live with Blockchain Property Registry — 0 Disputes in 6 Months",
    excerpt:
      "The state's blockchain-based land registry has processed 1.2 lakh transactions without a single title dispute. Other states are now studying the model for national rollout.",
    date: "Jan 21, 2026",
    readTime: "4 min read",
    author: "Arjun Nair",
    authorAvatar: "https://i.pravatar.cc/80?img=11",
  },
  {
    id: 37,
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=500&fit=crop",
    tag: "Technology",
    title: "AI Property Valuation Tools Achieve 94% Accuracy — Beating Human Appraisers",
    excerpt:
      "Machine learning models trained on 10 million transaction records can now estimate property values with near-human accuracy in 23 major cities, cutting appraisal time from days to seconds.",
    date: "Jan 7, 2026",
    readTime: "5 min read",
    author: "Priya Sharma",
    authorAvatar: "https://i.pravatar.cc/80?img=1",
  },
  /* ── Sustainability (4 & 5) ── */
  {
    id: 38,
    image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&h=500&fit=crop",
    tag: "Sustainability",
    title: "India's First Water-Positive Township Gets Premium Rating in 3 States",
    excerpt:
      "A 350-acre integrated township in Rajasthan harvests more water than it consumes. Experts say the water-positive certification adds 8-10% to resale values in water-stressed cities.",
    date: "Jan 27, 2026",
    readTime: "4 min read",
    author: "Vikram Desai",
    authorAvatar: "https://i.pravatar.cc/80?img=3",
  },
  {
    id: 39,
    image: "https://images.unsplash.com/photo-1593942215039-e87ce6e2c5a3?w=800&h=500&fit=crop",
    tag: "Sustainability",
    title: "EV Charging Points Mandatory for All New Homes Above 5 Floors from April 2026",
    excerpt:
      "The Bureau of Energy Efficiency has mandated EV-ready conduits and one charger per 10 parking slots in new residential projects above ground+4 floors, effective April 1, 2026.",
    date: "Jan 3, 2026",
    readTime: "3 min read",
    author: "Kavita Singh",
    authorAvatar: "https://i.pravatar.cc/80?img=16",
  },
  /* ── Lifestyle (4 & 5) ── */
  {
    id: 40,
    image: "https://images.unsplash.com/photo-1506477331477-33d5d8b3dc85?w=800&h=500&fit=crop",
    tag: "Lifestyle",
    title: "Resort-Style Second Homes Near Metros See 3x Sales Jump Post-Pandemic",
    excerpt:
      "Goa, Lonavala, Kasauli, and Coorg are seeing record second-home purchases from HNI buyers seeking a work-leisure balance. Weekend homes under Rs 80L are the sweet spot.",
    date: "Jan 23, 2026",
    readTime: "5 min read",
    author: "Rohan Mehta",
    authorAvatar: "https://i.pravatar.cc/80?img=8",
  },
  {
    id: 41,
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=500&fit=crop",
    tag: "Lifestyle",
    title: "Multigenerational Homes: The Architecture Trend Reshaping Indian Floor Plans",
    excerpt:
      "Developers are responding to joint-family demand with dual master suites, private entrances for in-laws, and soundproofed study rooms. Sales of 4BHK+ formats jumped 38% in 2025.",
    date: "Jan 9, 2026",
    readTime: "4 min read",
    author: "Ananya Patel",
    authorAvatar: "https://i.pravatar.cc/80?img=5",
  },
  /* ── Ahmedabad ── */
  {
    id: 42,
    image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&h=500&fit=crop",
    tag: "Market Trends",
    title: "Ahmedabad Real Estate Crosses ₹10,000/sq ft for the First Time in SG Highway Corridor",
    excerpt:
      "The SG Highway–Shilaj–Bopal belt in Ahmedabad has breached the ₹10K/sq ft mark for premium 3-4 BHK apartments. Infrastructure push and metro expansion are driving the surge.",
    date: "Mar 7, 2026",
    readTime: "4 min read",
    author: "Priya Sharma",
    authorAvatar: "https://i.pravatar.cc/80?img=1",
  },
  {
    id: 43,
    image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&h=500&fit=crop",
    tag: "Investment",
    title: "Ahmedabad's Gota–Tragad Belt Emerges as Top Investment Zone for Under ₹60L Budgets",
    excerpt:
      "With the BRTS expansion and upcoming metro phase-2 linking Gota to Gandhinagar, property prices in this micro-market have appreciated 24% in the last 12 months.",
    date: "Mar 5, 2026",
    readTime: "5 min read",
    author: "Vikram Desai",
    authorAvatar: "https://i.pravatar.cc/80?img=3",
  },
  {
    id: 44,
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=500&fit=crop",
    tag: "Home Loans",
    title: "Ahmedabad Banks Offer Record-Low 8.2% Home Loan Rates After RBI Signal",
    excerpt:
      "SBI and Bank of Baroda branches in Ahmedabad are offering special festive rates of 8.2% on home loans up to ₹75L, the lowest in the Gujarat market this decade.",
    date: "Mar 3, 2026",
    readTime: "3 min read",
    author: "Sneha Iyer",
    authorAvatar: "https://i.pravatar.cc/80?img=9",
  },
  {
    id: 45,
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=500&fit=crop",
    tag: "Affordable Housing",
    title: "Ahmedabad Municipal Corporation Approves 5,000 New Affordable Housing Units in Naroda",
    excerpt:
      "AMC's affordable housing push targets EWS and LIG families with 1-2 BHK units priced under ₹20L in the Naroda–Nikol corridor. Completion expected by mid-2027.",
    date: "Feb 28, 2026",
    readTime: "3 min read",
    author: "Arjun Nair",
    authorAvatar: "https://i.pravatar.cc/80?img=11",
  },
  /* ── Gandhinagar ── */
  {
    id: 46,
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=500&fit=crop",
    tag: "Policy Update",
    title: "Gandhinagar GIFT City Phase-3 Expansion to Add 10 Million Sq Ft of Commercial Space",
    excerpt:
      "The Gujarat government greenlights GIFT City's third expansion phase, attracting IFSC-registered firms and boosting residential demand in Gandhinagar's Kudasan–Sargasan belt.",
    date: "Mar 6, 2026",
    readTime: "5 min read",
    author: "Kavita Singh",
    authorAvatar: "https://i.pravatar.cc/80?img=16",
  },
  {
    id: 47,
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=500&fit=crop",
    tag: "Market Trends",
    title: "Gandhinagar Property Prices Jump 18% as IT Professionals Flock to GIFT City",
    excerpt:
      "Residential demand around Gandhinagar's Sector 21-30 has surged as multinational companies set up offices in GIFT City. 2-3 BHK apartments are the most sought-after formats.",
    date: "Mar 1, 2026",
    readTime: "4 min read",
    author: "Rohan Mehta",
    authorAvatar: "https://i.pravatar.cc/80?img=8",
  },
  /* ── Gujarat ── */
  {
    id: 48,
    image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&h=500&fit=crop",
    tag: "Policy Update",
    title: "Gujarat RERA Mandates QR Codes on All New Project Brochures for Buyer Transparency",
    excerpt:
      "Gujarat Real Estate Regulatory Authority introduces mandatory QR-linked project details on marketing material, making it the first state to enforce digital-first RERA compliance.",
    date: "Mar 4, 2026",
    readTime: "3 min read",
    author: "Ananya Patel",
    authorAvatar: "https://i.pravatar.cc/80?img=5",
  },
  {
    id: 49,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop",
    tag: "Technology",
    title: "Gujarat Launches State-Wide Digital Property Registration — Surat & Vadodara Go First",
    excerpt:
      "The Gujarat government rolls out blockchain-backed property registration across Surat and Vadodara, with Ahmedabad and Rajkot slated for Phase 2 by September 2026.",
    date: "Feb 25, 2026",
    readTime: "4 min read",
    author: "Priya Sharma",
    authorAvatar: "https://i.pravatar.cc/80?img=1",
  },
  {
    id: 50,
    image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=800&h=500&fit=crop",
    tag: "Investment",
    title: "Surat's Diamond Bourse Effect — Nearby Plots Appreciate 35% in 18 Months",
    excerpt:
      "Land parcels within 5 km of the Surat Diamond Bourse have seen explosive appreciation. Gujarat investors are now eyeing plots near infrastructure megaprojects for similar gains.",
    date: "Feb 20, 2026",
    readTime: "5 min read",
    author: "Vikram Desai",
    authorAvatar: "https://i.pravatar.cc/80?img=3",
  },
  {
    id: 51,
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=500&fit=crop",
    tag: "Economy",
    title: "Gujarat GDP Growth Hits 12.3% — Real Estate and Manufacturing Lead the Charge",
    excerpt:
      "Gujarat's economy grows at nearly double the national average, with the real estate sector contributing 14% of state GDP. Ahmedabad and Surat account for 60% of construction activity.",
    date: "Feb 18, 2026",
    readTime: "4 min read",
    author: "Kavita Singh",
    authorAvatar: "https://i.pravatar.cc/80?img=16",
  },
];

const tagColors: Record<string, string> = {
  "Market Trends": "text-rose-700",
  "Home Loans": "text-blue-700",
  "Policy Update": "text-amber-700",
  Investment: "text-emerald-700",
  "Stock Market": "text-orange-700",
  "Mutual Funds": "text-indigo-700",
  Banking: "text-teal-700",
  Economy: "text-slate-700",
  "Affordable Housing": "text-violet-700",
  Technology: "text-cyan-700",
  Sustainability: "text-lime-700",
  Lifestyle: "text-pink-700",
};

/* ━━━━━━━━━━━━━━━━━  Shared navigation helper  ━━━━━━━━━━━━━━━━━━━━━━ */

function useArticleNav() {
  const navigate = useNavigate();
  return (article: NewsArticle) => {
    sessionStorage.setItem("latestUpdatesScrollY", String(window.scrollY));
    navigate("/article", { state: { article } });
  };
}

function useKeyboardOpen(handler: () => void) {
  return (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handler();
    }
  };
}

/* ━━━━━━━━━━━━━  NYT Tag Label  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

interface TagLabelProps {
  tag: string;
  size?: "xs" | "sm";
  className?: string;
}

function TagLabel({ tag, size = "xs", className }: TagLabelProps) {
  return (
    <span
      className={cn(
        "nyt-label font-bold uppercase tracking-[0.15em]",
        size === "xs" ? "text-[10px]" : "text-[9px]",
        tagColors[tag] ?? "text-rose-700",
        className,
      )}
    >
      {tag}
    </span>
  );
}

/* ━━━━━━━━━━━━━  NYT Byline  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

interface BylineProps {
  author: string;
  date?: string;
  className?: string;
}

function Byline({ author, date, className }: BylineProps) {
  return (
    <address className={cn("nyt-byline not-italic", className)}>
      By {author.toUpperCase()}
      {date && (
        <time className="nyt-label text-[11px] text-muted-foreground ml-1 font-normal normal-case">
          · {date}
        </time>
      )}
    </address>
  );
}

/* ━━━━━━━━━━━━━━  Main Article (text 35% | image 65%)  ━━━━━━━━━━━━━━ */

interface MainArticleProps {
  item: NewsArticle;
  subItems?: NewsArticle[];
  isLead?: boolean;
}

function MainArticle({ item, subItems, isLead }: MainArticleProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const openArticle = useArticleNav();
  const onKeyDown = useKeyboardOpen(() => openArticle(item));

  if (isLead) {
    return (
      <motion.article
        ref={ref}
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="nyt-article-row nyt-lead cursor-pointer"
        aria-label={item.title}
        onClick={() => openArticle(item)}
        onKeyDown={onKeyDown}
        tabIndex={0}
        role="article"
      >
        <div className="nyt-lead-image-wrapper relative w-full h-96 overflow-hidden">
          <img
            src={item.image}
            alt={item.title}
            loading="eager"
            onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=500&fit=crop"; }}
            className="w-full h-full object-cover"
          />
          <div className="nyt-lead-text">
            <TagLabel tag={item.tag} className="nyt-lead-label" />
            <h3
              className={cn(
                "nyt-headline cursor-pointer leading-tight mt-2 mb-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm text-[1.6rem] sm:text-[2rem]",
              )}
            >
              {item.title}
            </h3>
            <p className="text-sm text-white line-clamp-2">
              {item.excerpt}
            </p>
          </div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className={cn("nyt-article-row")}
      aria-label={item.title}
    >
      {/* Text column */}
      <div className="pr-4 sm:pr-6">
        <TagLabel tag={item.tag} />
        <h3
          role="link"
          tabIndex={0}
          className={cn(
            "nyt-headline cursor-pointer hover:underline leading-tight mt-1 mb-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm text-[1.1rem] sm:text-[1.3rem]",
          )}
          onClick={() => openArticle(item)}
          onKeyDown={onKeyDown}
        >
          {item.title}
        </h3>
        <p className="nyt-article-body text-[0.9rem] text-[#333] leading-relaxed mb-3 line-clamp-4">
          {item.excerpt}
        </p>
        <Byline author={item.author} date={item.date} />
      </div>

      {/* Image column — black left border makes it clear which image belongs to this article */}
      <figure
        className="cursor-pointer overflow-hidden"
        onClick={() => openArticle(item)}
        tabIndex={0}
        role="link"
        aria-label={`Read: ${item.title}`}
        onKeyDown={onKeyDown}
      >
        <img
          src={item.image}
          alt={item.title}
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=500&fit=crop"; }}
          className="w-full h-full object-cover min-h-[230px]"
        />
      </figure>
    </motion.article>
  );
}

/* ━━━━━━━━━━━━━━  Aside Featured Article  ━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

interface AsideFeatureProps {
  item: NewsArticle;
}

function AsideFeature({ item }: AsideFeatureProps) {
  const openArticle = useArticleNav();
  const onKeyDown = useKeyboardOpen(() => openArticle(item));

  return (
    <article
      className="nyt-aside-article nyt-card cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm"
      onClick={() => openArticle(item)}
      onKeyDown={onKeyDown}
      tabIndex={0}
      role="article"
      aria-label={item.title}
    >
      <figure className="overflow-hidden mb-3">
        <img
          src={item.image}
          alt={item.title}
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=500&fit=crop"; }}
          className="w-full h-40 object-cover"
        />
      </figure>
      <TagLabel tag={item.tag} />
      <h3 className="nyt-headline text-[1rem] leading-snug mt-1 mb-1.5">{item.title}</h3>
      <p className="nyt-article-body text-[0.8rem] text-[#555] line-clamp-2 mb-1.5">{item.excerpt}</p>
      <Byline author={item.author} />
    </article>
  );
}

/* ━━━━━━━━━━━━━━  Opinion Item  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

interface OpinionItemProps {
  item: NewsArticle;
}

function OpinionItem({ item }: OpinionItemProps) {
  const openArticle = useArticleNav();
  const onKeyDown = useKeyboardOpen(() => openArticle(item));

  return (
    <article
      className="nyt-opinion-item nyt-card cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
      onClick={() => openArticle(item)}
      onKeyDown={onKeyDown}
      tabIndex={0}
      role="article"
      aria-label={item.title}
    >
      <div>
        <TagLabel tag={item.tag} size="sm" />
        <h4 className="nyt-headline text-[0.9rem] leading-snug mt-0.5 mb-1">{item.title}</h4>
        <Byline author={item.author} className="text-[10px]" />
      </div>
      <img
        src={item.image}
        alt={item.title}
        className="w-[76px] h-[60px] object-cover"
        onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop"; }}
      />
    </article>
  );
}

/* ━━━━━━━━━━━━━━  Topic Links Strip  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

interface TopicLinksProps {
  tags: string[];
}

function TopicLinks({ tags }: TopicLinksProps) {
  return (
    <nav className="nyt-topic-links" aria-label="Topic navigation">
      {tags.map((tag) => (
        <span
          key={tag}
          role="link"
          tabIndex={0}
          className={cn("nyt-topic-link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm", tagColors[tag])}
        >
          {tag}
        </span>
      ))}
    </nav>
  );
}

/* ━━━━━━━━━━━━━━  Small Paired Article  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

interface SmallPairedArticleProps {
  item: NewsArticle;
}

function SmallPairedArticle({ item }: SmallPairedArticleProps) {
  const openArticle = useArticleNav();
  const onKeyDown = useKeyboardOpen(() => openArticle(item));

  return (
    <article
      className="nyt-card cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
      onClick={() => openArticle(item)}
      onKeyDown={onKeyDown}
      tabIndex={0}
      role="article"
      aria-label={item.title}
    >
      <figure className="overflow-hidden mb-2">
        <img
          src={item.image}
          alt={item.title}
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=500&fit=crop"; }}
          className="w-full h-24 object-cover"
        />
      </figure>
      <h4 className="nyt-headline text-[0.85rem] leading-snug mb-1 line-clamp-3">{item.title}</h4>
      <Byline author={item.author} className="text-[10px]" />
    </article>
  );
}

/* ━━━━━━━━━━━━━  Masthead Rule Strip  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

interface MastheadStripProps {
  left: string;
  center: string;
  right: string;
  bold?: boolean;
  className?: string;
}

function MastheadStrip({ left, center, right, bold, className }: MastheadStripProps) {
  return (
    <div
      className={cn(
        "flex justify-between items-center py-1",
        bold
          ? "border-t-4 border-b border-t-[#111] border-b-[#111]"
          : "border-t-[3px] border-b border-t-[#111] border-b-[#111]",
        className,
      )}
    >
      <span className="nyt-label text-[10px] tracking-[0.06em] text-[#333] hidden sm:block">{left}</span>
      <span className="nyt-label text-[10px] italic text-[#333]">{center}</span>
      <span className="nyt-label text-[10px] tracking-[0.06em] text-[#333] hidden sm:block">{right}</span>
    </div>
  );
}

/* ━━━━━━━━━━━━━  Loading Skeleton  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function NytSkeleton() {
  return (
    <div className="animate-pulse space-y-8 pt-8" role="status" aria-label="Loading articles">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-3">
            <div className="h-48 bg-muted" />
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-full" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}

/* ────────── Main page ────────── */

const LatestUpdatesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { articles, breakingNews, loading, error } = useRealEstateNews(20);
  const location = useLocation();

  const pendingScrollRef = useRef<number | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("latestUpdatesScrollY");
    if (saved) {
      pendingScrollRef.current = parseInt(saved, 10);
      sessionStorage.removeItem("latestUpdatesScrollY");
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [location.key]);

  useEffect(() => {
    if (!loading && pendingScrollRef.current !== null) {
      const target = pendingScrollRef.current;
      pendingScrollRef.current = null;
      requestAnimationFrame(() => {
        window.scrollTo({ top: target, behavior: "instant" });
      });
    }
  }, [loading]);

  const staticArticles = allUpdates.map((a) => {
    const text = a.title + " " + a.excerpt;
    const { importance, locationTag } = computeImportance(text, new Date().toISOString());
    return {
      ...a,
      id: String(a.id),
      link: "#",
      importance,
      locationTag,
      publishedAt: new Date().toISOString(),
      source: "static",
    };
  }) as NewsArticle[];

  // Always pad with static articles so both columns are always full (50+ total)
  const liveArticles = !loading && !error && articles.length ? articles : [];
  const liveTitles = new Set(liveArticles.map((a) => a.title.slice(0, 40)));
  const paddedStatic = staticArticles.filter((a) => !liveTitles.has(a.title.slice(0, 40)));
  const source: NewsArticle[] = [...liveArticles, ...paddedStatic];

  const filtered = searchQuery
    ? source.filter((a) =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : source;

  /* Partition: aside gets every 3rd article, main gets the rest */
  const asideItems = filtered.filter((_, i) => i % 3 === 1);
  const mainItems = filtered.filter((_, i) => i % 3 !== 1);
  const a = mainItems;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen nyt-paper-bg">
      <Navbar forceScrolled />

      {/* ═══════ NYT MASTHEAD ═══════ */}
      <section className="pt-28 pb-0 px-4 sm:px-6 nyt-masthead-bg">
        <div className="max-w-7xl mx-auto">

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-2 text-xs text-muted-foreground nyt-label">
              <li><Link to="/" className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">Home</Link></li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="text-foreground font-medium">Latest Updates</li>
            </ol>
          </nav>

          {/* ── Top rule strip ── */}
          <MastheadStrip
            bold
            left="VOL. I · NO. 1 &nbsp; AHMEDABAD, INDIA"
            center="The Pulse of Property and Finance"
            right="LATE CITY EDITION &nbsp; FREE"
          />

          {/* ── Giant nameplate ── */}
          <div className="py-2 sm:py-3 text-center">
            <h1>
              <img
                src="https://see.fontimg.com/api/rf5/VGLD6/NGM3YjBiZTRhNTEyNGRiMGIzOTQzYjgyMzJmNGIwZTkudHRm/VGhlIFRhYXRoeWEgVGltZXM/lodeh.png?r=fs&h=81&w=1250&fg=000000&bg=FFFFFF&tb=1&s=65"
                alt="The Taathya Times"
                className="mx-auto w-full max-w-[280px] sm:max-w-[420px] md:max-w-[560px] lg:max-w-[750px] h-auto"
                draggable={false}
              />
            </h1>
          </div>

          {/* ── Below-nameplate strip: date | tagline | edition ── */}
          <MastheadStrip
            left={today}
            right="Est. 2026"
          />

          {/* ── Breaking news ticker ── */}
          <AnimatePresence>
            {breakingNews.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-3 py-2 border-b border-[#e2e0da]">
                  <span className="flex items-center gap-1 bg-red-600 text-white text-[10px] font-bold uppercase px-2 py-0.5 tracking-wider shrink-0 nyt-label">
                    <Zap size={10} /> Breaking
                  </span>
                  <div className="overflow-hidden whitespace-nowrap">
                    <motion.div
                      animate={{ x: ["0%", "-50%"] }}
                      transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
                      className="flex gap-8"
                    >
                      {[...breakingNews, ...breakingNews].map((item, i) => (
                        <span key={`${item.id}-${i}`} className="nyt-article-body text-xs text-foreground/80 shrink-0">
                          {item.title}
                        </span>
                      ))}
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Search ── */}
          <div className="flex justify-end py-2">
            <div className="relative w-full sm:w-56">
              <label htmlFor="article-search" className="sr-only">Search articles</label>
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input
                id="article-search"
                type="search"
                placeholder="Search articles…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-[#c5b89a] bg-[#fdf8f0] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-[#111] transition text-xs nyt-label"
              />
            </div>
          </div>

        </div>
      </section>

      {/* ═══════ CONTINUOUS NEWSPAPER CONTENT ═══════ */}
      <section className="px-4 sm:px-6 pt-6 pb-20">
        <div className="max-w-7xl mx-auto">

          {loading ? (
            <NytSkeleton />
          ) : a.length === 0 ? (
            <div className="text-center py-24">
              <p className="nyt-serif text-2xl text-foreground mb-2">No articles found</p>
              <p className="nyt-article-body text-muted-foreground text-sm">Try adjusting your search.</p>
            </div>
          ) : (
            <>
              {/* ═══════ NYT CLONE: MAIN + ASIDE GRID ═══════ */}
              <div className="nyt-page-grid">
                {/* ── MAIN COLUMN (left, 2/3) ── */}
                <main className="nyt-main-col">
                  {/* Lead article */}
                  {a[0] && (
                    <MainArticle item={a[0]} isLead />
                  )}

                  <TopicLinks tags={["Market Trends", "Home Loans", "Policy Update", "Investment"]} />

                  {/* Each article gets its own full row — unambiguous image pairing */}
                  {a.slice(1, 7).map((item) => (
                    <MainArticle key={item.id} item={item} />
                  ))}

                  <TopicLinks tags={["Affordable Housing", "Technology", "Sustainability", "Lifestyle"]} />

                  {a.slice(7, 13).map((item) => (
                    <MainArticle key={item.id} item={item} />
                  ))}

                  <TopicLinks tags={["Ahmedabad", "Gandhinagar", "Gujarat", "Economy"]} />

                  {a.slice(13).map((item) => (
                    <MainArticle key={item.id} item={item} />
                  ))}
                </main>

                {/* ── ASIDE COLUMN (right, 1/3) ── */}
                <aside className="nyt-aside-col">
                  {/* Featured aside articles */}
                  {asideItems[0] && <AsideFeature item={asideItems[0]} />}
                  {asideItems[1] && <AsideFeature item={asideItems[1]} />}

                  {/* Editor's Picks */}
                  <div className="nyt-aside-section-header">Editor's Picks</div>
                  {asideItems.slice(2, 8).filter(Boolean).map((item) => (
                    <OpinionItem key={item.id} item={item} />
                  ))}

                  {/* Small paired articles */}
                  {asideItems[10] && (
                    <>
                      <div className="nyt-aside-section-header">More Stories</div>
                      <div className="nyt-small-pair">
                        {asideItems[10] && <SmallPairedArticle item={asideItems[10]} />}
                        {asideItems[11] && <SmallPairedArticle item={asideItems[11]} />}
                      </div>
                      <div className="nyt-small-pair mt-4">
                        {asideItems[12] && <SmallPairedArticle item={asideItems[12]} />}
                        {asideItems[13] && <SmallPairedArticle item={asideItems[13]} />}
                      </div>
                    </>
                  )}

                  {/* Additional aside articles */}
                  {asideItems.slice(14).filter(Boolean).map((item) => (
                    <AsideFeature key={item.id} item={item} />
                  ))}
                </aside>
              </div>

              {/* ── Newsletter CTA ── */}
              <aside className="mt-16 border-t-2 border-[#2a1f0e] pt-8 nyt-newsletter-aside" aria-label="Newsletter signup">
                <div className="max-w-lg mx-auto text-center">
                  <h3 className="nyt-headline text-2xl font-bold text-foreground mb-2">The Morning Property Brief</h3>
                  <p className="nyt-article-body text-muted-foreground text-sm mb-6 leading-relaxed">
                    Get the day's most important real estate and finance stories delivered to your inbox.
                  </p>
                  <form
                    className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
                    onSubmit={(e) => e.preventDefault()}
                  >
                    <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                    <input
                      id="newsletter-email"
                      type="email"
                      placeholder="Your email address"
                      required
                      className="flex-1 px-4 py-3 border border-[#c5b89a] bg-[#fdf8f0] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-[#111] transition text-sm nyt-article-body"
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 bg-[#111] text-white font-bold text-sm hover:bg-[#333] transition nyt-label tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      Subscribe
                    </button>
                  </form>
                </div>
              </aside>
            </>
          )}

          {/* Back to home */}
          <div className="flex justify-center mt-12">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group nyt-label focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LatestUpdatesPage;
