'use client'

import { useLanguage } from '@/lib/i18n'
import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import {
  FileText,
  Users,
  CloudRain,
  AlertTriangle,
  Building2,
  Leaf,
  Calendar,
  Shield,
  Trash2,
  TreePine,
  Recycle,
  Droplets,
  Wind,
  Flame,
  Mountain,
  Home,
  Bell,
  ArrowRight,
  X,
  MapPin,
  ChevronDown,
} from 'lucide-react'

// Color constants matching the design requirements
const COLORS = {
  navy: '#080878',
  orange: '#FF922B',
  green: '#168A35',
  teal: '#00966B',
  blue: '#2878DF',
  red: '#E53935',
  lightBg: '#F8FAFC',
  lightOrange: '#FFF4E7',
  white: '#FFFFFF',
  critical: '#EF4444',
  warning: '#FF922B',
  general: '#168A35',
  info: '#3B82F6',
}

interface Category {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  bgColor: string
  items: string[]
}

interface Alert {
  id: string
  title: string
  category: string
  description: string
  location: string
  publishedAt: string
  source: string
  severity: 'critical' | 'warning' | 'general' | 'info'
  readMoreUrl?: string
}

const categories: Category[] = [
  {
    id: 'government',
    title: 'Government Schemes & Initiatives',
    description: 'Swachh Bharat Mission, environmental schemes, subsidies, welfare initiatives, eligibility and deadlines.',
    icon: <FileText className="w-6 h-6" />,
    color: COLORS.navy,
    bgColor: '#E8E8FF',
    items: ['Swachh Bharat Mission', 'Environmental Government Schemes', 'Subsidies & Welfare Initiatives', 'Eligibility & Application Deadlines', 'Government Announcements'],
  },
  {
    id: 'cleanliness',
    title: 'Cleanliness Drives & Events',
    description: 'Swachhata campaigns, community drives, tree plantation, recycling events, municipal activities.',
    icon: <Users className="w-6 h-6" />,
    color: COLORS.green,
    bgColor: '#E0F7E9',
    items: ['Swachhata Campaigns', 'Community Cleanliness Drives', 'Tree Plantation Programmes', 'Recycling Awareness Events', 'Municipal Cleanliness Activities'],
  },
  {
    id: 'weather',
    title: 'Weather Alerts',
    description: 'Heavy rainfall, heatwaves, thunderstorms, cyclones, flood-related warnings.',
    icon: <CloudRain className="w-6 h-6" />,
    color: COLORS.blue,
    bgColor: '#E0F0FF',
    items: ['Heavy Rainfall', 'Heatwaves', 'Thunderstorms & Lightning', 'Cyclones', 'Flood-Related Warnings'],
  },
  {
    id: 'disaster',
    title: 'Disaster & Emergency Alerts',
    description: 'Floods, earthquakes, cyclones, landslides, fire emergencies, evacuation & safety instructions.',
    icon: <AlertTriangle className="w-6 h-6" />,
    color: COLORS.red,
    bgColor: '#FFF0F0',
    items: ['Floods', 'Earthquakes', 'Cyclones', 'Landslides', 'Fire Emergencies', 'Evacuation & Safety Instructions'],
  },
  {
    id: 'municipal',
    title: 'Local Municipal Updates',
    description: 'Garbage collection schedules, sanitation announcements, waterlogging, dumping hotspots, maintenance.',
    icon: <Building2 className="w-6 h-6" />,
    color: COLORS.orange,
    bgColor: '#FFF4E7',
    items: ['Garbage Collection Schedules', 'Local Sanitation Announcements', 'Waterlogging Information', 'Waste Dumping Hotspots', 'Municipal Maintenance Notices'],
  },
  {
    id: 'environmental',
    title: 'Environmental Awareness',
    description: 'Recycling tips, waste segregation, plastic reduction, sustainable living, environmental campaigns.',
    icon: <Leaf className="w-6 h-6" />,
    color: COLORS.teal,
    bgColor: '#E0F7F0',
    items: ['Recycling Tips', 'Waste Segregation Awareness', 'Plastic Reduction', 'Sustainable Living', 'Environmental Campaigns'],
  },
]

const mockAlerts: Alert[] = [
  {
    id: '1',
    title: 'Swachh Bharat Mission 2.0 - Extended Deadline for Applications',
    category: 'government',
    description: 'The Ministry of Housing and Urban Affairs has extended the application deadline for Swachh Bharat Mission 2.0 components. Urban local bodies can now apply until March 31, 2025.',
    location: 'All India',
    publishedAt: '2025-01-15T10:30:00Z',
    source: 'Ministry of Housing and Urban Affairs (MoHUA)',
    severity: 'info',
  },
  {
    id: '2',
    title: 'Heavy Rainfall Warning - Jharkhand Districts',
    category: 'weather',
    description: 'IMD has issued Orange Alert for heavy to very heavy rainfall in Ranchi, Jamshedpur, Dhanbad, and Bokaro districts. Citizens advised to avoid unnecessary travel.',
    location: 'Jharkhand (Ranchi, Jamshedpur, Dhanbad, Bokaro)',
    publishedAt: '2025-01-14T14:00:00Z',
    source: 'India Meteorological Department (IMD)',
    severity: 'warning',
  },
  {
    id: '3',
    title: 'Flood Evacuation Notice - Low-lying Areas of Patna',
    category: 'disaster',
    description: 'Due to rising Ganga water levels, District Administration Patna has ordered evacuation of low-lying areas. Relief camps established at 5 locations.',
    location: 'Bihar (Patna)',
    publishedAt: '2025-01-14T08:00:00Z',
    source: 'District Administration Patna / NDMA',
    severity: 'critical',
  },
  {
    id: '4',
    title: 'Weekly Garbage Collection Schedule Update - Ranchi Municipal Corporation',
    category: 'municipal',
    description: 'RMC has revised garbage collection timings for Wards 1-15. Wet waste collection: 6:00-8:00 AM. Dry waste: 8:00-10:00 AM. Effective from Jan 20.',
    location: 'Jharkhand (Ranchi)',
    publishedAt: '2025-01-13T16:00:00Z',
    source: 'Ranchi Municipal Corporation',
    severity: 'general',
  },
  {
    id: '5',
    title: 'National Cleanliness Drive - Swachhata Hi Seva 2025',
    category: 'cleanliness',
    description: 'Annual Swachhata Hi Seva campaign launched. Citizens, schools, and organizations invited to participate in cleanliness activities from Sept 15 - Oct 2, 2025.',
    location: 'All India',
    publishedAt: '2025-01-12T11:00:00Z',
    source: 'Ministry of Jal Shakti / Swachh Bharat Mission',
    severity: 'info',
  },
  {
    id: '6',
    title: 'Plastic Waste Management Rules - New Compliance Guidelines',
    category: 'environmental',
    description: 'CPCB has issued revised guidelines for plastic waste management. Producers, importers, and brand owners must register by Feb 28, 2025. Extended Producer Responsibility (EPR) targets updated.',
    location: 'All India',
    publishedAt: '2025-01-11T09:00:00Z',
    source: 'Central Pollution Control Board (CPCB)',
    severity: 'warning',
  },
  {
    id: '7',
    title: 'Cyclone Michaung - Landfall Warning for Odisha Coast',
    category: 'disaster',
    description: 'Cyclone Michaung likely to intensify and cross Odisha coast near Paradip by tomorrow evening. Wind speeds 100-110 kmph. Fishermen advised not to venture into sea.',
    location: 'Odisha (Coastal Districts)',
    publishedAt: '2025-01-10T18:00:00Z',
    source: 'India Meteorological Department (IMD) / NDMA',
    severity: 'critical',
  },
  {
    id: '8',
    title: 'Heatwave Alert - North India Regions',
    category: 'weather',
    description: 'IMD predicts heatwave conditions over Delhi, Haryana, Punjab, West UP, and Rajasthan for next 3 days. Maximum temperatures 43-45°C. Stay hydrated, avoid sun exposure.',
    location: 'North India (Delhi, Haryana, Punjab, UP, Rajasthan)',
    publishedAt: '2025-01-09T12:00:00Z',
    source: 'India Meteorological Department (IMD)',
    severity: 'warning',
  },
  {
    id: '9',
    title: 'Community Tree Plantation Drive - Jamshedpur',
    category: 'cleanliness',
    description: 'Tata Steel Foundation organizing mega tree plantation drive on Jan 26, 2025. Target: 10,000 saplings. Volunteers welcome. Meeting point: Jubilee Park, 7:00 AM.',
    location: 'Jharkhand (Jamshedpur)',
    publishedAt: '2025-01-08T10:00:00Z',
    source: 'Tata Steel Foundation / Jamshedpur Notified Area Committee',
    severity: 'general',
  },
  {
    id: '10',
    title: 'Waterlogging Hotspots Identified - Dhanbad Municipal Corporation',
    category: 'municipal',
    description: 'DMC has identified 12 waterlogging hotspots for monsoon preparedness. Drain cleaning work in progress. Citizens can report new hotspots via Swachh Sankalp app.',
    location: 'Jharkhand (Dhanbad)',
    publishedAt: '2025-01-07T15:00:00Z',
    source: 'Dhanbad Municipal Corporation',
    severity: 'info',
  },
  {
    id: '11',
    title: 'PM Surya Ghar Muft Bijli Yojana - Rooftop Solar Subsidy',
    category: 'government',
    description: 'Households can avail up to ₹78,000 subsidy for rooftop solar installation. Online registration open at pmsuryaghar.gov.in. Over 1 crore households targeted.',
    location: 'All India',
    publishedAt: '2025-01-06T11:00:00Z',
    source: 'Ministry of New and Renewable Energy (MNRE)',
    severity: 'info',
  },
  {
    id: '12',
    title: 'E-Waste Collection Drive - Bokaro Steel City',
    category: 'environmental',
    description: 'Bokaro Steel Plant organizing e-waste collection drive Jan 20-25. Accepting old mobiles, laptops, batteries, chargers. Drop-off points at 5 locations across city.',
    location: 'Jharkhand (Bokaro)',
    publishedAt: '2025-01-05T09:00:00Z',
    source: 'SAIL Bokaro Steel Plant / Jharkhand State Pollution Control Board',
    severity: 'general',
  },
  // Additional Government Schemes alerts
  {
    id: '13',
    title: 'Swachh Survekshan 2025 Results Announced',
    category: 'government',
    description: 'Ministry of Housing and Urban Affairs releases Swachh Survekshan 2025 rankings. Indore retains top spot for 7th consecutive year.',
    location: 'All India',
    publishedAt: '2025-01-20T10:00:00Z',
    source: 'Ministry of Housing and Urban Affairs (MoHUA)',
    severity: 'info',
  },
  {
    id: '14',
    title: 'National Green Hydrogen Mission Guidelines Released',
    category: 'government',
    description: 'MNRE issues detailed implementation guidelines for the National Green Hydrogen Mission with ₹19,744 crore outlay.',
    location: 'All India',
    publishedAt: '2025-01-18T14:30:00Z',
    source: 'Ministry of New and Renewable Energy (MNRE)',
    severity: 'info',
  },
  {
    id: '15',
    title: 'Atal Bhujal Yojana Extended to More States',
    category: 'government',
    description: 'Groundwater management scheme Atal Bhujal Yojana expanded to cover additional water-stressed districts across 7 states.',
    location: 'Multiple States',
    publishedAt: '2025-01-16T11:00:00Z',
    source: 'Ministry of Jal Shakti',
    severity: 'info',
  },
  {
    id: '16',
    title: 'PM-KUSUM Scheme Solar Pump Subsidy Enhanced',
    category: 'government',
    description: 'Central government increases subsidy for solar pumps under PM-KUSUM. Farmers can now avail up to 90% support in select regions.',
    location: 'All India',
    publishedAt: '2025-01-14T09:00:00Z',
    source: 'Ministry of New and Renewable Energy (MNRE)',
    severity: 'info',
  },
  // Additional Weather alerts
  {
    id: '17',
    title: 'IMD Issues Dense Fog Advisory for Northern States',
    category: 'weather',
    description: 'Dense to very dense fog likely over Punjab, Haryana, Delhi, UP, and Bihar during early morning hours. Visibility may drop below 50m.',
    location: 'North India',
    publishedAt: '2025-01-19T06:00:00Z',
    source: 'India Meteorological Department (IMD)',
    severity: 'warning',
  },
  {
    id: '18',
    title: 'Cold Wave Conditions Expected in Rajasthan and MP',
    category: 'weather',
    description: 'Severe cold wave conditions predicted over parts of Rajasthan and Madhya Pradesh. Minimum temperatures may drop 4-6°C below normal.',
    location: 'Rajasthan, Madhya Pradesh',
    publishedAt: '2025-01-17T18:00:00Z',
    source: 'India Meteorological Department (IMD)',
    severity: 'warning',
  },
  {
    id: '19',
    title: 'Thunderstorm with Hail Alert for Northeast States',
    category: 'weather',
    description: 'IMD issues alert for thunderstorms accompanied by hail over Assam, Meghalaya, and Arunachal Pradesh for next 48 hours.',
    location: 'Northeast India',
    publishedAt: '2025-01-15T12:00:00Z',
    source: 'India Meteorological Department (IMD)',
    severity: 'warning',
  },
  {
    id: '20',
    title: 'Monsoon Onset Forecast for Kerala Coast',
    category: 'weather',
    description: 'Southwest monsoon likely to set over Kerala by June 1, 2025. Normal onset date is June 1. Favorable conditions developing.',
    location: 'Kerala',
    publishedAt: '2025-01-13T10:00:00Z',
    source: 'India Meteorological Department (IMD)',
    severity: 'info',
  },
  // Additional Disaster alerts
  {
    id: '21',
    title: 'Landslide Warning for Uttarakhand Hill Districts',
    category: 'disaster',
    description: 'Heavy rainfall triggers landslide risk in Chamoli, Rudraprayag, and Uttarkashi districts. Residents advised to avoid vulnerable slopes.',
    location: 'Uttarakhand',
    publishedAt: '2025-01-19T08:00:00Z',
    source: 'State Disaster Management Authority / IMD',
    severity: 'warning',
  },
  {
    id: '22',
    title: 'Earthquake Tremors Felt in Delhi-NCR Region',
    category: 'disaster',
    description: 'Magnitude 4.2 earthquake with epicenter in Haryana felt across Delhi-NCR. No major damage reported. Aftershocks possible.',
    location: 'Delhi-NCR',
    publishedAt: '2025-01-18T22:30:00Z',
    source: 'National Centre for Seismology',
    severity: 'info',
  },
  {
    id: '23',
    title: 'Forest Fire Alert for Himachal Pradesh Forests',
    category: 'disaster',
    description: 'High forest fire risk in Shimla, Kullu, and Mandi districts due to dry weather. Fire watch towers activated. Public advised to report smoke.',
    location: 'Himachal Pradesh',
    publishedAt: '2025-01-16T14:00:00Z',
    source: 'State Forest Department / NDMA',
    severity: 'warning',
  },
  {
    id: '24',
    title: 'Urban Flooding Advisory for Mumbai Metropolitan Region',
    category: 'disaster',
    description: 'High tide combined with heavy rainfall may cause waterlogging in low-lying areas of Mumbai, Thane, and Navi Mumbai. BMC activates pumps.',
    location: 'Maharashtra (Mumbai Region)',
    publishedAt: '2025-01-14T16:00:00Z',
    source: 'BMC / IMD',
    severity: 'warning',
  },
  // Additional Municipal alerts
  {
    id: '25',
    title: 'New Waste Segregation Rules Notified for Bengaluru',
    category: 'municipal',
    description: 'BBMP mandates 3-way waste segregation (wet, dry, sanitary) for all households and commercial establishments. Fines for non-compliance from Feb 1.',
    location: 'Karnataka (Bengaluru)',
    publishedAt: '2025-01-19T11:00:00Z',
    source: 'Bruhat Bengaluru Mahanagara Palike (BBMP)',
    severity: 'info',
  },
  {
    id: '26',
    title: 'Pune Municipal Corporation Launches Door-to-Door E-Waste Collection',
    category: 'municipal',
    description: 'PMC starts free doorstep e-waste pickup service for residents. Schedule pickup via PMC app or helpline. Covers all 15 wards.',
    location: 'Maharashtra (Pune)',
    publishedAt: '2025-01-17T10:00:00Z',
    source: 'Pune Municipal Corporation (PMC)',
    severity: 'info',
  },
  {
    id: '27',
    title: 'Chennai Water Supply Schedule Revised for Summer',
    category: 'municipal',
    description: 'Chennai Metro Water revises supply timings due to summer demand. Alternate day supply in some zones. Tanker requests via 1916 helpline.',
    location: 'Tamil Nadu (Chennai)',
    publishedAt: '2025-01-15T09:00:00Z',
    source: 'Chennai Metropolitan Water Supply and Sewerage Board',
    severity: 'info',
  },
  {
    id: '28',
    title: 'Ahmedabad AMC Identifies 25 New Waste Dumping Hotspots',
    category: 'municipal',
    description: 'AMC survey reveals 25 new illegal dumping sites. Enforcement drives planned. Citizens can report via Swachhata App or 155303.',
    location: 'Gujarat (Ahmedabad)',
    publishedAt: '2025-01-13T15:00:00Z',
    source: 'Ahmedabad Municipal Corporation (AMC)',
    severity: 'warning',
  },
  // Additional Cleanliness alerts
  {
    id: '29',
    title: 'Swachhata Hi Seva 2025 Registrations Open Nationwide',
    category: 'cleanliness',
    description: 'Online registrations open for Swachhata Hi Seva 2025 campaign. Schools, colleges, RWAs, and NGOs can register activities on swachhatahiseva.gov.in.',
    location: 'All India',
    publishedAt: '2025-01-20T09:00:00Z',
    source: 'Ministry of Jal Shakti',
    severity: 'info',
  },
  {
    id: '30',
    title: 'National Plastic-Free Campus Drive Launched for Universities',
    category: 'cleanliness',
    description: 'UGC and MoEFCC launch Plastic-Free Campus certification. Over 500 universities to participate. Single-use plastic banned on campuses.',
    location: 'All India',
    publishedAt: '2025-01-18T11:00:00Z',
    source: 'UGC / Ministry of Environment, Forest and Climate Change',
    severity: 'info',
  },
  {
    id: '31',
    title: 'River Ganga Cleanliness Drive - Varanasi to Ganga Sagar',
    category: 'cleanliness',
    description: 'Namami Gange organizes month-long cleanliness drive along Ganga. 50+ ghats to be cleaned. Volunteers and NCC cadets participating.',
    location: 'Uttar Pradesh, Bihar, Jharkhand, West Bengal',
    publishedAt: '2025-01-16T08:00:00Z',
    source: 'National Mission for Clean Ganga (NMCG)',
    severity: 'info',
  },
  {
    id: '32',
    title: 'Zero Waste Campus Challenge for Schools in Kerala',
    category: 'cleanliness',
    description: 'Kerala government launches Zero Waste Campus Challenge for all government and aided schools. Composting and recycling mandatory.',
    location: 'Kerala',
    publishedAt: '2025-01-14T12:00:00Z',
    source: 'Kerala State Pollution Control Board / Education Dept.',
    severity: 'info',
  },
  // Additional Environmental alerts
  {
    id: '33',
    title: 'India Joins Global Plastic Pollution Treaty Negotiations',
    category: 'environmental',
    description: 'India participates in INC-5 talks for legally binding global treaty on plastic pollution. Advocates for common but differentiated responsibilities.',
    location: 'Global',
    publishedAt: '2025-01-19T14:00:00Z',
    source: 'Ministry of Environment, Forest and Climate Change',
    severity: 'info',
  },
  {
    id: '34',
    title: 'New Battery Waste Management Rules Notified',
    category: 'environmental',
    description: 'MoEFCC notifies Battery Waste Management Rules 2025. Extended Producer Responsibility targets set for manufacturers and importers.',
    location: 'All India',
    publishedAt: '2025-01-17T15:00:00Z',
    source: 'Ministry of Environment, Forest and Climate Change',
    severity: 'warning',
  },
  {
    id: '35',
    title: 'Green Credit Programme Guidelines Released for Public Consultation',
    category: 'environmental',
    description: 'MoEFCC releases draft Green Credit Rules for public feedback. Individuals and entities can earn tradable credits for eco-friendly actions.',
    location: 'All India',
    publishedAt: '2025-01-15T10:00:00Z',
    source: 'Ministry of Environment, Forest and Climate Change',
    severity: 'info',
  },
  {
    id: '36',
    title: 'National Mission on Sustainable Habitat Progress Report',
    category: 'environmental',
    description: 'MoHUA releases mid-term review of National Mission on Sustainable Habitat. Energy efficiency in buildings improved by 22% since 2019.',
    location: 'All India',
    publishedAt: '2025-01-13T16:00:00Z',
    source: 'Ministry of Housing and Urban Affairs (MoHUA)',
    severity: 'info',
  },
]

const severityStyles = {
  critical: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  warning: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  general: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
}

export default function AlertsPage() {
  const { t, locale } = useLanguage()
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const alertsPerPage = 7

  const filteredAlerts = useMemo(() => {
    return [...mockAlerts].sort((a, b) => {
      const dateA = new Date(a.publishedAt).getTime()
      const dateB = new Date(b.publishedAt).getTime()
      return dateB - dateA // newest first
    })
  }, [])

  const totalPages = Math.ceil(filteredAlerts.length / alertsPerPage)
  const paginatedAlerts = useMemo(() => {
    const start = (currentPage - 1) * alertsPerPage
    return filteredAlerts.slice(start, start + alertsPerPage)
  }, [filteredAlerts, currentPage])

  const categoryAlerts = useMemo(() => {
    const grouped: Record<string, Alert[]> = {}
    mockAlerts.forEach(alert => {
      if (!grouped[alert.category]) grouped[alert.category] = []
      grouped[alert.category].push(alert)
    })
    return grouped
  }, [])

  const getAlertsForCategory = (categoryId: string): Alert[] => {
    return categoryAlerts[categoryId] || []
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(locale === 'hi' ? 'hi-IN' : 'en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString(locale === 'hi' ? 'hi-IN' : 'en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  // Handle escape key and body scroll lock
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedCategory(null)
      }
    }

    if (selectedCategory) {
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleEscape)
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
      document.removeEventListener('keydown', handleEscape)
    }
  }, [selectedCategory])

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedCategory(null)
    }
  }

  const severityStyles = {
    critical: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
    warning: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
    general: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
    info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  }

  const categoryAlertsList = getAlertsForCategory(selectedCategory?.id || '').sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2, general: 3 }
    return severityOrder[a.severity] - severityOrder[b.severity]
  })

  const Modal = () => {
    if (!selectedCategory) return null

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50"
        onClick={handleOverlayClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div
          className="modal-responsive bg-white rounded-2xl shadow-xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: `linear-gradient(145deg, ${selectedCategory.color}15 0%, ${selectedCategory.color}25 100%)`, border: `1px solid ${selectedCategory.color}30` }}>
                <span style={{ color: selectedCategory.color }} className="icon-fluid">{selectedCategory.icon}</span>
              </div>
              <h2 id="modal-title" className="text-xl sm:text-2xl font-semibold text-navy truncate" style={{ color: COLORS.navy }}>
                {selectedCategory.title}
              </h2>
            </div>
            <button
              onClick={() => setSelectedCategory(null)}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700 flex-shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 modal-content-responsive">
            {categoryAlertsList.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: `linear-gradient(145deg, ${selectedCategory.color}15 0%, ${selectedCategory.color}25 100%)`, border: `1px solid ${selectedCategory.color}30` }}>
                  <span style={{ color: selectedCategory.color, fontSize: 'clamp(1.5rem, 3vw, 2rem)' }} className="icon-fluid">{selectedCategory.icon}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-medium text-gray-600 mb-2">No updates available</h3>
                <p className="text-gray-500">No updates available in this category right now.</p>
              </div>
            ) : (
              <div className="space-y-2.5 sm:space-y-3" role="list">
                {categoryAlertsList.map((alert) => (
                  <div
                    key={alert.id}
                    role="listitem"
                    className="flex items-start gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors border border-gray-100 min-w-0"
                  >
                    <span className="flex-shrink-0 text-navy mt-0.5" style={{ color: COLORS.navy }}>
                      →
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-navy leading-snug text-sm sm:text-base" style={{ color: COLORS.navy }}>
                        {alert.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        {formatDateShort(alert.publishedAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header is rendered via layout */}

      <main className="pt-4">
        {/* Page Header */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-navy/5 via-white to-green/5" style={{ backgroundColor: COLORS.lightBg }} />
          <div className="relative container-wide py-12 sm:py-16">
            <div className="text-center">
              <h1 className="text-fluid-heading font-bold text-navy mb-4" style={{ color: COLORS.navy }}>
                Smart Alerts & Awareness Centre
              </h1>
              <p className="text-fluid-subheading text-gray-600 mb-6 font-medium max-w-4xl mx-auto">
                Stay informed. Stay prepared. Make a difference.
              </p>
              <p className="text-fluid-body text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Your unified platform for government schemes, cleanliness activities, weather warnings,
                disaster information, and local municipal announcements. Empowering citizens with
                timely, verified information for a safer, cleaner India.
              </p>
            </div>
          </div>
        </section>

        {/* Six Category Cards */}
        <section className="space-fluid-section bg-white">
          <div className="container-wide">
            <div className="text-center mb-10">
              <h2 className="text-fluid-subheading font-bold text-navy mb-3" style={{ color: COLORS.navy }}>
                Alert Categories
              </h2>
              <p className="text-fluid-body text-gray-600 max-w-3xl mx-auto">
                Explore updates across six key categories affecting your community and environment.
              </p>
            </div>

            <div className="grid-fluid-categories">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="group relative card-fluid rounded-2xl border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl min-w-0"
                  style={{
                    background: `linear-gradient(145deg, ${category.bgColor} 0%, ${category.bgColor}80 100%)`,
                    borderColor: `${category.color}30`,
                  }}
                >
                  <div className="relative z-10">
                    <div className="w-13 h-13 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-105 flex-shrink-0"
                      style={{
                        background: `linear-gradient(145deg, ${category.color}15 0%, ${category.color}25 100%)`,
                        border: `1px solid ${category.color}30`,
                      }}>
                      <span style={{ color: category.color }} className="icon-fluid">{category.icon}</span>
                    </div>
                    <h3 className="text-fluid-body font-semibold text-navy mb-2" style={{ color: COLORS.navy }}>
                      {category.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{category.description}</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {category.items.slice(0, 3).map((item, idx) => (
                        <span key={idx} className="text-xs px-2.5 py-1 rounded-full whitespace-nowrap" style={{ backgroundColor: `${category.color}15`, color: category.color, border: `1px solid ${category.color}30` }}>
                          {item}
                        </span>
                      ))}
                      {category.items.length > 3 && (
                        <span className="text-xs px-2.5 py-1 rounded-full text-gray-400 bg-gray-100 whitespace-nowrap">
                          +{category.items.length - 3} more
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <button
                        onClick={() => setSelectedCategory(category)}
                        className="text-sm font-medium transition-colors whitespace-nowrap"
                        style={{ color: category.color }}
                      >
                        View Updates
                        <ArrowRight className="w-4 h-4 inline-block ml-1 transition-transform group-hover:translate-x-1" style={{ color: category.color }} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Latest Updates */}
        <section className="space-fluid-section" style={{ backgroundColor: COLORS.lightBg }}>
          <div className="container-wide">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h2 className="text-fluid-subheading font-bold text-navy" style={{ color: COLORS.navy }}>
                  Latest Updates
                </h2>
                <p className="text-fluid-body text-gray-600 mt-1">
                  {filteredAlerts.length} update{filteredAlerts.length !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>

            {filteredAlerts.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-fluid-body font-medium text-gray-600 mb-2">No updates found</h3>
              </div>
            ) : (
              <div className="space-y-3" role="list">
                {paginatedAlerts.map((alert) => {
                  const styles = severityStyles[alert.severity]
                  return (
                    <article
                      key={alert.id}
                      role="listitem"
                      className={`relative notification-card-responsive p-4 sm:p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg ${styles.bg} ${styles.border}`}
                      style={{ borderLeft: `4px solid ${COLORS[alert.severity] || COLORS.info}` }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${styles.badge}`}>
                              {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                            </span>
                            <span className="text-xs text-gray-500 capitalize whitespace-nowrap">{alert.category}</span>
                          </div>
                          <h3 className="text-fluid-body font-semibold text-navy mb-1.5 line-clamp-2" style={{ color: COLORS.navy }}>
                            {alert.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-3">{alert.description}</p>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500">
                            <span className="flex items-center gap-1 whitespace-nowrap">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              {alert.location}
                            </span>
                            <span className="flex items-center gap-1 whitespace-nowrap">
                              <Calendar className="w-3 h-3 flex-shrink-0" />
                              {formatDate(alert.publishedAt)}
                            </span>
                            <span className="flex items-center gap-1 whitespace-nowrap">
                              <Shield className="w-3 h-3 flex-shrink-0" />
                              {alert.source}
                            </span>
                          </div>
                        </div>
                        <div className="flex-shrink-0 flex flex-col items-end gap-2">
                          <Link
                            href={alert.readMoreUrl || '#'}
                            target={alert.readMoreUrl ? '_blank' : undefined}
                            rel={alert.readMoreUrl ? 'noopener noreferrer' : undefined}
                            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap"
                            style={{ backgroundColor: COLORS.navy + '10', color: COLORS.navy }}
                          >
                            Read More
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}

            {/* Pagination */}
            <nav className="pagination-responsive mt-8" aria-label="Pagination">
              <button
                onClick={() => setCurrentPage(p => p - 1)}
                disabled={currentPage === 1}
                className="pagination-btn border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                Previous
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`pagination-btn rounded-lg font-medium transition-all duration-200 ${
                      page === currentPage
                        ? 'border border-saffron text-saffron font-semibold'
                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                    aria-label={`Page ${page}`}
                    aria-current={page === currentPage ? 'page' : undefined}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage === totalPages}
                className="pagination-btn border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                Next
              </button>
</nav>
          </div>
        </section>

        {/* Official Sources Footer */}
        <section className="space-fluid-section border-t border-gray-100" style={{ backgroundColor: COLORS.lightBg }}>
          <div className="container-wide">
            <h3 className="text-fluid-subheading font-semibold text-navy mb-6 text-center" style={{ color: COLORS.navy }}>
              Official Information Sources
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-center">
              {[
                { name: 'India Meteorological Department', short: 'IMD', icon: CloudRain },
                { name: 'NDMA SACHET', short: 'NDMA', icon: Shield },
                { name: 'Press Information Bureau', short: 'PIB', icon: FileText },
                { name: 'myScheme / Swachh Bharat', short: 'myScheme', icon: Leaf },
              ].map((source) => (
                <div key={source.short} className="card-fluid bg-white rounded-xl border border-gray-100 hover:border-saffron/50 transition-colors text-center">
                  <source.icon className="icon-fluid mx-auto mb-2" style={{ color: COLORS.navy }} />
                  <p className="text-sm font-medium text-gray-700">{source.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{source.short}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Modal />

      </main>
    </div>
  )
}