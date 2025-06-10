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
import { Progress } from "@/components/ui/progress";
import { Plus, Search, Filter, Clock, CheckCircle, AlertTriangle, User, Wrench, Calendar, Edit, Trash2 } from "lucide-react";
import { useWorkOrders } from "@/hooks/useWorkOrders";
import { toast } from "@/hooks/use-toast";
import WorkOrderEditDialog from "./WorkOrderEditDialog";
import WorkOrderAssignDialog from "./WorkOrderAssignDialog";
import WorkOrderExecuteDialog from "./WorkOrderExecuteDialog";
import { formatDateForDisplay } from "@/lib/utils"; // Importar a nova função


const WorkOrders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("active");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [assigningOrderId, setAssigningOrderId] = useState(null);
  const [executingOrderId, setExecutingOrderId] = useState(null);
  const [rescheduleOrderId, setRescheduleOrderId] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [newOrder, setNewOrder] = useState({
    title: "",
    type: "",
    description: "",
    priority: "medium",
    estimated_hours: "",
    scheduled_date: ""
  });

  const { workOrders, loading, createWorkOrder, updateWorkOrder, deleteWorkOrder } = useWorkOrders();

  const handleCreateOrder = async () => {
    if (!newOrder.title || !newOrder.type) {
      toast({
        title: "Erro",
        description: "Título e tipo são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      title: newOrder.title,
      type: newOrder.type as 'preventiva' | 'preditiva' | 'corretiva',
      description: newOrder.description || undefined,
      priority: newOrder.priority as 'low' | 'medium' | 'high' | 'critical',
      estimated_hours: newOrder.estimated_hours ? parseInt(newOrder.estimated_hours) : undefined,
      scheduled_date: newOrder.scheduled_date || undefined,
      status: 'open' as const
    };

    const result = await createWorkOrder(orderData);
    if (result) {
      setIsCreateDialogOpen(false);
      setNewOrder({
        title: "",
        type: "",
        description: "",
        priority: "medium",
        estimated_hours: "",
        scheduled_date: ""
      });
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (confirm("Tem certeza que deseja deletar esta ordem?")) {
      await deleteWorkOrder(orderId);
    }
  };

  const handleAssignOrder = async (orderId: string, assignedTo: string) => {
    return await updateWorkOrder(orderId, { 
      assigned_to: assignedTo,
      status: 'in_progress'
    });
  };

  const handleExecuteOrder = async (orderId: string, data: any) => {
    return await updateWorkOrder(orderId, data);
  };

  const handleRescheduleOrder = async () => {
    if (!rescheduleOrderId || !rescheduleDate) {
      toast({
        title: "Erro",
        description: "Selecione uma nova data",
        variant: "destructive",
      });
      return;
    }

    const result = await updateWorkOrder(rescheduleOrderId, {
      scheduled_date: rescheduleDate
    });

    if (result) {
      setRescheduleOrderId(null);
      setRescheduleDate("");
      toast({
        title: "Ordem reagendada",
        description: "Data atualizada com sucesso",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-blue-100 text-blue-800 border-blue-200";
      case "in_progress": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open": return "Aberto";
      case "in_progress": return "Em Andamento";
      case "completed": return "Concluído";
      case "cancelled": return "Cancelado";
      default: return status;
    }
  };

  const filteredOrders = workOrders.filter(order => {
    const matchesSearch = order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.equipment?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus;
    
    if (activeTab === "active") {
      return matchesSearch && matchesStatus && !["completed", "cancelled"].includes(order.status);
    } else if (activeTab === "completed") {
      return matchesSearch && matchesStatus && order.status === "completed";
    } else {
      return matchesSearch && matchesStatus && order.status === "cancelled";
    }
  });

  const activeOrders = workOrders.filter(order => !["completed", "cancelled"].includes(order.status));
  const completedOrders = workOrders.filter(order => order.status === "completed");
  const cancelledOrders = workOrders.filter(order => order.status === "cancelled");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2 mx-auto"></div>
          <p>Carregando ordens...</p>
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
              <CardTitle>Ordens de Serviço</CardTitle>
              <CardDescription>Gestão completa de ordens de manutenção</CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Ordem
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Criar Nova Ordem de Serviço</DialogTitle>
                  <DialogDescription>
                    Gere uma nova ordem de manutenção no sistema
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="order-title">Título da Ordem</Label>
                    <Input 
                      id="order-title" 
                      placeholder="Ex: Manutenção Preventiva - Equipamento" 
                      value={newOrder.title}
                      onChange={(e) => setNewOrder({...newOrder, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="order-type">Tipo de Manutenção</Label>
                    <Select value={newOrder.type} onValueChange={(value) => setNewOrder({...newOrder, type: value})}>
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
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select value={newOrder.priority} onValueChange={(value) => setNewOrder({...newOrder, priority: value})}>
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
                  <div className="space-y-2">
                    <Label htmlFor="estimated-hours">Horas Estimadas</Label>
                    <Input 
                      id="estimated-hours" 
                      type="number" 
                      placeholder="Ex: 4" 
                      value={newOrder.estimated_hours}
                      onChange={(e) => setNewOrder({...newOrder, estimated_hours: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scheduled-date">Data Agendada</Label>
                    <Input 
                      id="scheduled-date" 
                      type="date" 
                      value={newOrder.scheduled_date}
                      onChange={(e) => setNewOrder({...newOrder, scheduled_date: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="description">Descrição dos Serviços</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Descreva detalhadamente os serviços a serem executados..." 
                      value={newOrder.description}
                      onChange={(e) => setNewOrder({...newOrder, description: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateOrder}>Criar Ordem</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar ordens de serviço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="open">Aberto</SelectItem>
                <SelectItem value="in_progress">Em Andamento</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ordens Ativas</p>
                <p className="text-2xl font-bold">{activeOrders.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Concluídas</p>
                <p className="text-2xl font-bold">{completedOrders.length}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Canceladas</p>
                <p className="text-2xl font-bold">{cancelledOrders.length}</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active" className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Ativas ({activeOrders.length})</span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>Concluídas ({completedOrders.length})</span>
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Canceladas ({cancelledOrders.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma ordem encontrada</h3>
                <p className="text-gray-600">
                  {workOrders.length === 0 
                    ? "Crie uma nova ordem de serviço para começar."
                    : "Tente ajustar seus filtros de busca ou crie uma nova ordem."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{order.title}</CardTitle>
                        <CardDescription>
                          {order.equipment?.name || "Sem equipamento"}
                          {order.assigned_to_profile && (
                            <span className="ml-2 text-blue-600">
                              • {order.assigned_to_profile.full_name}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setEditingOrder(order)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteOrder(order.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Status:</span>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Prioridade:</span>
                      <Badge className={getPriorityColor(order.priority)}>
                        {order.priority === 'critical' ? 'Crítica' : 
                         order.priority === 'high' ? 'Alta' : 
                         order.priority === 'medium' ? 'Média' : 'Baixa'}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Tipo:</span>
                      <Badge className={getTypeColor(order.type)}>
                        {order.type === 'preventiva' ? 'Preventiva' : 
                         order.type === 'preditiva' ? 'Preditiva' : 'Corretiva'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {order.estimated_hours && (
                        <div>
                          <span className="text-gray-600">Horas Est.:</span>
                          <div className="font-medium">{order.estimated_hours}h</div>
                        </div>
                      )}
                      {order.actual_hours && (
                        <div>
                          <span className="text-gray-600">Horas Reais:</span>
                          <div className="font-medium">{order.actual_hours}h</div>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-600">Criada em:</span>
                        <div className="font-medium">
                          {new Date(order.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      {order.scheduled_date && (
                        <div>
                          <span className="text-gray-600">Agendada para:</span>
                          <div className="font-medium text-blue-600">
                            {formatDateForDisplay(order.scheduled_date)} {/* Usando a nova função */}
                          </div>
                        </div>
                      )}
                      {order.completed_date && (
                        <div>
                          <span className="text-gray-600">Concluída em:</span>
                          <div className="font-medium text-green-600">
                            {formatDateForDisplay(order.completed_date)} {/* Usando a nova função */}
                          </div>
                        </div>
                      )}
                    </div>

                    {order.description && (
                      <div className="pt-3 border-t">
                        <p className="text-sm text-gray-600 mb-1">Descrição:</p>
                        <p className="text-sm">{order.description}</p>
                      </div>
                    )}

                    <div className="flex space-x-2 pt-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setAssigningOrderId(order.id)}
                      >
                        <User className="w-4 h-4 mr-1" />
                        {order.assigned_to ? 'Reatribuir' : 'Atribuir'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setRescheduleOrderId(order.id)}
                      >
                        <Calendar className="w-4 h-4 mr-1" />
                        Reagendar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setExecutingOrderId(order.id)}
                        disabled={order.status === 'completed'}
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

      {/* Dialogs */}
      <WorkOrderEditDialog
        order={editingOrder}
        isOpen={!!editingOrder}
        onClose={() => setEditingOrder(null)}
        onUpdate={updateWorkOrder}
      />

      <WorkOrderAssignDialog
        orderId={assigningOrderId}
        currentAssignedTo={workOrders.find(o => o.id === assigningOrderId)?.assigned_to}
        isOpen={!!assigningOrderId}
        onClose={() => setAssigningOrderId(null)}
        onAssign={handleAssignOrder}
      />

      <WorkOrderExecuteDialog
        orderId={executingOrderId}
        isOpen={!!executingOrderId}
        onClose={() => setExecutingOrderId(null)}
        onExecute={handleExecuteOrder}
      />

      {/* Reschedule Dialog */}
      <Dialog open={!!rescheduleOrderId} onOpenChange={() => setRescheduleOrderId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reagendar Ordem de Serviço</DialogTitle>
            <DialogDescription>
              Selecione uma nova data para execução
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reschedule-date">Nova Data</Label>
              <Input
                id="reschedule-date"
                type="date"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setRescheduleOrderId(null)}>
              Cancelar
            </Button>
            <Button onClick={handleRescheduleOrder}>
              Reagendar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkOrders;