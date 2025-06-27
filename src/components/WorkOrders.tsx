import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Filter, Clock, CheckCircle, AlertTriangle, User, Wrench, Calendar, Edit, Trash2, XCircle, Printer, List, LayoutGrid } from "lucide-react";
import { useWorkOrders, WorkOrder } from "@/hooks/useWorkOrders";
import { toast } from "@/hooks/use-toast";
import WorkOrderEditDialog from "./WorkOrderEditDialog";
import WorkOrderAssignDialog from "./WorkOrderAssignDialog";
import WorkOrderExecuteDialog from "./WorkOrderExecuteDialog";
import { formatDateForDisplay } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PrintableWorkOrder } from "./PrintableWorkOrder";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useViewMode } from "@/contexts/ViewModeContext";

interface WorkOrdersProps {
  prefillData?: any | null;
  onPrefillHandled?: () => void;
  onPrintOrder: (order: WorkOrder) => void;
}

const WorkOrders = ({ prefillData, onPrefillHandled, onPrintOrder }: WorkOrdersProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const { viewMode, setViewMode } = useViewMode();
  const [activeTab, setActiveTab] = useState("active");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<WorkOrder | null>(null);
  const [executingOrder, setExecutingOrder] = useState<WorkOrder | null>(null);
  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null);
  const [rescheduleOrderId, setRescheduleOrderId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");

  const [newOrder, setNewOrder] = useState({
    title: "", type: "", description: "", priority: "medium", estimated_hours: "",
    scheduled_date: "", equipment_id: "", maintenance_plan_id: "", tasks: [] as string[],
    used_resources: [] as string[],
  });
  const [newTaskInput, setNewTaskInput] = useState("");
  const [newUsedResourceInput, setNewUsedResourceInput] = useState("");

  const { workOrders, loading, createWorkOrder, updateWorkOrder, deleteWorkOrder } = useWorkOrders();

  const { data: equipment = [] } = useQuery({
    queryKey: ['equipmentListForWO'],
    queryFn: async () => {
      const { data, error } = await supabase.from('equipment').select('id, name, code').order('name');
      if (error) throw error;
      return data || [];
    }
  });

  useEffect(() => {
    if (prefillData && onPrefillHandled) {
      setNewOrder({
        title: prefillData.title || "",
        type: prefillData.type || "",
        description: prefillData.description || "",
        priority: prefillData.priority || "medium",
        scheduled_date: prefillData.scheduled_date || "",
        equipment_id: prefillData.equipment_id || "",
        maintenance_plan_id: prefillData.maintenance_plan_id || "",
        tasks: prefillData.tasks || [],
        used_resources: prefillData.required_resources || [],
        estimated_hours: prefillData.estimated_hours?.toString() || "",
      });
      setIsCreateDialogOpen(true);
      onPrefillHandled();
    }
  }, [prefillData, onPrefillHandled]);
  
  const handlePrint = (order: WorkOrder) => {
    onPrintOrder(order);
  };

  const handleAddTask = () => { if (newTaskInput.trim() !== "") { setNewOrder(prev => ({ ...prev, tasks: [...prev.tasks, newTaskInput.trim()] })); setNewTaskInput(""); } };
  const handleRemoveTask = (indexToRemove: number) => { setNewOrder(prev => ({ ...prev, tasks: prev.tasks.filter((_, index) => index !== indexToRemove) })); };
  const handleAddUsedResource = () => { if (newUsedResourceInput.trim() !== "") { setNewOrder(prev => ({ ...prev, used_resources: [...prev.used_resources, newUsedResourceInput.trim()] })); setNewUsedResourceInput(""); } };
  const handleRemoveUsedResource = (indexToRemove: number) => { setNewOrder(prev => ({ ...prev, used_resources: prev.used_resources.filter((_, index) => index !== indexToRemove) })); };

  const handleCreateOrder = async () => {
    if (!newOrder.title || !newOrder.type) {
      toast({ title: "Erro", description: "Título e tipo são obrigatórios", variant: "destructive" }); return;
    }
    const tasksString = newOrder.tasks.length > 0 ? `\n\n--- Tarefas ---\n${newOrder.tasks.map(task => `- ${task}`).join('\n')}` : '';
    const finalDescription = `${newOrder.description}${tasksString}`;

    const orderData = {
      title: newOrder.title,
      type: newOrder.type as 'preventiva' | 'preditiva' | 'corretiva',
      description: finalDescription.trim() || undefined,
      priority: newOrder.priority as 'low' | 'medium' | 'high' | 'critical',
      estimated_hours: newOrder.estimated_hours ? parseInt(newOrder.estimated_hours) : undefined,
      scheduled_date: newOrder.scheduled_date || undefined,
      status: 'open' as const,
      equipment_id: newOrder.equipment_id || undefined,
      maintenance_plan_id: newOrder.maintenance_plan_id || undefined,
      used_resources: newOrder.used_resources.length > 0 ? newOrder.used_resources : null,
    };
    const result = await createWorkOrder(orderData);
    if (result) {
      setIsCreateDialogOpen(false);
      setNewOrder({ title: "", type: "", description: "", priority: "medium", estimated_hours: "", scheduled_date: "", equipment_id: "", maintenance_plan_id: "", tasks: [], used_resources: [] });
      setNewTaskInput("");
      setNewUsedResourceInput("");
    }
  };

  const handleDeleteOrder = async (orderId: string) => { if (window.confirm("Tem certeza que deseja deletar esta ordem?")) { await deleteWorkOrder(orderId); } };
  const handleAssignOrder = async (orderId: string, assignedTo: string) => { return await updateWorkOrder(orderId, { assigned_to: assignedTo, status: 'in_progress' }); };
  const handleExecuteOrder = async (orderId: string, data: any) => { return await updateWorkOrder(orderId, data); };
  const handleRescheduleOrder = async () => { if (!rescheduleOrderId || !rescheduleDate) { toast({ title: "Erro", description: "Selecione uma nova data", variant: "destructive" }); return; } const result = await updateWorkOrder(rescheduleOrderId, { scheduled_date: rescheduleDate }); if (result) { setRescheduleOrderId(null); setRescheduleDate(""); toast({ title: "Ordem reagendada", description: "Data atualizada com sucesso" }); } };
  const getStatusColor = (status: string) => { switch (status) { case "open": return "bg-blue-100 text-blue-800 border-blue-200"; case "in_progress": return "bg-yellow-100 text-yellow-800 border-yellow-200"; case "completed": return "bg-green-100 text-green-800 border-green-200"; case "cancelled": return "bg-red-100 text-red-800 border-red-200"; default: return "bg-gray-100 text-gray-800 border-gray-200"; } };
  const getPriorityColor = (priority: string) => { switch (priority) { case "critical": return "bg-red-100 text-red-800 border-red-200"; case "high": return "bg-orange-100 text-orange-800 border-orange-200"; case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200"; case "low": return "bg-blue-100 text-blue-800 border-blue-200"; default: return "bg-gray-100 text-gray-800 border-gray-200"; } };
  const getTypeColor = (type: string) => { switch (type) { case "preventiva": return "bg-green-100 text-green-800 border-green-200"; case "preditiva": return "bg-blue-100 text-blue-800 border-blue-200"; case "corretiva": return "bg-red-100 text-red-800 border-red-200"; default: return "bg-gray-100 text-gray-800 border-gray-200"; } };
  const getStatusLabel = (status: string) => { switch (status) { case "open": return "Aberto"; case "in_progress": return "Em Andamento"; case "completed": return "Concluído"; case "cancelled": return "Cancelado"; default: return status; } };

  const activeOrders = workOrders.filter(order => !["completed", "cancelled"].includes(order.status!));
  const completedOrders = workOrders.filter(order => order.status === "completed");
  const cancelledOrders = workOrders.filter(order => order.status === "cancelled");

  const filteredOrders = workOrders.filter(order => {
    const matchesSearch = order.title.toLowerCase().includes(searchTerm.toLowerCase()) || (order.equipment?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus;

    if (activeTab === "active") return matchesSearch && matchesStatus && !["completed", "cancelled"].includes(order.status!);
    if (activeTab === "completed") return matchesSearch && matchesStatus && order.status === "completed";
    if (activeTab === "cancelled") return matchesSearch && matchesStatus && order.status === "cancelled";
    return true;
  });

  if (loading) { return (<div className="flex items-center justify-center min-h-64"><div className="text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2 mx-auto"></div><p>Carregando ordens...</p></div></div>); }

  return (
    <div className="space-y-6">
      <Card>
          <CardHeader>
              <div className="flex justify-between items-center">
                  <div><CardTitle>Ordens de Serviço</CardTitle><CardDescription>Gestão completa de ordens de manutenção</CardDescription></div>
                  <div className="flex items-center space-x-2">
                  <ToggleGroup type="single" value={viewMode} onValueChange={(value) => { if (value) setViewMode(value as any) }} aria-label="Visualização">
                      <ToggleGroupItem value="card" aria-label="Visualização em Card">
                        <LayoutGrid className="h-4 w-4" />
                      </ToggleGroupItem>
                      <ToggleGroupItem value="list" aria-label="Visualização em Lista">
                        <List className="h-4 w-4" />
                      </ToggleGroupItem>
                    </ToggleGroup>
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}><DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Nova Ordem</Button></DialogTrigger>
                  <DialogContent className="max-w-3xl">
                      <DialogHeader><DialogTitle>Criar Nova Ordem de Serviço</DialogTitle><DialogDescription>Gere uma nova ordem de manutenção no sistema</DialogDescription></DialogHeader>
                      <div className="grid grid-cols-2 gap-4 py-4 pr-4">
                          <div className="space-y-2"><Label htmlFor="order-title">Título da Ordem</Label><Input id="order-title" placeholder="Ex: Manutenção Preventiva - Equipamento" value={newOrder.title} onChange={(e) => setNewOrder({...newOrder, title: e.target.value})}/></div>
                          <div className="space-y-2"><Label htmlFor="order-type">Tipo de Manutenção</Label><Select value={newOrder.type} onValueChange={(value) => setNewOrder({...newOrder, type: value})}><SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger><SelectContent><SelectItem value="preventiva">Preventiva</SelectItem><SelectItem value="preditiva">Preditiva</SelectItem><SelectItem value="corretiva">Corretiva</SelectItem></SelectContent></Select></div>
                          <div className="space-y-2"><Label htmlFor="equipment_id">Equipamento</Label><Select value={newOrder.equipment_id} onValueChange={(value) => setNewOrder({...newOrder, equipment_id: value})}><SelectTrigger><SelectValue placeholder="Selecione o equipamento" /></SelectTrigger><SelectContent>{equipment.map(eq => (<SelectItem key={eq.id} value={eq.id}>{eq.name} ({eq.code})</SelectItem>))}</SelectContent></Select></div>
                          <div className="space-y-2"><Label htmlFor="priority">Prioridade</Label><Select value={newOrder.priority} onValueChange={(value) => setNewOrder({...newOrder, priority: value})}><SelectTrigger><SelectValue placeholder="Selecione a prioridade" /></SelectTrigger><SelectContent><SelectItem value="critical">Crítica</SelectItem><SelectItem value="high">Alta</SelectItem><SelectItem value="medium">Média</SelectItem><SelectItem value="low">Baixa</SelectItem></SelectContent></Select></div>
                          <div className="space-y-2"><Label htmlFor="estimated-hours">Horas Estimadas</Label><Input id="estimated-hours" type="number" placeholder="Ex: 4" value={newOrder.estimated_hours} onChange={(e) => setNewOrder({...newOrder, estimated_hours: e.target.value})}/></div>
                          <div className="space-y-2"><Label htmlFor="scheduled-date">Data Agendada</Label><Input id="scheduled-date" type="date" value={newOrder.scheduled_date} onChange={(e) => setNewOrder({...newOrder, scheduled_date: e.target.value})}/></div>
                          <div className="col-span-2 space-y-2"><Label htmlFor="description">Descrição Adicional</Label><Textarea id="description" placeholder="Adicione observações ou detalhes extras..." value={newOrder.description} onChange={(e) => setNewOrder({...newOrder, description: e.target.value})}/></div>
                          <div className="col-span-2 space-y-2"><Label htmlFor="tasks">Tarefas da Ordem de Serviço</Label><div className="space-y-2">{newOrder.tasks.map((task, index) => (<div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded-md"><span className="text-sm">{task}</span><Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveTask(index)}><XCircle className="w-4 h-4 text-red-500" /></Button></div>))}{(!newOrder.tasks || newOrder.tasks.length === 0) && (<p className="text-sm text-muted-foreground">Nenhuma tarefa herdada do plano.</p>)}<div className="flex space-x-2 pt-2"><Input id="new-task-input" placeholder="Adicionar nova tarefa" value={newTaskInput} onChange={(e) => setNewTaskInput(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTask(); } }}/>
<Button type="button" onClick={handleAddTask}>Adicionar</Button></div></div></div>
                          <div className="col-span-2 space-y-2"><Label htmlFor="used-resources">Recursos Utilizados</Label><div className="flex space-x-2"><Input id="new-used-resource-input" placeholder="Adicionar recurso utilizado (Ex: Parafuso M8)" value={newUsedResourceInput} onChange={(e) => setNewUsedResourceInput(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddUsedResource(); } }}/><Button type="button" onClick={handleAddUsedResource}>Adicionar</Button></div><div className="space-y-1">{newOrder.used_resources.map((resource, index) => (<div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded-md"><span className="text-sm">{resource}</span><Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveUsedResource(index)}><XCircle className="w-4 h-4 text-red-500" /></Button></div>))}</div>{newOrder.used_resources.length === 0 && (<p className="text-sm text-muted-foreground">Nenhum recurso adicionado.</p>)}</div>
                      </div>
                      <div className="flex justify-end space-x-2"><Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancelar</Button><Button onClick={handleCreateOrder}>Criar Ordem</Button></div>
                  </DialogContent>
                  </Dialog>
                  </div>
              </div>
          </CardHeader>
          <CardContent><div className="flex flex-col md:flex-row gap-4"><div className="flex-1 relative"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><Input placeholder="Buscar ordens de serviço..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10"/></div><Select value={selectedStatus} onValueChange={setSelectedStatus}><SelectTrigger className="w-full md:w-48"><Filter className="w-4 h-4 mr-2" /><SelectValue placeholder="Filtrar por status" /></SelectTrigger><SelectContent><SelectItem value="all">Todos os Status</SelectItem><SelectItem value="open">Aberto</SelectItem><SelectItem value="in_progress">Em Andamento</SelectItem><SelectItem value="completed">Concluído</SelectItem><SelectItem value="cancelled">Cancelado</SelectItem></SelectContent></Select></div></CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6"><Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Ordens Ativas</p><p className="text-2xl font-bold">{activeOrders.length}</p></div><div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center"><Clock className="h-6 w-6 text-blue-600" /></div></div></CardContent></Card><Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Concluídas</p><p className="text-2xl font-bold">{completedOrders.length}</p></div><div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center"><CheckCircle className="h-6 w-6 text-green-600" /></div></div></CardContent></Card><Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Canceladas</p><p className="text-2xl font-bold">{cancelledOrders.length}</p></div><div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center"><AlertTriangle className="h-6 w-6 text-red-600" /></div></div></CardContent></Card></div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3"><TabsTrigger value="active" className="flex items-center space-x-2"><Clock className="w-4 h-4" /><span>Ativas ({activeOrders.length})</span></TabsTrigger><TabsTrigger value="completed" className="flex items-center space-x-2"><CheckCircle className="w-4 h-4" /><span>Concluídas ({completedOrders.length})</span></TabsTrigger><TabsTrigger value="cancelled" className="flex items-center space-x-2"><AlertTriangle className="w-4 h-4" /><span>Canceladas ({cancelledOrders.length})</span></TabsTrigger></TabsList>
          <TabsContent value={activeTab} className="space-y-4">
          {filteredOrders.length === 0 ? (<Card><CardContent className="text-center py-12"><Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma ordem encontrada</h3><p className="text-gray-600">{workOrders.length === 0 ? "Crie uma nova ordem de serviço para começar." : "Tente ajustar seus filtros de busca ou crie uma nova ordem."}</p></CardContent></Card>
          ) : (
          viewMode === 'card' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{filteredOrders.map((order) => (<Card key={order.id} className="hover:shadow-lg transition-shadow"><CardHeader className="pb-3"><div className="flex justify-between items-start"><div><CardTitle className="text-lg">{order.title}</CardTitle><CardDescription>{order.equipment?.name || "Sem equipamento"}{order.assigned_to_profile && (<span className="ml-2 text-blue-600">• {order.assigned_to_profile.full_name}</span>)}</CardDescription></div><div className="flex space-x-1"><Button variant="ghost" size="sm" onClick={() => handlePrint(order)}><Printer className="w-4 h-4" /></Button><Button variant="ghost" size="sm" onClick={() => setEditingOrder(order)}><Edit className="w-4 h-4" /></Button><Button variant="ghost" size="sm" onClick={() => handleDeleteOrder(order.id)}><Trash2 className="w-4 h-4" /></Button></div></div></CardHeader><CardContent className="space-y-4"><div className="flex justify-between items-center"><span className="text-sm text-gray-600">Status:</span><Badge className={getStatusColor(order.status!)}>{getStatusLabel(order.status!)}</Badge></div><div className="flex justify-between items-center"><span className="text-sm text-gray-600">Prioridade:</span><Badge className={getPriorityColor(order.priority!)}>{order.priority === 'critical' ? 'Crítica' : order.priority === 'high' ? 'Alta' : order.priority === 'medium' ? 'Média' : 'Baixa'}</Badge></div><div className="flex justify-between items-center"><span className="text-sm text-gray-600">Tipo:</span><Badge className={getTypeColor(order.type!)}>{order.type === 'preventiva' ? 'Preventiva' : order.type === 'preditiva' ? 'Preditiva' : 'Corretiva'}</Badge></div><div className="grid grid-cols-2 gap-4 text-sm">{order.estimated_hours && (<div><span className="text-gray-600">Horas Est.:</span><div className="font-medium">{order.estimated_hours}h</div></div>)}{order.actual_hours && (<div><span className="text-gray-600">Horas Reais:</span><div className="font-medium">{order.actual_hours}h</div></div>)}<div><span className="text-gray-600">Criada em:</span><div className="font-medium">{new Date(order.created_at).toLocaleDateString('pt-BR')}</div></div>{order.scheduled_date && (<div><span className="text-gray-600">Agendada para:</span><div className="font-medium text-blue-600">{formatDateForDisplay(order.scheduled_date)}</div></div>)}{order.completed_date && (<div><span className="text-gray-600">Concluída em:</span><div className="font-medium text-green-600">{formatDateForDisplay(order.completed_date)}</div></div>)}</div>
                  {order.used_resources && order.used_resources.length > 0 && (<div className="pt-3 border-t flex flex-wrap items-center gap-2"><span className="text-sm text-gray-600">Recursos:</span>{order.used_resources.map((resource, idx) => (<Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{resource}</Badge>))}</div>)}
                  {order.description && (<div className="pt-3 border-t"><p className="text-sm text-gray-600 mb-1">Descrição:</p><p className="text-sm whitespace-pre-wrap">{order.description}</p></div>)}<div className="flex space-x-2 pt-3"><Button variant="outline" size="sm" className="flex-1" onClick={() => setAssigningOrderId(order.id)}><User className="w-4 h-4 mr-1" />{order.assigned_to ? 'Reatribuir' : 'Atribuir'}</Button><Button variant="outline" size="sm" className="flex-1" onClick={() => setRescheduleOrderId(order.id)}><Calendar className="w-4 h-4 mr-1" />Reagendar</Button><Button variant="outline" size="sm" className="flex-1" onClick={() => setExecutingOrder(order)} disabled={order.status === 'completed'}><Wrench className="w-4 h-4 mr-1" />Executar</Button></div></CardContent></Card>))}</div>
          ) : (
              <Card>
              <CardContent>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Título</th>
                      <th className="text-left py-3 px-4">Equipamento</th>
                      <th className="text-left py-3 px-4">Tipo</th>
                      <th className="text-left py-3 px-4">Prioridade</th>
                      <th className="text-center py-3 px-4">Status</th>
                      <th className="text-center py-3 px-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b">
                      <td className="py-3 px-4">{order.title}</td>
                      <td className="py-3 px-4">{order.equipment?.name || "N/A"}</td>
                      <td className="py-3 px-4">{order.type}</td>
                      <td className="py-3 px-4">{order.priority}</td>
                      <td className="text-center py-3 px-4">
                      <Badge className={getStatusColor(order.status!)}>
                        {getStatusLabel(order.status!)}
                      </Badge>
                      </td>
                      <td className="text-center py-3 px-4 flex items-center justify-center space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => handlePrint(order)}><Printer className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditingOrder(order)}><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteOrder(order.id)}><Trash2 className="w-4 h-4" /></Button>
                      </td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )
          )}
          </TabsContent>
      </Tabs>
      <WorkOrderEditDialog order={editingOrder} isOpen={!!editingOrder} onClose={() => setEditingOrder(null)} onUpdate={updateWorkOrder} />
      <WorkOrderAssignDialog orderId={assigningOrderId} currentAssignedTo={workOrders.find(o => o.id === assigningOrderId)?.assigned_to} isOpen={!!assigningOrderId} onClose={() => setAssigningOrderId(null)} onAssign={handleAssignOrder} />
      <WorkOrderExecuteDialog order={executingOrder} isOpen={!!executingOrder} onClose={() => setExecutingOrder(null)} onExecute={handleExecuteOrder} createFollowUpOrder={createWorkOrder} />
      <Dialog open={!!rescheduleOrderId} onOpenChange={() => setRescheduleOrderId(null)}><DialogContent><DialogHeader><DialogTitle>Reagendar Ordem de Serviço</DialogTitle><DialogDescription>Selecione uma nova data para execução</DialogDescription></DialogHeader><div className="space-y-4 py-4"><div className="space-y-2"><Label htmlFor="reschedule-date">Nova Data</Label><Input id="reschedule-date" type="date" value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)}/></div></div><div className="flex justify-end space-x-2"><Button variant="outline" onClick={() => setRescheduleOrderId(null)}>Cancelar</Button><Button onClick={handleRescheduleOrder}>Reagendar</Button></div></DialogContent></Dialog>
    </div>
  );
};

export default WorkOrders;