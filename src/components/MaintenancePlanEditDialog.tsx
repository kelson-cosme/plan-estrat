// src/components/MaintenancePlanEditDialog.tsx
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MaintenancePlan } from "@/hooks/useMaintenancePlansData";
import { useEquipment } from "@/hooks/useEquipment";
import { toast } from "@/hooks/use-toast";
import { Plus, XCircle } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"; // Importar ToggleGroup

interface MaintenancePlanEditDialogProps {
  plan: MaintenancePlan | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<MaintenancePlan>) => Promise<any>;
}

const MaintenancePlanEditDialog = ({ plan, isOpen, onClose, onUpdate }: MaintenancePlanEditDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    equipment_id: null as string | null,
    frequency: "",
    tasks: [] as string[],
    priority: "medium",
    description: "",
    active: true,
    estimated_duration_hours: "",
    end_date: "" as string | null, // NOVO CAMPO
    schedule_days_of_week: [] as string[], // NOVO CAMPO
  });
  const [newTaskInput, setNewTaskInput] = useState("");

  const { equipment, loading: loadingEquipment } = useEquipment();

  const daysOfWeekOptions = [
    { value: 'sunday', label: 'Dom' },
    { value: 'monday', label: 'Seg' },
    { value: 'tuesday', label: 'Ter' },
    { value: 'wednesday', label: 'Qua' },
    { value: 'thursday', label: 'Qui' },
    { value: 'friday', label: 'Sex' },
    { value: 'saturday', label: 'Sáb' },
  ];

  useEffect(() => {
    if (plan) {
      let tasksArray: string[] = [];
      if (plan.tasks) {
        if (Array.isArray(plan.tasks)) {
          tasksArray = plan.tasks;
        } else if (typeof plan.tasks === 'string') {
          try {
            const parsedTasks = JSON.parse(plan.tasks);
            if (Array.isArray(parsedTasks)) {
              tasksArray = parsedTasks;
            } else {
              tasksArray = [plan.tasks];
            }
          } catch (e) {
            tasksArray = [plan.tasks];
          }
        }
      }

      setFormData({
        name: plan.name || "",
        type: plan.type || "",
        equipment_id: plan.equipment_id || null,
        frequency: plan.frequency || "",
        tasks: tasksArray,
        priority: plan.priority || "medium",
        description: plan.description || "",
        active: plan.active,
        estimated_duration_hours: plan.estimated_duration_hours?.toString() || "",
        end_date: plan.end_date || null, // Carrega o valor existente
        schedule_days_of_week: Array.isArray(plan.schedule_days_of_week) ? plan.schedule_days_of_week : [], // Carrega o valor existente
      });
    }
  }, [plan]);

  const handleAddTask = () => {
    if (newTaskInput.trim() !== "") {
      setFormData(prev => ({
        ...prev,
        tasks: [...prev.tasks, newTaskInput.trim()]
      }));
      setNewTaskInput("");
    }
  };

  const handleRemoveTask = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSave = async () => {
    if (!plan) return;

    const updateData: Partial<MaintenancePlan> = {
      name: formData.name,
      type: formData.type,
      equipment_id: formData.equipment_id,
      frequency: formData.frequency || undefined,
      tasks: formData.tasks.length > 0 ? formData.tasks : null,
      priority: formData.priority as MaintenancePlan['priority'],
      description: formData.description || undefined,
      active: formData.active,
      estimated_duration_hours: formData.estimated_duration_hours ? parseInt(formData.estimated_duration_hours) : undefined,
      end_date: formData.end_date || null, // Salva o novo campo
      schedule_days_of_week: formData.schedule_days_of_week.length > 0 ? formData.schedule_days_of_week : null, // Salva o novo campo
    };

    const result = await onUpdate(plan.id, updateData);
    if (result) {
      onClose();
    }
  };

  if (!plan) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Plano de Manutenção</DialogTitle>
          <DialogDescription>
            Atualize as informações do plano de manutenção
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-plan-name">Nome do Plano</Label>
            <Input 
              id="edit-plan-name" 
              placeholder="Ex: Lubrificação Mensal" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-plan-type">Tipo de Manutenção</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="preventiva">Preventiva</SelectItem>
                <SelectItem value="preditiva">Preditiva</SelectItem>
                <SelectItem value="corretiva">Corretiva</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-equipment">Equipamento</Label>
            <Select value={formData.equipment_id || ''} onValueChange={(value) => setFormData({...formData, equipment_id: value === 'null' ? null : value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o equipamento" />
              </SelectTrigger>
              <SelectContent>
                {loadingEquipment ? (
                  <SelectItem value="" disabled>Carregando...</SelectItem>
                ) : (
                  <>
                    <SelectItem value="null">Nenhum</SelectItem>
                    {equipment.map((eq) => (
                      <SelectItem key={eq.id} value={eq.id}>
                        {eq.name} ({eq.code})
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-frequency">Frequência</Label>
            <Select value={formData.frequency} onValueChange={(value) => setFormData({...formData, frequency: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a frequência" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="diaria">Diária</SelectItem>
                <SelectItem value="semanal">Semanal</SelectItem>
                <SelectItem value="quinzenal">Quinzenal</SelectItem>
                <SelectItem value="mensal">Mensal</SelectItem>
                <SelectItem value="anual">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* NOVO CAMPO: Data de Término */}
          <div className="space-y-2">
            <Label htmlFor="edit-end-date">Data de Término (Opcional)</Label>
            <Input
              id="edit-end-date"
              type="date"
              value={formData.end_date || ''}
              onChange={(e) => setFormData({...formData, end_date: e.target.value})}
            />
          </div>
          {/* NOVO CAMPO: Dias da Semana */}
          <div className="col-span-2 space-y-2">
            <Label htmlFor="edit-schedule-days-of-week">Dias da Semana (Para agendamentos diários)</Label>
            <ToggleGroup
              type="multiple"
              value={formData.schedule_days_of_week}
              onValueChange={(value: string[]) => setFormData({...formData, schedule_days_of_week: value})}
              className="flex flex-wrap gap-2"
            >
              {daysOfWeekOptions.map(day => (
                <ToggleGroupItem key={day.value} value={day.value} aria-label={day.label}>
                  {day.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <p className="text-sm text-muted-foreground">Selecione os dias em que a manutenção deve ocorrer.</p>
          </div>

          <div className="col-span-2 space-y-2">
            <Label htmlFor="edit-tasks">Tarefas do Plano</Label>
            <div className="flex space-x-2">
              <Input
                id="edit-new-task-input"
                placeholder="Adicionar nova tarefa"
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTask();
                  }
                }}
              />
              <Button type="button" onClick={handleAddTask}>Adicionar</Button>
            </div>
            <div className="space-y-1">
              {formData.tasks.map((task, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
                  <span className="text-sm">{task}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveTask(index)}
                  >
                    <XCircle className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
            {formData.tasks.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma tarefa adicionada.</p>
            )}
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="edit-description">Descrição do Plano</Label>
            <Textarea 
              id="edit-description" 
              placeholder="Descreva o plano de manutenção..." 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
          <div className="col-span-2 flex items-center space-x-2">
            <Input
              id="edit-active"
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData({...formData, active: e.target.checked})}
              className="w-4 h-4"
            />
            <Label htmlFor="edit-active">Plano Ativo</Label>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar Alterações</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MaintenancePlanEditDialog;