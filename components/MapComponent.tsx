import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { Emergency, EmergencyType, Responder } from '@/contexts/EmergencyContext';

// Using a temporary Mapbox token - in a real app, this would be in environment variables
const MAPBOX_TOKEN = "pk.eyJ1IjoibG92YWJsZWRldiIsImEiOiJjbG5udWpqeHEwZ3phMmtsbGx5YXd6MzQ1In0.qBZpgLrVbvgfDoNlyboCTA";

interface MapComponentProps {
  emergencies: Emergency[];
  responders: Responder[];
  center?: [number, number];
  zoom?: number;
  onEmergencyClick?: (id: string) => void;
  highlightedEmergencyId?: string;
}

const MapComponent: React.FC<MapComponentProps> = ({ 
  emergencies, 
  responders,
  center = [77.2090, 28.6139], // Default center (New Delhi)
  zoom = 10,
  onEmergencyClick,
  highlightedEmergencyId
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});

  useEffect(() => {
    mapboxgl.accessToken = MAPBOX_TOKEN;

    if (mapContainer.current && !map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center,
        zoom,
      });

      map.current.addControl(
        new mapboxgl.NavigationControl({ visualizePitch: true }),
        'top-right'
      );
    }

    return () => {
      // Clean up markers
      Object.values(markersRef.current).forEach(marker => marker.remove());
      
      // Clean up map
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update markers when emergencies or responders change
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // Add emergency markers
    emergencies.forEach(emergency => {
      if (!map.current) return;

      // Create marker element
      const markerEl = document.createElement('div');
      markerEl.className = 'flex items-center justify-center';
      
      // Inner div for styling
      const innerDiv = document.createElement('div');
      innerDiv.className = `w-6 h-6 rounded-full relative ${getEmergencyColorClass(emergency.type)} ${
        emergency.priority === 'critical' ? 'animate-pulse-urgent' : ''
      } ${highlightedEmergencyId === emergency.id ? 'ring-4 ring-blue-500' : ''}`;
      
      if (emergency.status !== 'resolved') {
        // Add pulse effect for active emergencies
        const pulseDiv = document.createElement('div');
        pulseDiv.className = `absolute inset-0 rounded-full ${getEmergencyColorClass(emergency.type)} opacity-40 animate-ping`;
        innerDiv.appendChild(pulseDiv);
      }
      
      markerEl.appendChild(innerDiv);
      
      // Create and add the marker
      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([emergency.longitude, emergency.latitude])
        .addTo(map.current);
        
      // Add click handler if provided
      if (onEmergencyClick) {
        markerEl.addEventListener('click', () => {
          onEmergencyClick(emergency.id);
        });
      }
      
      // Add popup
      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
        .setHTML(`
          <div class="p-2">
            <div class="font-bold">${getEmergencyTypeLabel(emergency.type)}</div>
            <div class="text-sm">${emergency.location}</div>
            <div class="text-xs opacity-75">${formatTimeAgo(emergency.reportedAt)}</div>
            ${
              emergency.status === 'assigned' || emergency.status === 'in_progress' 
                ? `<div class="text-xs mt-1 font-medium">
                    ${emergency.responder?.name} - ETA ${emergency.responder?.eta} mins
                   </div>`
                : ''
            }
          </div>
        `);
        
      marker.setPopup(popup);
      
      markersRef.current[`emergency-${emergency.id}`] = marker;
    });
    
    // Add responder markers
    responders.forEach(responder => {
      if (!map.current) return;
      
      const markerEl = document.createElement('div');
      markerEl.className = 'flex items-center justify-center';
      
      const innerDiv = document.createElement('div');
      innerDiv.className = `w-5 h-5 rounded-full bg-white flex items-center justify-center border-2 ${getResponderBorderClass(responder)}`;
      
      // Add an icon or letter
      const icon = document.createElement('div');
      icon.className = 'text-xs font-bold';
      icon.textContent = getResponderIcon(responder.type);
      innerDiv.appendChild(icon);
      
      markerEl.appendChild(innerDiv);
      
      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([responder.longitude, responder.latitude])
        .addTo(map.current);
        
      // Add popup
      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
        .setHTML(`
          <div class="p-2">
            <div class="font-bold">${responder.name}</div>
            <div class="text-sm">${responder.vehicle || getEmergencyTypeLabel(responder.type)}</div>
            <div class="text-xs font-medium ${
              responder.status === 'available' ? 'text-green-500' : 
              responder.status === 'busy' ? 'text-red-500' : 'text-gray-500'
            }">
              ${responder.status.charAt(0).toUpperCase() + responder.status.slice(1)}
            </div>
          </div>
        `);
        
      marker.setPopup(popup);
      
      markersRef.current[`responder-${responder.id}`] = marker;
    });
    
  }, [emergencies, responders, highlightedEmergencyId]);

  // Helper functions
  const getEmergencyColorClass = (type: EmergencyType): string => {
    switch (type) {
      case 'medical':
        return 'bg-red-500';
      case 'fire': 
        return 'bg-orange-500';
      case 'police':
        return 'bg-blue-600';
      default:
        return 'bg-gray-500';
    }
  };

  const getEmergencyTypeLabel = (type: EmergencyType): string => {
    switch (type) {
      case 'medical':
        return 'Medical Emergency';
      case 'fire': 
        return 'Fire Emergency';
      case 'police':
        return 'Police Emergency';
      default:
        return 'Emergency';
    }
  };

  const getResponderBorderClass = (responder: Responder): string => {
    const statusColor = responder.status === 'available' 
      ? 'border-green-500' 
      : responder.status === 'busy' 
        ? 'border-red-500' 
        : 'border-gray-400';
        
    return statusColor;
  };

  const getResponderIcon = (type: EmergencyType): string => {
    switch (type) {
      case 'medical':
        return 'A';
      case 'fire': 
        return 'F';
      case 'police':
        return 'P';
      default:
        return 'R';
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds} sec ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    
    const hours = Math.floor(minutes / 60);
    return `${hours} hr ago`;
  };

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};

export default MapComponent;
