
import React, { useState } from "react";
import { useEmergency } from "@/contexts/EmergencyContext";
import NavBar from "@/components/NavBar";
import MapComponent from "@/components/MapComponent";
import SOSButton from "@/components/SOSButton";
import EmergencyList from "@/components/EmergencyList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

const Index: React.FC = () => {
  const { emergencies, responders } = useEmergency();
  const [selectedEmergencyId, setSelectedEmergencyId] = useState<string | undefined>(undefined);
  const isMobile = useIsMobile();
  
  const activeEmergencies = emergencies.filter(
    e => e.status === "assigned" || e.status === "in_progress"
  );
  
  // Filter to show emergencies for the citizen view (only active or recent ones)
  const filteredEmergencies = emergencies.filter(e => {
    // Always show active emergencies
    if (e.status === "assigned" || e.status === "in_progress") return true;
    
    // Show pending emergencies from the last hour
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    return e.status === "pending" && e.reportedAt > oneHourAgo;
  });
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar currentPage="citizen" />
      
      <main className="flex-1 container py-6 flex flex-col">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Emergency Assistance
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get immediate help during emergencies. Our team of responders is ready to assist you 24/7.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          <div className="lg:col-span-2 flex flex-col">
            <div className="bg-muted rounded-lg p-4 md:p-6 shadow-sm flex-1">
              <div className="h-[400px] lg:h-full">
                <MapComponent 
                  emergencies={filteredEmergencies} 
                  responders={responders}
                  onEmergencyClick={setSelectedEmergencyId}
                  highlightedEmergencyId={selectedEmergencyId}
                />
              </div>
            </div>
          </div>
          
          <div className="flex flex-col">
            <div className="flex justify-center mb-4">
              <SOSButton />
            </div>
            
            <Card className="flex-1">
              <CardHeader className="pb-2">
                <CardTitle>Emergency Status</CardTitle>
                <CardDescription>
                  {activeEmergencies.length === 0 
                    ? "No active emergencies" 
                    : `${activeEmergencies.length} active emergencies`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="active">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="recent">Recent</TabsTrigger>
                  </TabsList>
                  <TabsContent value="active" className="pt-4">
                    <EmergencyList 
                      filter="active" 
                      onSelect={setSelectedEmergencyId}
                      selectedId={selectedEmergencyId}
                    />
                  </TabsContent>
                  <TabsContent value="recent" className="pt-4">
                    <EmergencyList 
                      filter="pending" 
                      onSelect={setSelectedEmergencyId}
                      selectedId={selectedEmergencyId}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <footer className="border-t py-4 mt-6">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground text-center md:text-left">
            © 2025 SmartAid. Revolutionizing emergency response systems.
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Emergency Hotline:</span> 555-SMART-AID
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
