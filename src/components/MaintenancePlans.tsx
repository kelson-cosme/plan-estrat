
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
import { Plus, Calendar, Clock, Wrench, AlertTriangle, CheckCircle, Edit, Trash2, Play, Pause } from "lucide-react";
import { useMaintenancePlansData } from "@/hooks/useMaintenancePlansData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const MaintenancePlans = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: "",
    type: "",
    equipment_id: "",
    frequency_days: "",
    tasks: "",
    priority: "medium",
    description: ""
  });

  const { plans, loading, createPlan, updatePlan, deletePlan } = useMaintenancePlansData();

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

  const handleCreatePlan = async () => {
    if (!newPlan.name || !newPlan.type) {
      toast({
        title: "Erro",
        description: "Nome e tipo são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const planData = {
      name: newPlan.name,
      type: newPlan.type,
      equipment_id: newPlan.equipment_id || undefined,
      frequency_days: newPlan.frequency_days ? parseInt(newPlan.frequency_days) : undefined,
      tasks: newPlan.tasks || undefined,
      priority: newPlan.priority as 'low' | 'medium' | 'high' | 'critical',
      description: newPlan.description || undefined,
      active: true
    };

    const result = await createPlan(planData);
    if (result) {
      setIsCreateDialogOpen(false);
      setNewPlan({
        name: "",
        type: "",
        equipment_id: "",
        frequency_days: "",
        tasks: "",
        priority: "medium",
        description: ""
      });
    }
  };

  const handleToggleActive = async (plan: any) => {
    await updatePlan(plan.id, { active: !plan.active });
  };

  const handleDeletePlan = async (planId: string) => {
    if (confirm("Tem certeza que deseja deletar este plano?")) {
      await deletePlan(planId);
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
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Plano
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
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
                    <Label htmlFor="frequency">Frequência (dias)</Label>
                    <Input 
                      id="frequency" 
                      type="number" 
                      placeholder="Ex: 30" 
                      value={newPlan.frequency_days}
                      onChange={(e) => setNewPlan({...newPlan, frequency_days: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select value={newPlan.priority} onValueChange={(value) => setNewPlan({...newPlan, priority: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Crítica</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="low">Baixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="tasks">Tarefas do Plano</Label>
                    <Textarea 
                      id="tasks" 
                      placeholder="Descreva as tarefas que devem ser executadas..." 
                      value={newPlan.tasks}
                      onChange={(e) => setNewPlan({...newPlan, tasks: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Descreva o plano de manutenção..." 
                      value={newPlan.description}
                      onChange={(e) => setNewPlan({...newPlan, description: e.target.value})}
                    />
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
                        <Button variant="ghost" size="sm">
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
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {plan.frequency_days && (
                        <div>
                          <span className="text-gray-600">Frequência:</span>
                          <div className="font-medium">{plan.frequency_days} dias</div>
                        </div>
                      )}
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

                    {plan.tasks && (
                      <div className="pt-3 border-t">
                        <p className="text-sm text-gray-600 mb-1">Tarefas:</p>
                        <p className="text-sm">{plan.tasks}</p>
                      </div>
                    )}

                    {plan.description && (
                      <div className="pt-3 border-t">
                        <p className="text-sm text-gray-600 mb-1">Descrição:</p>
                        <p className="text-sm">{plan.description}</p>
                      </div>
                    )}

                    <div className="flex space-x-2 pt-3">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        Agendar
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
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
    </div>
  );
};

export default MaintenancePlans;
