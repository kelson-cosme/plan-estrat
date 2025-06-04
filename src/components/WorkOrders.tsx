
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

const WorkOrders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("active");

  const workOrders = [
    {
      id: "OS-2024-001",
      title: "Manutenção Preventiva - Compressor AR-001",
      equipment: "Compressor AR-001",
      type: "Preventiva",
      status: "Em Andamento",
      priority: "Média",
      technician: "João Silva",
      createdDate: "12/06/2024",
      scheduledDate: "15/06/2024",
      completionDate: null,
      estimatedHours: 4,
      actualHours: 2.5,
      progress: 65,
      description: "Lubrificação geral, verificação de filtros e inspeção visual",
      cost: "R$ 350,00",
      materials: ["Óleo lubrificante", "Filtro de ar", "Vedações"]
    },
    {
      id: "OS-2024-002",
      title: "Reparo Corretivo - Motor EL-205",
      equipment: "Motor EL-205",
      type: "Corretiva",
      status: "Aguardando Peças",
      priority: "Alta",
      technician: "Maria Santos",
      createdDate: "10/06/2024",
      scheduledDate: "18/06/2024",
      completionDate: null,
      estimatedHours: 8,
      actualHours: 0,
      progress: 15,
      description: "Substituição de rolamentos e verificação de alinhamento",
      cost: "R$ 2.500,00",
      materials: ["Rolamentos 6308", "Graxa especial", "Parafusos"]
    },
    {
      id: "OS-2024-003",
      title: "Inspeção Preditiva - Transformador TR-204",
      equipment: "Transformador TR-204",
      type: "Preditiva",
      status: "Concluído",
      priority: "Baixa",
      technician: "Pedro Costa",
      createdDate: "05/06/2024",
      scheduledDate: "08/06/2024",
      completionDate: "08/06/2024",
      estimatedHours: 6,
      actualHours: 5.5,
      progress: 100,
      description: "Análise de óleo isolante e termografia",
      cost: "R$ 800,00",
      materials: ["Kit análise óleo"]
    },
    {
      id: "OS-2024-004",
      title: "Calibração - Instrumentos de Medição",
      equipment: "Instrumentos Setor A",
      type: "Preventiva",
      status: "Agendado",
      priority: "Média",
      technician: "Ana Lima",
      createdDate: "13/06/2024",
      scheduledDate: "20/06/2024",
      completionDate: null,
      estimatedHours: 6,
      actualHours: 0,
      progress: 0,
      description: "Calibração de sensores de pressão e temperatura",
      cost: "R$ 450,00",
      materials: ["Certificados calibração"]
    },
    {
      id: "OS-2024-005",
      title: "Manutenção Emergencial - Bomba HY-102",
      equipment: "Bomba HY-102",
      type: "Corretiva",
      status: "Cancelado",
      priority: "Crítica",
      technician: "Roberto Alves",
      createdDate: "11/06/2024",
      scheduledDate: "12/06/2024",
      completionDate: null,
      estimatedHours: 12,
      actualHours: 0,
      progress: 0,
      description: "Falha no selo mecânico - vazamento severo",
      cost: "R$ 3.200,00",
      materials: ["Selo mecânico", "Anel O-ring", "Fluido hidráulico"]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Agendado": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Em Andamento": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Aguardando Peças": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Concluído": return "bg-green-100 text-green-800 border-green-200";
      case "Cancelado": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Crítica": return "bg-red-100 text-red-800 border-red-200";
      case "Alta": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Média": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Baixa": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Preventiva": return "bg-green-100 text-green-800 border-green-200";
      case "Preditiva": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Corretiva": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const filteredOrders = workOrders.filter(order => {
    const matchesSearch = order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.equipment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus;
    
    if (activeTab === "active") {
      return matchesSearch && matchesStatus && !["Concluído", "Cancelado"].includes(order.status);
    } else if (activeTab === "completed") {
      return matchesSearch && matchesStatus && order.status === "Concluído";
    } else {
      return matchesSearch && matchesStatus && order.status === "Cancelado";
    }
  });

  const activeOrders = workOrders.filter(order => !["Concluído", "Cancelado"].includes(order.status));
  const completedOrders = workOrders.filter(order => order.status === "Concluído");
  const cancelledOrders = workOrders.filter(order => order.status === "Cancelado");

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
            <Dialog>
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
                    <Input id="order-title" placeholder="Ex: Manutenção Preventiva - Equipamento" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="order-type">Tipo de Manutenção</Label>
                    <Select>
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
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o equipamento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="comp-001">Compressor AR-001</SelectItem>
                        <SelectItem value="motor-205">Motor EL-205</SelectItem>
                        <SelectItem value="bomba-102">Bomba HY-102</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critica">Crítica</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="baixa">Baixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="technician">Técnico Responsável</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o técnico" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="joao">João Silva</SelectItem>
                        <SelectItem value="maria">Maria Santos</SelectItem>
                        <SelectItem value="pedro">Pedro Costa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estimated-hours">Horas Estimadas</Label>
                    <Input id="estimated-hours" type="number" placeholder="Ex: 4" />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="description">Descrição dos Serviços</Label>
                    <Textarea id="description" placeholder="Descreva detalhadamente os serviços a serem executados..." />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline">Cancelar</Button>
                  <Button>Criar Ordem</Button>
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
                <SelectItem value="Agendado">Agendado</SelectItem>
                <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                <SelectItem value="Aguardando Peças">Aguardando Peças</SelectItem>
                <SelectItem value="Concluído">Concluído</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
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
                <p className="text-2xl font-bold text-blue-600">{activeOrders.length}</p>
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
                <p className="text-2xl font-bold text-green-600">{completedOrders.length}</p>
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
                <p className="text-2xl font-bold text-red-600">{cancelledOrders.length}</p>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{order.title}</CardTitle>
                      <CardDescription>{order.id} • {order.equipment}</CardDescription>
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Prioridade:</span>
                    <Badge className={getPriorityColor(order.priority)}>{order.priority}</Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tipo:</span>
                    <Badge className={getTypeColor(order.type)}>{order.type}</Badge>
                  </div>

                  {order.status === "Em Andamento" && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progresso:</span>
                        <span className="font-medium">{order.progress}%</span>
                      </div>
                      <Progress value={order.progress} className="h-2" />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Técnico:</span>
                      <div className="font-medium">{order.technician}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Horas Est.:</span>
                      <div className="font-medium">{order.estimatedHours}h</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Criada em:</span>
                      <div className="font-medium">{order.createdDate}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Agendada para:</span>
                      <div className="font-medium text-blue-600">{order.scheduledDate}</div>
                    </div>
                  </div>

                  {order.completionDate && (
                    <div className="text-sm pt-2 border-t">
                      <span className="text-gray-600">Concluída em:</span>
                      <span className="ml-2 font-medium text-green-600">{order.completionDate}</span>
                    </div>
                  )}

                  {order.status === "Em Andamento" && (
                    <div className="flex justify-between text-sm pt-2 border-t">
                      <span className="text-gray-600">Horas Trabalhadas:</span>
                      <span className="font-medium">{order.actualHours}h / {order.estimatedHours}h</span>
                    </div>
                  )}

                  <div className="flex space-x-2 pt-3">
                    <Button variant="outline" size="sm" className="flex-1">
                      <User className="w-4 h-4 mr-1" />
                      Atribuir
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      Reagendar
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

          {filteredOrders.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma ordem encontrada</h3>
                <p className="text-gray-600">Tente ajustar seus filtros de busca ou crie uma nova ordem.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkOrders;
