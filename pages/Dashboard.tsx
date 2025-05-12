
import React, { useState } from "react";
import { useEmergency } from "@/contexts/EmergencyContext";
import NavBar from "@/components/NavBar";
import MapComponent from "@/components/MapComponent";
import EmergencyList from "@/components/EmergencyList";
import ResponderSelector from "@/components/ResponderSelector";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

const Dashboard: React.FC = () => {
  const { emergencies, responders } = useEmergency();
  const [selectedEmergencyId, setSelectedEmergencyId] = useState<string | undefined>(undefined);
  const isMobile = useIsMobile();
  
  const pendingCount = emergencies.filter(e => e.status === "pending").length;
  const activeCount = emergencies.filter(
    e => e.status === "assigned" || e.status === "in_progress"
  ).length;
  const availableResponders = responders.filter(r => r.status === "available").length;
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar currentPage="responder" />
      
      <main className="flex-1 container py-6 flex flex-col">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Responder Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage and respond to emergencies in real-time
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="text-3xl font-bold text-red-500">
                {pendingCount}
              </div>
              <p className="text-sm text-muted-foreground">Pending Emergencies</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="text-3xl font-bold text-yellow-500">
                {activeCount}
              </div>
              <p className="text-sm text-muted-foreground">Active Responses</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="text-3xl font-bold text-green-500">
                {availableResponders}
              </div>
              <p className="text-sm text-muted-foreground">Available Responders</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="text-3xl font-bold text-blue-500">
                {responders.length}
              </div>
              <p className="text-sm text-muted-foreground">Total Responders</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          <div className="lg:col-span-2 flex flex-col">
            <div className="bg-muted rounded-lg p-4 md:p-6 shadow-sm mb-6 h-[300px] lg:h-[400px]">
              <MapComponent 
                emergencies={emergencies} 
                responders={responders} 
                onEmergencyClick={setSelectedEmergencyId}
                highlightedEmergencyId={selectedEmergencyId}
              />
            </div>
            
            <Card className="flex-1">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>Emergency Queue</CardTitle>
                  {pendingCount > 0 && (
                    <Badge variant="destructive">{pendingCount} Pending</Badge>
                  )}
                </div>
                <CardDescription>
                  Manage and assign responders to emergencies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="pending">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="resolved">Resolved</TabsTrigger>
                  </TabsList>
                  <TabsContent value="pending" className="pt-4">
                    <EmergencyList 
                      filter="pending" 
                      onSelect={setSelectedEmergencyId}
                      selectedId={selectedEmergencyId}
                    />
                  </TabsContent>
                  <TabsContent value="active" className="pt-4">
                    <EmergencyList 
                      filter="active" 
                      onSelect={setSelectedEmergencyId}
                      selectedId={selectedEmergencyId}
                    />
                  </TabsContent>
                  <TabsContent value="resolved" className="pt-4">
                    <EmergencyList 
                      filter="resolved" 
                      onSelect={setSelectedEmergencyId}
                      selectedId={selectedEmergencyId}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <ResponderSelector emergencyId={selectedEmergencyId || ""} />
          </div>
        </div>
      </main>
      
      <footer className="border-t py-4 mt-6">
        <div className="container text-sm text-muted-foreground text-center">
          © 2025 SmartAid Control Center. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
