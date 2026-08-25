'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Complaint, SmartBin } from '@/lib/types'

const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

interface MapComponentProps {
  hotspotData: Complaint[]
  binData: SmartBin[]
  selectedHotspot: Complaint | null
  setSelectedHotspot: (hotspot: Complaint | null) => void
}

export default function MapComponent({
  hotspotData,
  binData,
  selectedHotspot,
  setSelectedHotspot,
}: MapComponentProps) {
  return (
    <MapContainer
      center={[20.5937, 78.9629]}
      zoom={5}
      className="h-full w-full z-0"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {hotspotData.map((hotspot) => (
        <Marker
          key={hotspot.id}
          position={[hotspot.latitude!, hotspot.longitude!]}
          icon={defaultIcon}
          eventHandlers={{
            click: () => setSelectedHotspot(hotspot),
          }}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold text-navy">{hotspot.location_text}</h3>
              <p className="text-sm text-gray-600">{hotspot.description}</p>
              <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                hotspot.ai_severity === 'high' ? 'bg-red-100 text-red-800' :
                hotspot.ai_severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {hotspot.ai_severity?.toUpperCase()}
              </span>
            </div>
          </Popup>
        </Marker>
      ))}

      {binData.map((bin) => (
        <Marker
          key={bin.id}
          position={[bin.latitude!, bin.longitude!]}
          icon={defaultIcon}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold text-navy">{bin.location_text}</h3>
              <p className="text-sm text-gray-600">Fill Level: {bin.fill_level}%</p>
              <p className="text-sm text-gray-600">Category: {bin.category}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
