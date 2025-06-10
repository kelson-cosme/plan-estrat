// src/components/MaintenancePlans.tsx
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Calendar, Clock, Wrench, AlertTriangle, CheckCircle, Edit, Trash2, Play, Pause, Settings, XCircle } from "lucide-react";
import { useMaintenancePlansData, MaintenancePlan as MaintenancePlanType } from "@/hooks/useMaintenancePlansData";
import { useWorkOrders } from "@/hooks/useWorkOrders";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import MaintenanceScheduler from "./MaintenanceScheduler";
import MaintenancePlanEditDialog from "./MaintenancePlanEditDialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"; // Importar ToggleGroup

const MaintenancePlans = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [showScheduler, setShowScheduler] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [selectedPlanForSchedule, setSelectedPlanForSchedule] = useState<MaintenancePlanType | null>(null);
  const [selectedPlanForEdit, setSelectedPlanForEdit] = useState<MaintenancePlanType | null>(null);
  const [scheduledDate, setScheduledDate] = useState("");
  const [newPlan, setNewPlan] = useState({
    name: "",
    type: "",
    equipment_id: "",
    frequency: "",
    tasks: [] as string[],
    priority: "medium",
    description: "",
    end_date: "" as string | null, // NOVO CAMPO
    schedule_days_of_week: [] as string[], // NOVO CAMPO
  });
  const [newTaskInput, setNewTaskInput] = useState("");

  const { plans, loading, createPlan, updatePlan, deletePlan } = useMaintenancePlansData();
  const { createWorkOrder } = useWorkOrders();

  const daysOfWeekOptions = [
    { value: 'sunday', label: 'Dom' },
    { value: 'monday', label: 'Seg' },
    { value: 'tuesday', label: 'Ter' },
    { value: 'wednesday', label: 'Qua' },
    { value: 'thursday', label: 'Qui' },
    { value: 'friday', label: 'Sex' },
    { value: 'saturday', label: 'Sáb' },
  ];

  // Fetch equipment data for the select dropdown
  const { data: equipment = [] } = useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment')
        .select('id, name, code')
        .order('name');
      if (error) throw error;
      return data || [];
    }
  });

  const handleAddTask = () => {
    if (newTaskInput.trim() !== "") {
      setNewPlan(prev => ({
        ...prev,
        tasks: [...prev.tasks, newTaskInput.trim()]
      }));
      setNewTaskInput("");
    }
  };

  const handleRemoveTask = (indexToRemove: number) => {
    setNewPlan(prev => ({
      ...prev,
      tasks: prev.tasks.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleCreatePlan = async () => {
    if (!newPlan.name || !newPlan.type) {
      toast({
        title: "Erro",
        description: "Nome e tipo são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    // Validação básica para agendamento diário sem fins de semana com período
    if (newPlan.frequency === 'diaria' && newPlan.end_date && newPlan.schedule_days_of_week.length === 0) {
      toast({
        title: "Atenção",
        description: "Para frequência diária com período, selecione os dias da semana.",
        variant: "destructive",
      });
      return;
    }


    const planData = {
      name: newPlan.name,
      type: newPlan.type,
      equipment_id: newPlan.equipment_id || undefined,
      frequency: newPlan.frequency || undefined,
      tasks: newPlan.tasks.length > 0 ? newPlan.tasks : null,
      priority: newPlan.priority as 'low' | 'medium' | 'high' | 'critical',
      description: newPlan.description || undefined,
      end_date: newPlan.end_date || null, // NOVO CAMPO
      schedule_days_of_week: newPlan.schedule_days_of_week.length > 0 ? newPlan.schedule_days_of_week : null, // NOVO CAMPO
      active: true
    };

    const result = await createPlan(planData);
    if (result) {
      setIsCreateDialogOpen(false);
      setNewPlan({
        name: "",
        type: "",
        equipment_id: "",
        frequency: "",
        tasks: [],
        priority: "medium",
        description: "",
        end_date: null,
        schedule_days_of_week: [],
      });
      setNewTaskInput("");
    }
  };

  const handleToggleActive = async (plan: MaintenancePlanType) => {
    await updatePlan(plan.id, { active: !plan.active });
  };

  const handleDeletePlan = async (planId: string) => {
    if (confirm("Tem certeza que deseja deletar este plano?")) {
      await deletePlan(planId);
    }
  };

  const handleEditPlan = (plan: MaintenancePlanType) => {
    setSelectedPlanForEdit(plan);
  };

  const handleCloseEditDialog = () => {
    setSelectedPlanForEdit(null);
  };

  const handleSchedulePlan = (plan: MaintenancePlanType) => {
    setSelectedPlanForSchedule(plan);
    setIsScheduleDialogOpen(true);
  };

  const handleExecutePlan = async (plan: MaintenancePlanType) => {
    const workOrderData = {
      title: `Execução: ${plan.name}`,
      type: plan.type as 'preventiva' | 'preditiva' | 'corretiva',
      description: plan.description || (plan.tasks ? plan.tasks.join('\n') : null) || `Execução do plano de manutenção: ${plan.name}`,
      priority: plan.priority,
      status: 'in_progress' as const,
      equipment_id: plan.equipment_id,
      maintenance_plan_id: plan.id,
      scheduled_date: new Date().toISOString().split('T')[0],
      estimated_hours: plan.estimated_duration_hours
    };

    const result = await createWorkOrder(workOrderData);
    if (result) {
      toast({
        title: "Ordem de serviço criada",
        description: `Ordem de execução criada para o plano "${plan.name}"`,
      });
    }
  };

  const handleCreateScheduledOrder = async () => {
    if (!selectedPlanForSchedule || !scheduledDate) {
      toast({
        title: "Erro",
        description: "Data de agendamento é obrigatória",
        variant: "destructive",
      });
      return;
    }

    const workOrderData = {
      title: `Agendamento: ${selectedPlanForSchedule.name}`,
      type: selectedPlanForSchedule.type as 'preventiva' | 'preditiva' | 'corretiva',
      description: selectedPlanForSchedule.description || (selectedPlanForSchedule.tasks ? selectedPlanForSchedule.tasks.join('\n') : null) || `Agendamento do plano de manutenção: ${selectedPlanForSchedule.name}`,
      priority: selectedPlanForSchedule.priority,
      status: 'open' as const,
      equipment_id: selectedPlanForSchedule.equipment_id,
      maintenance_plan_id: selectedPlanForSchedule.id,
      scheduled_date: scheduledDate,
      estimated_hours: selectedPlanForSchedule.estimated_duration_hours
    };

    const result = await createWorkOrder(workOrderData);
    if (result) {
      toast({
        title: "Ordem de serviço agendada",
        description: `Ordem agendada para ${new Date(scheduledDate).toLocaleDateString('pt-BR')}`,
      });
      setIsScheduleDialogOpen(false);
      setSelectedPlanForSchedule(null);
      setScheduledDate("");
    }
  };

  const getStatusColor = (active: boolean) => {
    return active 
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-100 text-red-800 border-red-200";
      case "high": return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "preventiva": return "bg-green-100 text-green-800 border-green-200";
      case "preditiva": return "bg-blue-100 text-blue-800 border-blue-200";
      case "corretiva": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case "diaria": return "Diária";
      case "semanal": return "Semanal";
      case "quinzenal": return "Quinzenal";
      case "mensal": return "Mensal";
      case "anual": return "Anual";
      default: return frequency;
    }
  };

  const filteredPlans = plans.filter(plan => {
    if (activeTab === "all") return true;
    if (activeTab === "preventive") return plan.type === "preventiva";
    if (activeTab === "predictive") return plan.type === "preditiva";
    if (activeTab === "corrective") return plan.type === "corretiva";
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2 mx-auto"></div>
          <p>Carregando planos...</p>
        </div>
      </div>
    );
  }

  if (showScheduler) {
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          onClick={() => setShowScheduler(false)}
          className="mb-4"
        >
          ← Voltar aos Planos
        </Button>
        <MaintenanceScheduler />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Planos de Manutenção</CardTitle>
              <CardDescription>Gestão estratégica de ciclos de manutenção</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline"
                onClick={() => setShowScheduler(true)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Agendamentos Automáticos
              </Button>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Plano
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Criar Novo Plano de Manutenção</DialogTitle>
                    <DialogDescription>
                      Configure um novo plano estratégico de manutenção
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="plan-name">Nome do Plano</Label>
                      <Input 
                        id="plan-name" 
                        placeholder="Ex: Lubrificação Mensal" 
                        value={newPlan.name}
                        onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="plan-type">Tipo de Manutenção</Label>
                      <Select value={newPlan.type} onValueChange={(value) => setNewPlan({...newPlan, type: value})}>
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
                      <Label htmlFor="equipment">Equipamento</Label>
                      <Select value={newPlan.equipment_id} onValueChange={(value) => setNewPlan({...newPlan, equipment_id: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o equipamento" />
                        </SelectTrigger>
                        <SelectContent>
                          {equipment.map((eq) => (
                            <SelectItem key={eq.id} value={eq.id}>
                              {eq.name} ({eq.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="frequency">Frequência</Label>
                      <Select value={newPlan.frequency} onValueChange={(value) => setNewPlan({...newPlan, frequency: value})}>
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
                      <Label htmlFor="end-date">Data de Término (Opcional)</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={newPlan.end_date || ''}
                        onChange={(e) => setNewPlan({...newPlan, end_date: e.target.value})}
                      />
                    </div>
                    {/* NOVO CAMPO: Dias da Semana */}
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="schedule-days-of-week">Dias da Semana (Para agendamentos diários)</Label>
                      <ToggleGroup
                        type="multiple"
                        value={newPlan.schedule_days_of_week}
                        onValueChange={(value: string[]) => setNewPlan({...newPlan, schedule_days_of_week: value})}
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
                      <Label htmlFor="tasks">Tarefas do Plano</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="new-task-input"
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
                        {newPlan.tasks.map((task, index) => (
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
                      {newPlan.tasks.length === 0 && (
                        <p className="text-sm text-muted-foreground">Nenhuma tarefa adicionada.</p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreatePlan}>Criar Plano</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{plans.length}</p>
              <p className="text-sm text-gray-600">Total de Planos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {plans.filter(p => p.active).length}
              </p>
              <p className="text-sm text-gray-600">Planos Ativos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {plans.filter(p => p.type === "preventiva").length}
              </p>
              <p className="text-sm text-gray-600">Preventivos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {plans.filter(p => p.type === "corretiva").length}
              </p>
              <p className="text-sm text-gray-600">Corretivos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plans Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>Todos</span>
          </TabsTrigger>
          <TabsTrigger value="preventive" className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>Preventiva</span>
          </TabsTrigger>
          <TabsTrigger value="predictive" className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Preditiva</span>
          </TabsTrigger>
          <TabsTrigger value="corrective" className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Corretiva</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredPlans.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum plano encontrado</h3>
                <p className="text-gray-600">Crie um novo plano de manutenção para começar.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredPlans.map((plan) => (
                <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                        <CardDescription>
                          {plan.equipment?.name || "Sem equipamento"} • {plan.type}
                        </CardDescription>
                      </div>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleToggleActive(plan)}
                        >
                          {plan.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditPlan(plan)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeletePlan(plan.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Status:</span>
                      <Badge className={getStatusColor(plan.active)}>
                        {plan.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Prioridade:</span>
                      <Badge className={getPriorityColor(plan.priority)}>
                        {plan.priority === 'critical' ? 'Crítica' : 
                         plan.priority === 'high' ? 'Alta' : 
                         plan.priority === 'medium' ? 'Média' : 'Baixa'}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Tipo:</span>
                      <Badge className={getTypeColor(plan.type)}>
                        {plan.type === 'preventiva' ? 'Preventiva' : 
                         plan.type === 'preditiva' ? 'Preditiva' : 'Corretiva'}
                      </Badge>
                    </div>

                    {plan.frequency && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Frequência:</span>
                        <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                          {getFrequencyLabel(plan.frequency)}
                        </Badge>
                      </div>
                    )}

                    {/* Exibir novos campos */}
                    {plan.end_date && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Data de Término:</span>
                        <span className="text-sm font-medium">
                          {new Date(plan.end_date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    )}
                    {plan.schedule_days_of_week && plan.schedule_days_of_week.length > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Dias Agendados:</span>
                        <span className="text-sm font-medium">
                          {plan.schedule_days_of_week.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', ')}
                        </span>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Criado em:</span>
                        <div className="font-medium">
                          {new Date(plan.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Atualizado:</span>
                        <div className="font-medium">
                          {new Date(plan.updated_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>

                    {plan.tasks && plan.tasks.length > 0 && (
                      <div className="pt-3 border-t">
                        <p className="text-sm text-gray-600 mb-1">Tarefas:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {plan.tasks.map((task, index) => (
                            <li key={index}>{task}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {plan.description && (
                      <div className="pt-3 border-t">
                        <p className="text-sm text-gray-600 mb-1">Descrição:</p>
                        <p className="text-sm">{plan.description}</p>
                      </div>
                    )}

                    <div className="flex space-x-2 pt-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleSchedulePlan(plan)}
                      >
                        <Calendar className="w-4 h-4 mr-1" />
                        Agendar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleExecutePlan(plan)}
                      >
                        <Wrench className="w-4 h-4 mr-1" />
                        Executar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Schedule Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agendar Plano de Manutenção</DialogTitle>
            <DialogDescription>
              Selecione a data para agendar a execução do plano "{selectedPlanForSchedule?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="scheduled-date">Data de Agendamento</Label>
              <Input 
                id="scheduled-date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateScheduledOrder}>
              Confirmar Agendamento
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MaintenancePlanEditDialog */}
      <MaintenancePlanEditDialog
        plan={selectedPlanForEdit}
        isOpen={!!selectedPlanForEdit}
        onClose={handleCloseEditDialog}
        onUpdate={updatePlan}
      />
    </div>
  );
};

export default MaintenancePlans;