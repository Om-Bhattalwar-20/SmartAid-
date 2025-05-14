

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEmergency, Emergency } from "@/contexts/EmergencyContext";

interface ResponderSelectorProps {
  emergencyId: string;
}

const ResponderSelector: React.FC<ResponderSelectorProps> = ({ emergencyId }) => {
  const { responders, getEmergency, assignResponder } = useEmergency();
  const [assigningId, setAssigningId] = useState<string | null>(null);
  
  const emergency = getEmergency(emergencyId);
  
  if (!emergency) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          Select an emergency to assign responders
        </CardContent>
      </Card>
    );
  }
  
  // Filter available responders that match the emergency type
  const availableResponders = responders.filter(
    responder => responder.status === "available" && responder.type === emergency.type
  );
  
  const handleAssign = async (responderId: string) => {
    setAssigningId(responderId);
    
    try {
      // Simulate network latency
      await new Promise(resolve => setTimeout(resolve, 500));
      assignResponder(emergencyId, responderId);
    } finally {
      setAssigningId(null);
    }
  };
  
  // If the emergency already has a responder assigned
  if (emergency.responder) {
    const assignedResponder = responders.find(r => r.id === emergency.responder?.id);
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Assigned Responder</CardTitle>
          <CardDescription>
            This emergency has already been assigned to a responder
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-3 border rounded-md">
            <div className="font-medium">{emergency.responder.name}</div>
            <div className="text-sm text-muted-foreground">
              {emergency.responder.vehicle || getEmergencyTypeLabel(emergency.type)}
            </div>
            <div className="mt-2 flex justify-between items-center">
              <div className="text-sm">
                <Badge variant="outline">Busy</Badge>
              </div>
              <div className="text-sm font-medium">
                ETA: {emergency.responder.eta} min
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Assign Responder</CardTitle>
        <CardDescription>
          Available responders for {getEmergencyTypeLabel(emergency.type)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {availableResponders.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            No available responders for this emergency type
          </div>
        ) : (
          <div className="space-y-3">
            {availableResponders.map(responder => (
              <div key={responder.id} className="p-3 border rounded-md">
                <div className="font-medium">{responder.name}</div>
                <div className="text-sm text-muted-foreground">
                  {responder.vehicle || getEmergencyTypeLabel(responder.type)}
                </div>
                <div className="mt-2 flex justify-end">
                  <Button 
                    onClick={() => handleAssign(responder.id)} 
                    disabled={!!assigningId}
                    size="sm"
                  >
                    {assigningId === responder.id ? "Assigning..." : "Assign"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Helper function
const getEmergencyTypeLabel = (type: Emergency["type"]): string => {
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

export default ResponderSelector;
