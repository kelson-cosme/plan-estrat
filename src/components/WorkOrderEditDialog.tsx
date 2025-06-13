// src/components/WorkOrderEditDialog.tsx

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WorkOrder } from "@/hooks/useWorkOrders";
import { toast } from "@/hooks/use-toast";
import { Plus, XCircle } from "lucide-react";

interface WorkOrderEditDialogProps {
  order: WorkOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<WorkOrder>) => Promise<any>;
}

const WorkOrderEditDialog = ({ order, isOpen, onClose, onUpdate }: WorkOrderEditDialogProps) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "open",
    estimated_hours: "",
    actual_hours: "",
    scheduled_date: "",
    completed_date: "",
    used_resources: [] as string[], // NOVO CAMPO
  });
  const [editResourceInput, setEditResourceInput] = useState(""); // NOVO: Estado para input de recurso

  useEffect(() => {
    if (order) {
      // Desserializar recursos de forma segura ao carregar
      let resourcesArray: string[] = [];
      if (order.used_resources) {
        if (Array.isArray(order.used_resources)) {
          resourcesArray = order.used_resources;
        } else if (typeof order.used_resources === 'string') {
          try {
            const parsedResources = JSON.parse(order.used_resources);
            if (Array.isArray(parsedResources)) {
              resourcesArray = parsedResources;
            } else {
              resourcesArray = [order.used_resources];
            }
          } catch (e) {
            resourcesArray = [order.used_resources];
          }
        }
      }

      setFormData({
        title: order.title || "",
        description: order.description || "",
        priority: order.priority || "medium",
        status: order.status || "open",
        estimated_hours: order.estimated_hours?.toString() || "",
        actual_hours: order.actual_hours?.toString() || "",
        scheduled_date: order.scheduled_date || "",
        completed_date: order.completed_date || "",
        used_resources: resourcesArray, // NOVO: Carregar recursos
      });
    }
  }, [order]);

  // NOVO: Funções para gerenciar recursos
  const handleAddEditResource = () => {
    if (editResourceInput.trim() !== "") {
      setFormData(prev => ({
        ...prev,
        used_resources: [...prev.used_resources, editResourceInput.trim()]
      }));
      setEditResourceInput("");
    }
  };

  const handleRemoveEditResource = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      used_resources: prev.used_resources.filter((_, index) => index !== indexToRemove)
    }));
  };


  const handleSave = async () => {
    if (!order) return;

    const updateData: Partial<WorkOrder> = {
      title: formData.title,
      description: formData.description || undefined,
      priority: formData.priority as WorkOrder['priority'],
      status: formData.status as WorkOrder['status'],
      estimated_hours: formData.estimated_hours ? parseInt(formData.estimated_hours) : undefined,
      actual_hours: formData.actual_hours ? parseInt(formData.actual_hours) : undefined,
      scheduled_date: formData.scheduled_date || undefined,
      completed_date: formData.completed_date || undefined,
      used_resources: formData.used_resources.length > 0 ? formData.used_resources : null, // NOVO: Salva recursos
    };

    const result = await onUpdate(order.id, updateData);
    if (result) {
      onClose();
    }
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Ordem de Serviço</DialogTitle>
          <DialogDescription>
            Atualize as informações da ordem de serviço
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="col-span-2 space-y-2">
            <Label htmlFor="edit-title">Título</Label>
            <Input
              id="edit-title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-priority">Prioridade</Label>
            <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">Crítica</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Aberto</SelectItem>
                <SelectItem value="in_progress">Em Andamento</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-estimated-hours">Horas Estimadas</Label>
            <Input
              id="edit-estimated-hours"
              type="number"
              value={formData.estimated_hours}
              onChange={(e) => setFormData({...formData, estimated_hours: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-actual-hours">Horas Reais</Label>
            <Input
              id="edit-actual-hours"
              type="number"
              value={formData.actual_hours}
              onChange={(e) => setFormData({...formData, actual_hours: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-scheduled-date">Data Agendada</Label>
            <Input
              id="edit-scheduled-date"
              type="date"
              value={formData.scheduled_date}
              onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-completed-date">Data de Conclusão</Label>
            <Input
              id="edit-completed-date"
              type="date"
              value={formData.completed_date}
              onChange={(e) => setFormData({...formData, completed_date: e.target.value})}
            />
          </div>

          <div className="col-span-2 space-y-2">
            <Label htmlFor="edit-description">Descrição</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
            />
          </div>
          {/* NOVO: Seção para Recursos Utilizados na edição */}
          <div className="col-span-2 space-y-2">
            <Label htmlFor="edit-used-resources">Recursos Utilizados</Label>
            <div className="flex space-x-2">
              <Input
                id="edit-new-resource-input"
                placeholder="Adicionar recurso utilizado (Ex: Parafuso M8)"
                value={editResourceInput}
                onChange={(e) => setEditResourceInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddEditResource();
                  }
                }}
              />
              <Button type="button" onClick={handleAddEditResource}>Adicionar</Button>
            </div>
            <div className="space-y-1">
              {formData.used_resources.map((resource, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
                  <span className="text-sm">{resource}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveEditResource(index)}
                  >
                    <XCircle className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
            {formData.used_resources.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum recurso adicionado.</p>
            )}
          </div>
          {/* FIM NOVO: Seção para Recursos Utilizados na edição */}
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkOrderEditDialog;