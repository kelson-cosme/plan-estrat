
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar as CalendarIcon, Clock, User, Wrench, AlertTriangle, CheckCircle, Filter } from "lucide-react";

const MaintenanceCalendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedView, setSelectedView] = useState("month");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const maintenanceEvents = [
    {
      id: 1,
      title: "Lubrificação Compressor AR-001",
      date: "2024-06-15",
      time: "08:00",
      duration: "2h",
      type: "Preventiva",
      technician: "João Silva",
      equipment: "Compressor AR-001",
      status: "Agendado",
      priority: "Média"
    },
    {
      id: 2,
      title: "Inspeção Transformador TR-204",
      date: "2024-06-16",
      time: "14:00",
      duration: "4h",
      type: "Preventiva",
      technician: "Maria Santos",
      equipment: "Transformador TR-204",
      status: "Confirmado",
      priority: "Alta"
    },
    {
      id: 3,
      title: "Análise Vibracional Motor EL-205",
      date: "2024-06-17",
      time: "10:00",
      duration: "3h",
      type: "Preditiva",
      technician: "Ana Lima",
      equipment: "Motor EL-205",
      status: "Agendado",
      priority: "Baixa"
    },
    {
      id: 4,
      title: "Reparo Bomba HY-102",
      date: "2024-06-18",
      time: "09:00",
      duration: "8h",
      type: "Corretiva",
      technician: "Roberto Alves",
      equipment: "Bomba HY-102",
      status: "Em Andamento",
      priority: "Crítica"
    },
    {
      id: 5,
      title: "Calibração Instrumentos",
      date: "2024-06-20",
      time: "13:00",
      duration: "6h",
      type: "Preventiva",
      technician: "Pedro Costa",
      equipment: "Instrumentos de Medição",
      status: "Agendado",
      priority: "Média"
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Preventiva": return "bg-green-100 text-green-800 border-green-200";
      case "Preditiva": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Corretiva": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Agendado": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Confirmado": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Em Andamento": return "bg-purple-100 text-purple-800 border-purple-200";
      case "Concluído": return "bg-green-100 text-green-800 border-green-200";
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

  const filteredEvents = maintenanceEvents.filter(event => {
    if (selectedFilter === "all") return true;
    return event.type.toLowerCase() === selectedFilter;
  });

  const todayEvents = maintenanceEvents.filter(event => 
    event.date === new Date().toISOString().split('T')[0]
  );

  const upcomingEvents = maintenanceEvents.filter(event => {
    const eventDate = new Date(event.date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return eventDate >= tomorrow;
  }).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Calendário de Manutenção</CardTitle>
              <CardDescription>Visualização e gestão de cronogramas de manutenção</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="preventiva">Preventiva</SelectItem>
                  <SelectItem value="preditiva">Preditiva</SelectItem>
                  <SelectItem value="corretiva">Corretiva</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedView} onValueChange={setSelectedView}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Mensal</SelectItem>
                  <SelectItem value="week">Semanal</SelectItem>
                  <SelectItem value="day">Diário</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Widget */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2" />
              Calendário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border pointer-events-auto"
            />
            
            {/* Legend */}
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium">Legenda:</h4>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-xs">Preventiva</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-xs">Preditiva</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-xs">Corretiva</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Manutenções Programadas</CardTitle>
            <CardDescription>Lista de manutenções filtradas para visualização</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredEvents.map((event) => (
              <Dialog key={event.id}>
                <DialogTrigger asChild>
                  <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{event.title}</h4>
                      <div className="flex space-x-2">
                        <Badge className={getTypeColor(event.type)}>{event.type}</Badge>
                        <Badge className={getPriorityColor(event.priority)}>{event.priority}</Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        {new Date(event.date).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {event.time} ({event.duration})
                      </div>
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {event.technician}
                      </div>
                      <div className="flex items-center">
                        <Wrench className="w-4 h-4 mr-1" />
                        {event.equipment}
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                    </div>
                  </div>
                </DialogTrigger>
                
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{event.title}</DialogTitle>
                    <DialogDescription>Detalhes da manutenção programada</DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Equipamento</label>
                        <p className="text-sm">{event.equipment}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Tipo</label>
                        <Badge className={getTypeColor(event.type)}>{event.type}</Badge>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Data e Hora</label>
                        <p className="text-sm">{new Date(event.date).toLocaleDateString('pt-BR')} às {event.time}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Duração</label>
                        <p className="text-sm">{event.duration}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Técnico Responsável</label>
                        <p className="text-sm">{event.technician}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Prioridade</label>
                        <Badge className={getPriorityColor(event.priority)}>{event.priority}</Badge>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Status</label>
                        <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 pt-4 border-t">
                      <Button variant="outline" className="flex-1">Reagendar</Button>
                      <Button variant="outline" className="flex-1">Editar</Button>
                      <Button className="flex-1">Iniciar Manutenção</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Today's Events and Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              Manutenções de Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayEvents.length > 0 ? (
              <div className="space-y-3">
                {todayEvents.map((event) => (
                  <div key={event.id} className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{event.title}</p>
                        <p className="text-xs text-gray-600">{event.time} - {event.technician}</p>
                      </div>
                      <Badge className={getTypeColor(event.type)} className="text-xs">
                        {event.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhuma manutenção programada para hoje</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-600" />
              Próximas Manutenções
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{event.title}</p>
                      <p className="text-xs text-gray-600">
                        {new Date(event.date).toLocaleDateString('pt-BR')} - {event.technician}
                      </p>
                    </div>
                    <Badge className={getTypeColor(event.type)} className="text-xs">
                      {event.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MaintenanceCalendar;
