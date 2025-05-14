import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEmergency, EmergencyType } from "@/contexts/EmergencyContext";
import { PhoneCall } from "lucide-react";

const SOSButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [emergencyType, setEmergencyType] = useState<EmergencyType>("medical");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { addEmergency } = useEmergency();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // In a real app, we would get the actual location from the browser
      // For demo purposes, use random coordinates near New Delhi
      const latitude = 28.6139 + (Math.random() * 0.05 - 0.025);
      const longitude = 77.2090 + (Math.random() * 0.05 - 0.025);
      
      const locationText = location || "Current Location (automatically detected)";
      
      const priority = emergencyType === "medical" ? "critical" : "high";
      
      addEmergency({
        type: emergencyType,
        latitude,
        longitude,
        location: locationText,
        description: description || "No description provided",
        priority
      });
      
      setIsOpen(false);
      setDescription("");
      setLocation("");
      
    } catch (error) {
      console.error("Error submitting emergency:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button 
        size="lg" 
        className="h-16 text-lg rounded-full bg-emergency hover:bg-red-600 transition-all shadow-lg"
        onClick={() => setIsOpen(true)}
      >
        <PhoneCall className="mr-2 h-6 w-6" />
        SOS Emergency
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-emergency">
              Report Emergency
            </DialogTitle>
            <DialogDescription className="text-center">
              Help is on the way. Please provide details about your emergency.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <h4 className="font-medium">Emergency Type</h4>
              <RadioGroup
                value={emergencyType}
                onValueChange={(value) => setEmergencyType(value as EmergencyType)}
                className="grid grid-cols-3 gap-2"
              >
                <div className="flex items-center space-x-2 border rounded-md p-2 hover:bg-muted">
                  <RadioGroupItem value="medical" id="medical" />
                  <Label htmlFor="medical" className="cursor-pointer w-full">Medical</Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-2 hover:bg-muted">
                  <RadioGroupItem value="fire" id="fire" />
                  <Label htmlFor="fire" className="cursor-pointer w-full">Fire</Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-2 hover:bg-muted">
                  <RadioGroupItem value="police" id="police" />
                  <Label htmlFor="police" className="cursor-pointer w-full">Police</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location (optional)</Label>
              <Textarea
                id="location"
                placeholder="Enter location or leave blank to use current location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="resize-none"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your emergency..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="sm:w-1/2"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="bg-emergency hover:bg-red-700 sm:w-1/2"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send SOS"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SOSButton;
