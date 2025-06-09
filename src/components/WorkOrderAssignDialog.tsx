
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  full_name: string;
  email: string;
}

interface WorkOrderAssignDialogProps {
  orderId: string | null;
  currentAssignedTo?: string;
  isOpen: boolean;
  onClose: () => void;
  onAssign: (orderId: string, assignedTo: string) => Promise<any>;
}

const WorkOrderAssignDialog = ({ orderId, currentAssignedTo, isOpen, onClose, onAssign }: WorkOrderAssignDialogProps) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchProfiles();
      setSelectedProfile(currentAssignedTo || "");
    }
  }, [isOpen, currentAssignedTo]);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .order('full_name');

      if (error) {
        console.error('Error fetching profiles:', error);
        toast({
          title: "Erro ao carregar técnicos",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setProfiles(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro ao carregar técnicos",
        description: "Erro inesperado",
        variant: "destructive",
      });
    }
  };

  const handleAssign = async () => {
    if (!orderId || !selectedProfile) {
      toast({
        title: "Erro",
        description: "Selecione um técnico",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const result = await onAssign(orderId, selectedProfile);
    setLoading(false);

    if (result) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atribuir Ordem de Serviço</DialogTitle>
          <DialogDescription>
            Selecione um técnico para executar esta ordem
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="technician">Técnico Responsável</Label>
            <Select value={selectedProfile} onValueChange={setSelectedProfile}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um técnico" />
              </SelectTrigger>
              <SelectContent>
                {profiles.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.full_name} ({profile.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleAssign} disabled={loading}>
            {loading ? "Atribuindo..." : "Atribuir"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkOrderAssignDialog;
