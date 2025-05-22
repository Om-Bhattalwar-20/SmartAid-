import React, { createContext, useState, useContext, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { toast } from "sonner";

export type EmergencyType = "medical" | "fire" | "police";

export interface Emergency {
  id: string;
  type: EmergencyType;
  latitude: number;
  longitude: number;
  
  location: string;
  description: string;
  status: "pending" | "assigned" | "in_progress" | "resolved";
  priority: "low" | "medium" | "high" | "critical";
  reportedAt: Date;
  responder?: {
    id: string;
    name: string;
    vehicle?: string;
    eta?: number;
  };
}

export interface Responder {
  id: string;
  name: string;
  type: EmergencyType;
  latitude: number;
  longitude: number;
  status: "available" | "busy" | "offline";
  vehicle?: string;
}

interface EmergencyContextType {
  emergencies: Emergency[];
  responders: Responder[];
  addEmergency: (emergency: Omit<Emergency, "id" | "status" | "reportedAt">) => void;
  updateEmergencyStatus: (id: string, status: Emergency["status"]) => void;
  assignResponder: (emergencyId: string, responderId: string) => void;
  getEmergency: (id: string) => Emergency | undefined;
  getResponder: (id: string) => Responder | undefined;
}

const EmergencyContext = createContext<EmergencyContextType | undefined>(undefined);

export const useEmergency = () => {
  const context = useContext(EmergencyContext);
  if (!context) {
    throw new Error("useEmergency must be used within an EmergencyProvider");
  }
  return context;
};

export const EmergencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [emergencies, setEmergencies] = useState<Emergency[]>([
    {
      id: "e1",
      type: "medical",
      latitude: 28.6139,
      longitude: 77.2090,
      location: "AIIMS Hospital, Ansari Nagar East, New Delhi",
      description: "Heart attack reported, 65-year-old male",
      status: "in_progress",
      priority: "critical",
      reportedAt: new Date(Date.now() - 1000 * 60 * 15),
      responder: {
        id: "r1",
        name: "Ambulance Unit 7",
        vehicle: "Type II Ambulance",
        eta: 3
      }
    },
    {
      id: "e2",
      type: "fire",
      latitude: 19.0760,
      longitude: 72.8777,
      location: "Dharavi Slum Area, Mumbai",
      description: "Kitchen fire reported in residential building",
      status: "assigned",
      priority: "high",
      reportedAt: new Date(Date.now() - 1000 * 60 * 5),
      responder: {
        id: "r3",
        name: "Fire Unit 2",
        vehicle: "Fire Truck",
        eta: 8
      }
    },
    {
      id: "e3",
      type: "police",
      latitude: 12.9716,
      longitude: 77.5946,
      location: "MG Road, Bengaluru",
      description: "Break-in reported, suspect still on premises",
      status: "pending",
      priority: "medium",
      reportedAt: new Date(Date.now() - 1000 * 60 * 2)
    }
  ]);

  const [responders, setResponders] = useState<Responder[]>([
    {
      id: "r1",
      name: "Ambulance Unit 7",
      type: "medical",
      latitude: 28.6100,
      longitude: 77.2300,
      status: "busy",
      vehicle: "Type II Ambulance"
    },
    {
      id: "r2",
      name: "Ambulance Unit 3",
      type: "medical",
      latitude: 28.6300,
      longitude: 77.2200,
      status: "available",
      vehicle: "Type I Ambulance"
    },
    {
      id: "r3",
      name: "Fire Unit 2",
      type: "fire",
      latitude: 19.0900,
      longitude: 72.8900,
      status: "busy",
      vehicle: "Fire Truck"
    },
    {
      id: "r4",
      name: "Fire Unit 5",
      type: "fire",
      latitude: 19.0800,
      longitude: 72.8600,
      status: "available",
      vehicle: "Fire Engine"
    },
    {
      id: "r5",
      name: "Police Unit 12",
      type: "police",
      latitude: 12.9800,
      longitude: 77.5800,
      status: "available",
      vehicle: "Police Cruiser"
    }
  ]);

  const { toast: uiToast } = useToast();

  const addEmergency = (emergency: Omit<Emergency, "id" | "status" | "reportedAt">) => {
    const newEmergency: Emergency = {
      ...emergency,
      id: `e${emergencies.length + 1}-${Date.now().toString().slice(-4)}`,
      status: "pending",
      reportedAt: new Date()
    };
    
    setEmergencies((prev) => [...prev, newEmergency]);
    
    toast.success("Emergency reported", {
      description: "Help is on the way!",
      duration: 5000
    });
    
    uiToast({
      title: "Emergency Reported",
      description: "Your emergency has been successfully reported. Help is on the way.",
      variant: "default",
    });
    
    return newEmergency;
  };

  const updateEmergencyStatus = (id: string, status: Emergency["status"]) => {
    setEmergencies((prev) =>
      prev.map((emergency) =>
        emergency.id === id ? { ...emergency, status } : emergency
      )
    );
  };

  const assignResponder = (emergencyId: string, responderId: string) => {
    const responder = responders.find((r) => r.id === responderId);
    
    if (!responder) return;
    
    // Update responder status
    setResponders((prev) =>
      prev.map((r) =>
        r.id === responderId ? { ...r, status: "busy" } : r
      )
    );
    
    // Update emergency with responder info
    setEmergencies((prev) =>
      prev.map((emergency) =>
        emergency.id === emergencyId
          ? {
              ...emergency,
              status: "assigned",
              responder: {
                id: responder.id,
                name: responder.name,
                vehicle: responder.vehicle,
                eta: Math.floor(Math.random() * 10) + 3 // Random ETA between 3-12 minutes
              }
            }
          : emergency
      )
    );
    
    toast.success("Responder assigned", {
      description: `${responder.name} has been assigned to the emergency`,
    });
  };

  const getEmergency = (id: string) => {
    return emergencies.find((e) => e.id === id);
  };

  const getResponder = (id: string) => {
    return responders.find((r) => r.id === id);
  };

  return (
    <EmergencyContext.Provider
      value={{
        emergencies,
        responders,
        addEmergency,
        updateEmergencyStatus,
        assignResponder,
        getEmergency,
        getResponder,
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
};
