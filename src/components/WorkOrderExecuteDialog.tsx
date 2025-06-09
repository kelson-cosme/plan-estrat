
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface WorkOrderExecuteDialogProps {
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onExecute: (orderId: string, data: { actual_hours?: number; completed_date: string; status: string }) => Promise<any>;
}

const WorkOrderExecuteDialog = ({ orderId, isOpen, onClose, onExecute }: WorkOrderExecuteDialogProps) => {
  const [actualHours, setActualHours] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleExecute = async () => {
    if (!orderId) return;

    setLoading(true);
    const executeData = {
      actual_hours: actualHours ? parseInt(actualHours) : undefined,
      completed_date: new Date().toISOString().split('T')[0],
      status: 'completed' as const
    };

    const result = await onExecute(orderId, executeData);
    setLoading(false);

    if (result) {
      toast({
        title: "Ordem executada",
        description: "Ordem de serviço marcada como concluída",
      });
      onClose();
      setActualHours("");
      setNotes("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Executar Ordem de Serviço</DialogTitle>
          <DialogDescription>
            Marque esta ordem como concluída e registre as informações de execução
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="actual-hours">Horas Trabalhadas</Label>
            <Input
              id="actual-hours"
              type="number"
              placeholder="Ex: 4"
              value={actualHours}
              onChange={(e) => setActualHours(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="execution-notes">Observações da Execução</Label>
            <Textarea
              id="execution-notes"
              placeholder="Descreva o que foi realizado, problemas encontrados, etc..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleExecute} disabled={loading}>
            {loading ? "Executando..." : "Concluir Ordem"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkOrderExecuteDialog;
