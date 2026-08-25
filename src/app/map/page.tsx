'use client'

import { useState, Suspense } from 'react'
import { useLanguage } from '@/lib/i18n'
import { Complaint, SmartBin } from '@/lib/types'
import dynamic from 'next/dynamic'

const MapComponent = dynamic(() => import('@/components/map/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-100">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-saffron border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
})

const hotspotData: Complaint[] = [
  { id: '1', user_id: '', description: 'Overflowing garbage near market', latitude: 28.6139, longitude: 77.2090, location_text: 'Connaught Place, Delhi', ai_severity: 'high', status: 'pending', created_at: '', updated_at: '' },
  { id: '2', user_id: '', description: 'Plastic waste on beach', latitude: 18.9432, longitude: 72.8235, location_text: 'Marine Drive, Mumbai', ai_severity: 'medium', status: 'in_progress', created_at: '', updated_at: '' },
  { id: '3', user_id: '', description: 'E-waste dumped in open area', latitude: 12.9352, longitude: 77.6245, location_text: 'Koramangala, Bangalore', ai_severity: 'high', status: 'pending', created_at: '', updated_at: '' },
  { id: '4', user_id: '', description: 'Organic waste accumulation', latitude: 13.0500, longitude: 80.2824, location_text: 'Marina Beach, Chennai', ai_severity: 'low', status: 'resolved', created_at: '', updated_at: '' },
  { id: '5', user_id: '', description: 'Mixed waste at junction', latitude: 22.5448, longitude: 88.3426, location_text: 'Victoria Memorial, Kolkata', ai_severity: 'medium', status: 'pending', created_at: '', updated_at: '' },
  { id: '6', user_id: '', description: 'Legacy waste at dumpsite', latitude: 17.3850, longitude: 78.4867, location_text: 'Hyderabad, Telangana', ai_severity: 'high', status: 'in_progress', created_at: '', updated_at: '' },
  { id: '7', user_id: '', description: 'Segregation failure at source', latitude: 26.9124, longitude: 75.7873, location_text: 'Jaipur, Rajasthan', ai_severity: 'medium', status: 'pending', created_at: '', updated_at: '' },
  { id: '8', user_id: '', description: 'Construction debris on road', latitude: 23.0225, longitude: 72.5714, location_text: 'Ahmedabad, Gujarat', ai_severity: 'high', status: 'pending', created_at: '', updated_at: '' },
  { id: '9', user_id: '', description: 'Wet waste mixed with dry waste', latitude: 19.0760, longitude: 72.8777, location_text: 'Dadar, Mumbai', ai_severity: 'medium', status: 'resolved', created_at: '', updated_at: '' },
  { id: '10', user_id: '', description: 'Public littering near temple', latitude: 10.8505, longitude: 76.2711, location_text: 'Thrissur, Kerala', ai_severity: 'low', status: 'resolved', created_at: '', updated_at: '' },
]

const binData: SmartBin[] = [
  { id: '1', location_text: 'Connaught Place, Delhi', latitude: 28.6315, longitude: 77.2167, fill_level: 75, category: 'mixed', created_at: '' },
  { id: '2', location_text: 'India Gate, Delhi', latitude: 28.6129, longitude: 77.2295, fill_level: 45, category: 'organic', created_at: '' },
  { id: '3', location_text: 'Marine Drive, Mumbai', latitude: 18.9432, longitude: 72.8235, fill_level: 88, category: 'mixed', created_at: '' },
  { id: '4', location_text: 'Cubbon Park, Bangalore', latitude: 12.9743, longitude: 77.5910, fill_level: 32, category: 'organic', created_at: '' },
  { id: '5', location_text: 'Charminar, Hyderabad', latitude: 17.3616, longitude: 78.4747, fill_level: 64, category: 'mixed', created_at: '' },
  { id: '6', location_text: 'City Palace, Jaipur', latitude: 26.9255, longitude: 75.8236, fill_level: 51, category: 'organic', created_at: '' },
  { id: '7', location_text: 'Marina Beach, Chennai', latitude: 13.0500, longitude: 80.2824, fill_level: 92, category: 'mixed', created_at: '' },
  { id: '8', location_text: 'Howrah Bridge, Kolkata', latitude: 22.5851, longitude: 88.3468, fill_level: 58, category: 'recyclable', created_at: '' },
]

export default function MapPage() {
  const { t } = useLanguage()
  const [selectedHotspot, setSelectedHotspot] = useState<Complaint | null>(null)
  const [showAllHotspots, setShowAllHotspots] = useState(false)
  const [showAllBins, setShowAllBins] = useState(false)

  const getSeverityColor = (severity: string) => {
    if (severity === 'high') return 'bg-red-500'
    if (severity === 'medium') return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getSeverityPercentage = (severity: string) => {
    if (severity === 'high') return 90
    if (severity === 'medium') return 60
    return 30
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="bg-navy text-white px-6 py-4">
        <h1 className="text-2xl font-bold">{t('dashboard.wasteHotspots')}</h1>
        <p className="text-sm text-gray-300">Real-time waste hotspot visualization and smart bin monitoring</p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative">
          <Suspense fallback={
            <div className="flex items-center justify-center h-full bg-gray-100">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-saffron border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading map...</p>
              </div>
            </div>
          }>
             <MapComponent
               hotspotData={hotspotData}
               binData={binData}
               selectedHotspot={selectedHotspot}
               setSelectedHotspot={setSelectedHotspot}
             />
          </Suspense>
        </div>

        <div className="hidden lg:block w-96 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
          <h3 className="font-semibold text-navy mb-4">Legend</h3>
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-red-500" />
              <span className="text-sm text-gray-700">High Severity</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-yellow-500" />
              <span className="text-sm text-gray-700">Medium Severity</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-green-500" />
              <span className="text-sm text-gray-700">Low Severity</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-saffron" />
              <span className="text-sm text-gray-700">Fill Level</span>
            </div>
          </div>

           <h3 className="font-semibold text-navy mb-4">Hotspot List</h3>
           <div className="space-y-3 mb-6">
             {(showAllHotspots ? hotspotData : hotspotData.slice(0, 3)).map((hotspot) => {
               const percentage = getSeverityPercentage(hotspot.ai_severity || 'low')
               const barColor = percentage >= 80 ? '#ef4444' : percentage >= 50 ? '#f59e0b' : '#22c55e'
               return (
                 <div key={hotspot.id} className="bg-white p-3 rounded-lg border border-gray-200">
                   <h4 className="text-sm font-medium text-navy">{hotspot.location_text}</h4>
                   <p className="text-xs text-gray-600 mt-1">{hotspot.description}</p>
                   <div className="mt-2">
                     <div className="flex justify-between text-xs text-gray-500 mb-1">
                       <span>Severity</span>
                       <span>{percentage}%</span>
                     </div>
                     <div className="w-full bg-gray-200 rounded-full h-2">
                       <div
                         className="h-2 rounded-full transition-all"
                         style={{
                           width: `${percentage}%`,
                           backgroundColor: barColor,
                         }}
                       />
                     </div>
                   </div>
                 </div>
               )
             })}
           </div>
           {hotspotData.length > 3 && (
             <button
               onClick={() => setShowAllHotspots(!showAllHotspots)}
               className="text-sm text-saffron hover:text-saffron-dark font-medium mb-6"
             >
               {showAllHotspots ? 'Show Less' : 'View More'}
             </button>
           )}

           <h3 className="font-semibold text-navy mb-4">Smart Bin Status</h3>
           <div className="space-y-3">
             {(showAllBins ? binData : binData.slice(0, 3)).map((bin) => (
               <div key={bin.id} className="bg-white p-3 rounded-lg border border-gray-200">
                 <h4 className="text-sm font-medium text-navy">{bin.location_text}</h4>
                 <div className="mt-2">
                   <div className="flex justify-between text-xs text-gray-500 mb-1">
                     <span>Fill Level</span>
                     <span>{bin.fill_level}%</span>
                   </div>
                   <div className="w-full bg-gray-200 rounded-full h-2">
                     <div
                       className="h-2 rounded-full transition-all"
                       style={{
                         width: `${bin.fill_level}%`,
                         backgroundColor: bin.fill_level >= 80 ? '#ef4444' : bin.fill_level >= 50 ? '#f59e0b' : '#22c55e',
                       }}
                     />
                   </div>
                 </div>
                 <p className="text-xs text-gray-500 mt-1">Category: {bin.category}</p>
               </div>
             ))}
           </div>
           {binData.length > 3 && (
             <button
               onClick={() => setShowAllBins(!showAllBins)}
               className="text-sm text-saffron hover:text-saffron-dark font-medium mt-2"
             >
               {showAllBins ? 'Show Less' : 'View More'}
             </button>
           )}
        </div>
      </div>
    </div>
  )
}
