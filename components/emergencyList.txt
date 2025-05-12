import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEmergency, Emergency } from "@/contexts/EmergencyContext";
import { Ambulance, PhoneCall, Navigation } from "lucide-react";

interface EmergencyListProps {
  filter?: "all" | "pending" | "active" | "resolved";
  onSelect?: (id: string) => void;
  selectedId?: string;
}

const EmergencyList: React.FC<EmergencyListProps> = ({ 
  filter = "all", 
  onSelect,
  selectedId 
}) => {
  const { emergencies } = useEmergency();
  
  // Filter emergencies
  const filteredEmergencies = emergencies.filter(emergency => {
    if (filter === "all") return true;
    if (filter === "pending") return emergency.status === "pending";
    if (filter === "active") return emergency.status === "assigned" || emergency.status === "in_progress";
    if (filter === "resolved") return emergency.status === "resolved";
    return true;
  });
  
  // Sort emergencies by priority and time
  const sortedEmergencies = [...filteredEmergencies].sort((a, b) => {
    // First by status (pending first)
    if (a.status === "pending" && b.status !== "pending") return -1;
    if (a.status !== "pending" && b.status === "pending") return 1;
    
    // Then by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    
    // Finally by time (most recent first)
    return b.reportedAt.getTime() - a.reportedAt.getTime();
  });
  
  // Helper function to format time ago
  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds} sec ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    
    const hours = Math.floor(minutes / 60);
    return `${hours} hr ago`;
  };
  
  const getEmergencyTypeIcon = (type: Emergency["type"]) => {
    switch (type) {
      case "medical":
        return <Ambulance className="h-4 w-4 text-red-500" />;
      case "fire":
        return <Ambulance className="h-4 w-4 text-orange-500" />;
      case "police":
        return <Ambulance className="h-4 w-4 text-blue-600" />;
    }
  };
  
  const getStatusBadge = (status: Emergency["status"], priority: Emergency["priority"]) => {
    switch (status) {
      case "pending":
        return priority === "critical" ? (
          <Badge variant="destructive" className="animate-pulse-urgent">Critical</Badge>
        ) : (
          <Badge variant="destructive">Pending</Badge>
        );
      case "assigned":
        return <Badge variant="default" className="bg-orange-500">Assigned</Badge>;
      case "in_progress":
        return <Badge variant="default" className="bg-yellow-500">En Route</Badge>;
      case "resolved":
        return <Badge variant="outline">Resolved</Badge>;
    }
  };
  
  return (
    <div className="space-y-4">
      {sortedEmergencies.length === 0 ? (
        <Card>
          <CardContent className="pt-6 pb-4 text-center text-muted-foreground">
            No emergencies to display
          </CardContent>
        </Card>
      ) : (
        sortedEmergencies.map((emergency) => (
          <Card 
            key={emergency.id} 
            className={`${selectedId === emergency.id ? 'ring-2 ring-primary' : ''} cursor-pointer transition-all hover:shadow-md`}
            onClick={() => onSelect && onSelect(emergency.id)}
          >
            <CardHeader className="p-4 pb-0">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  {getEmergencyTypeIcon(emergency.type)}
                  <CardTitle className="text-base">
                    {emergency.type.charAt(0).toUpperCase() + emergency.type.slice(1)} Emergency
                  </CardTitle>
                </div>
                {getStatusBadge(emergency.status, emergency.priority)}
              </div>
              <CardDescription className="text-xs">
                {formatTimeAgo(emergency.reportedAt)}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <p className="text-sm font-medium mb-1">{emergency.location}</p>
              <p className="text-sm text-muted-foreground">{emergency.description}</p>
              
              {(emergency.status === "assigned" || emergency.status === "in_progress") && emergency.responder && (
                <div className="mt-3 pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <div className="text-xs flex items-center gap-1">
                      <Navigation className="h-3 w-3" />
                      <span>{emergency.responder.name}</span>
                    </div>
                    <div className="text-xs font-medium">
                      ETA: {emergency.responder.eta} min
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default EmergencyList;
