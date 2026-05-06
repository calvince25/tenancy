"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { X, Upload, Save } from "lucide-react";
import { toast } from "sonner";

export function PropertyForm({ 
  initialData, 
  onClose, 
  onSuccess 
}: { 
  initialData?: any, 
  onClose: () => void, 
  onSuccess: () => void 
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState(initialData?.address || "");
  const [type, setType] = useState(initialData?.type || "APARTMENT");
  const [photoUrl, setPhotoUrl] = useState(initialData?.photoUrl || "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!address) return toast.error("Address is required");
    setIsLoading(true);

    try {
      const res = await fetch("/api/properties", {
        method: initialData ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: initialData?.id,
          address,
          type,
          photoUrl,
        }),
      });

      if (res.ok) {
        toast.success(`Property ${initialData ? "updated" : "created"} successfully`);
        onSuccess();
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to save property");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border-none shadow-2xl animate-in zoom-in-95 duration-200">
      <CardContent className="pt-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-serif font-bold text-primary">
            {initialData ? "Edit Property" : "Add New Property"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Property Address</Label>
            <Input 
              placeholder="e.g. 123 Garden View, Nairobi" 
              value={address} 
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Property Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="APARTMENT">Apartment</SelectItem>
                <SelectItem value="HOUSE">House</SelectItem>
                <SelectItem value="ROOM">Single Room</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Cover Image URL (Optional)</Label>
            <div className="flex gap-2">
              <Input 
                placeholder="https://images.unsplash.com/..." 
                value={photoUrl} 
                onChange={(e) => setPhotoUrl(e.target.value)}
              />
              <Button type="button" variant="outline" size="icon" className="shrink-0">
                <Upload className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {photoUrl && (
            <div className="h-32 rounded-xl overflow-hidden border border-muted bg-muted">
              <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="pt-4 flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 gap-2" disabled={isLoading}>
              <Save className="w-4 h-4" />
              {isLoading ? "Saving..." : initialData ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
