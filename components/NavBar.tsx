
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEmergency } from "@/contexts/EmergencyContext";
import { Ambulance, Bell, PhoneCall, Navigation } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavBarProps {
  currentPage: "citizen" | "responder";
}

const NavBar: React.FC<NavBarProps> = ({ currentPage }) => {
  const { emergencies } = useEmergency();
  const isMobile = useIsMobile();
  
  const pendingEmergencies = emergencies.filter(e => e.status === "pending").length;
  
  return (
    <div className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-2">
          <Ambulance className="h-6 w-6 text-emergency" />
          <Link to="/" className="text-xl font-bold tracking-tighter">
            SmartAid
          </Link>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          {currentPage === "responder" && pendingEmergencies > 0 && (
            <Button variant="destructive" size="sm" className="gap-1">
              <Bell className="h-4 w-4" />
              <span>{pendingEmergencies} Pending</span>
            </Button>
          )}

          {!isMobile && (
            <>
              <Link to="/">
                <Button variant={currentPage === "citizen" ? "default" : "outline"} size="sm">
                  <PhoneCall className="mr-2 h-4 w-4" />
                  Citizen View
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant={currentPage === "responder" ? "default" : "outline"} size="sm">
                  <Navigation className="mr-2 h-4 w-4" />
                  Responder Dashboard
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
      
      {isMobile && (
        <div className="border-t py-2">
          <div className="container flex justify-around">
            <Link to="/" className="flex flex-col items-center text-xs">
              <PhoneCall className={`h-5 w-5 ${currentPage === "citizen" ? "text-primary" : "text-muted-foreground"}`} />
              <span className={currentPage === "citizen" ? "font-medium" : ""}>Citizen</span>
            </Link>
            <Link to="/dashboard" className="flex flex-col items-center text-xs">
              <Navigation className={`h-5 w-5 ${currentPage === "responder" ? "text-primary" : "text-muted-foreground"}`} />
              <span className={currentPage === "responder" ? "font-medium" : ""}>Responder</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavBar;
