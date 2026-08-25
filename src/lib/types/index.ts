export interface Profile {
  id: string
  email: string
  full_name?: string
  phone?: string
  avatar_url?: string
  role: 'citizen' | 'admin' | 'municipality' | 'recycler'
  city?: string
  state?: string
  points: number
  user_id: string
  created_at: string
  updated_at: string
}

export interface WasteCategory {
  id: string
  name: string
  name_hi?: string
  color: string
  icon?: string
  description: string
  description_hi?: string
}

export interface Complaint {
  id: string
  user_id: string
  category_id?: string
  description?: string
  image_url?: string
  latitude?: number
  longitude?: number
  location_text?: string
  address?: string
  pin_code?: string
  city?: string
  state?: string
  ai_category?: string
  ai_verified?: boolean
  ai_severity?: 'high' | 'medium' | 'low'
  ai_recommendation?: string
  status: 'pending' | 'viewed' | 'in_progress' | 'resolved' | 'rejected'
  assigned_to?: string
  tracking_id?: string
  created_at: string
  updated_at: string
}

export interface WasteRecord {
  id: string
  user_id: string
  category_id: string
  weight_kg?: number
  collected_at?: string
  created_at: string
}

export interface RecyclingCenter {
  id: string
  name: string
  name_hi?: string
  address: string
  latitude: number
  longitude: number
  accepts: string[]
  phone?: string
  email?: string
  operating_hours?: string
  created_at: string
}

export interface PickupBooking {
  id: string
  user_id: string
  center_id?: string
  waste_type?: string
  preferred_date?: string
  preferred_time?: string
  status: 'scheduled' | 'completed' | 'cancelled'
  notes?: string
  created_at: string
}

export interface EWasteSchedule {
  id: string
  user_id: string
  item_type?: string
  quantity?: number
  preferred_date?: string
  address?: string
  status: 'scheduled' | 'collected' | 'cancelled'
  created_at: string
}

export interface Reward {
  id: string
  user_id: string
  points: number
  reason?: string
  related_id?: string
  created_at: string
}

export interface ChatMessage {
  id: string
  user_id?: string
  message: string
  response?: string
  is_bot: boolean
  created_at: string
}

export interface CityStats {
  id: string
  city: string
  state: string
  complaints_resolved: number
  waste_collected_kg: number
  citizens_active: number
  recycling_rate: number
  updated_at: string
}

export interface SmartBin {
  id: string
  location_text?: string
  latitude?: number
  longitude?: number
  fill_level: number
  category?: string
  last_emptied?: string
  created_at: string
}

export interface ChatMessageLocal {
  id: string
  text: string
  isBot: boolean
  timestamp: Date
}
