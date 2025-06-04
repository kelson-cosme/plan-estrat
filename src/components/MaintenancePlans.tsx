
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

const MaintenancePlans = () => {
  const [activeTab, setActiveTab] = useState("preventive");

  const preventivePlans = [
    {
      id: "PM-001",
      name: "Lubrificação Compressores",
      equipment: "Todos os Compressores",
      frequency: "Semanal",
      duration: "2h",
      technician: "João Silva",
      status: "Ativo",
      lastExecution: "08/06/2024",
      nextExecution: "15/06/2024",
      tasks: ["Verificar nível de óleo", "Lubrificar rolamentos", "Verificar filtros"],
      cost: "R$ 350,00"
    },
    {
      id: "PM-002",
      name: "Inspeção Transformadores",
      equipment: "Transformadores 1-5",
      frequency: "Mensal",
      duration: "4h",
      technician: "Maria Santos",
      status: "Ativo",
      lastExecution: "01/06/2024",
      nextExecution: "01/07/2024",
      tasks: ["Medição de temperatura", "Análise de óleo", "Verificação de isolamento"],
      cost: "R$ 1.200,00"
    },
    {
      id: "PM-003",
      name: "Calibração Instrumentos",
      equipment: "Instrumentos de Medição",
      frequency: "Trimestral",
      duration: "6h",
      technician: "Pedro Costa",
      status: "Pausado",
      lastExecution: "15/03/2024",
      nextExecution: "15/06/2024",
      tasks: ["Calibração de sensores", "Verificação de alarmes", "Teste de precisão"],
      cost: "R$ 800,00"
    }
  ];

  const predictivePlans = [
    {
      id: "PD-001",
      name: "Análise Vibracional Motores",
      equipment: "Motores Críticos",
      frequency: "Mensal",
      duration: "3h",
      technician: "Ana Lima",
      status: "Ativo",
      lastExecution: "10/06/2024",
      nextExecution: "10/07/2024",
      technology: "Análise de Vibração",
      threshold: "±10% dos valores base",
      cost: "R$ 450,00"
    },
    {
      id: "PD-002",
      name: "Termografia Quadros Elétricos",
      equipment: "Painéis Elétricos",
      frequency: "Bimestral",
      duration: "4h",
      technician: "Carlos Silva",
      status: "Ativo",
      lastExecution: "01/05/2024",
      nextExecution: "01/07/2024",
      technology: "Termografia",
      threshold: "Δt > 10°C",
      cost: "R$ 600,00"
    }
  ];

  const correctivePlans = [
    {
      id: "CM-001",
      name: "Reparo Bomba Hidráulica",
      equipment: "Bomba HY-102",
      priority: "Alta",
      estimatedDuration: "8h",
      technician: "Roberto Alves",
      status: "Em Andamento",
      startDate: "12/06/2024",
      description: "Substituição de selo mecânico e verificação de alinhamento",
      cost: "R$ 2.500,00"
    },
    {
      id: "CM-002",
      name: "Substituição Motor Ventilador",
      equipment: "Ventilador VT-205",
      priority: "Média",
      estimatedDuration: "6h",
      technician: "Felipe Santos",
      status: "Aguardando Peças",
      startDate: "15/06/2024",
      description: "Motor queimado - substituição completa necessária",
      cost: "R$ 3.200,00"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo": return "bg-green-100 text-green-800 border-green-200";
      case "Pausado": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Em Andamento": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Aguardando Peças": return "bg-orange-100 text-orange-800 border-orange-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Alta": return "bg-red-100 text-red-800 border-red-200";
      case "Média": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Baixa": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

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
            <Dialog>
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
                    <Input id="plan-name" placeholder="Ex: Lubrificação Mensal" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plan-type">Tipo de Manutenção</Label>
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
                        <SelectItem value="eq-001">Compressor AR-001</SelectItem>
                        <SelectItem value="eq-002">Motor EL-205</SelectItem>
                        <SelectItem value="eq-003">Bomba HY-102</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequência</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a frequência" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="semanal">Semanal</SelectItem>
                        <SelectItem value="mensal">Mensal</SelectItem>
                        <SelectItem value="trimestral">Trimestral</SelectItem>
                        <SelectItem value="semestral">Semestral</SelectItem>
                        <SelectItem value="anual">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="tasks">Tarefas do Plano</Label>
                    <Textarea id="tasks" placeholder="Liste as tarefas do plano, uma por linha..." />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline">Cancelar</Button>
                  <Button>Criar Plano</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Plans Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
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

        <TabsContent value="preventive" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {preventivePlans.map((plan) => (
              <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <CardDescription>{plan.id} • {plan.equipment}</CardDescription>
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm">
                        {plan.status === "Ativo" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
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
                    <Badge className={getStatusColor(plan.status)}>{plan.status}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Frequência:</span>
                      <div className="font-medium">{plan.frequency}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Duração:</span>
                      <div className="font-medium">{plan.duration}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Técnico:</span>
                      <div className="font-medium">{plan.technician}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Custo:</span>
                      <div className="font-medium text-green-600">{plan.cost}</div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t">
                    <div className="text-sm">
                      <span className="text-gray-600">Última Execução:</span>
                      <span className="ml-2 font-medium">{plan.lastExecution}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Próxima Execução:</span>
                      <span className="ml-2 font-medium text-blue-600">{plan.nextExecution}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <p className="text-sm text-gray-600 mb-2">Tarefas:</p>
                    <ul className="text-xs space-y-1">
                      {plan.tasks.map((task, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>

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
        </TabsContent>

        <TabsContent value="predictive" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {predictivePlans.map((plan) => (
              <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <CardDescription>{plan.id} • {plan.equipment}</CardDescription>
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
                    <Badge className={getStatusColor(plan.status)}>{plan.status}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Tecnologia:</span>
                      <div className="font-medium">{plan.technology}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Frequência:</span>
                      <div className="font-medium">{plan.frequency}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Técnico:</span>
                      <div className="font-medium">{plan.technician}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Custo:</span>
                      <div className="font-medium text-green-600">{plan.cost}</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <div className="text-sm">
                      <span className="text-gray-600">Limite de Alerta:</span>
                      <span className="ml-2 font-medium text-orange-600">{plan.threshold}</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t">
                    <div className="text-sm">
                      <span className="text-gray-600">Última Análise:</span>
                      <span className="ml-2 font-medium">{plan.lastExecution}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Próxima Análise:</span>
                      <span className="ml-2 font-medium text-blue-600">{plan.nextExecution}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-3">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      Agendar
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Wrench className="w-4 h-4 mr-1" />
                      Analisar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="corrective" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {correctivePlans.map((plan) => (
              <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <CardDescription>{plan.id} • {plan.equipment}</CardDescription>
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
                    <Badge className={getStatusColor(plan.status)}>{plan.status}</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Prioridade:</span>
                    <Badge className={getPriorityColor(plan.priority)}>{plan.priority}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Duração Est.:</span>
                      <div className="font-medium">{plan.estimatedDuration}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Técnico:</span>
                      <div className="font-medium">{plan.technician}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Início:</span>
                      <div className="font-medium">{plan.startDate}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Custo Est.:</span>
                      <div className="font-medium text-red-600">{plan.cost}</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <p className="text-sm text-gray-600 mb-2">Descrição:</p>
                    <p className="text-sm">{plan.description}</p>
                  </div>

                  <div className="flex space-x-2 pt-3">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      Reagendar
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Wrench className="w-4 h-4 mr-1" />
                      Iniciar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MaintenancePlans;
