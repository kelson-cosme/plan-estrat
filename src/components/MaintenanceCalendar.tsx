// import React, { useState, useEffect } from "react";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Calendar } from "@/components/ui/calendar";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { Calendar as CalendarIcon, Clock, User, Wrench, AlertTriangle, CheckCircle, Filter } from "lucide-react";
// import { supabase } from "@/integrations/supabase/client";
// import { toast } from "@/hooks/use-toast";
// import { formatDateForDisplay } from "@/lib/utils";

// // Interface para nossos eventos do calendário
// interface MaintenanceEvent {
//   id: string;
//   title: string;
//   date: string;
//   time: string;
//   duration: string;
//   type: string;
//   technician: string;
//   equipment: string;
//   status: string;
//   priority: string;
//   description?: string;
//   isAutoScheduled?: boolean;
//   sourceData?: any; // Para guardar os dados originais do plano/ordem
// }

// // Props que o componente do calendário irá receber
// interface MaintenanceCalendarProps {
//   onGenerateOrder: (scheduleData: any) => void;
// }

// // Função para criar uma data local, ignorando problemas de fuso horário
// const createLocalDate = (dateString: string): Date => {
//   const [year, month, day] = dateString.split('-').map(Number);
//   return new Date(year, month - 1, day);
// };

// const MaintenanceCalendar = ({ onGenerateOrder }: MaintenanceCalendarProps) => {
//   const [date, setDate] = useState<Date | undefined>(new Date());
//   const [selectedFilter, setSelectedFilter] = useState("all");
//   const [maintenanceEvents, setMaintenanceEvents] = useState<MaintenanceEvent[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [modifiers, setModifiers] = useState<any>({});

//   const getTypeColor = (type: string) => {
//     switch (type) {
//       case "Preventiva": return "bg-green-100 text-green-800 border-green-200";
//       case "Preditiva": return "bg-blue-100 text-blue-800 border-blue-200";
//       case "Corretiva": return "bg-red-100 text-red-800 border-red-200";
//       default: return "bg-gray-100 text-gray-800 border-gray-200";
//     }
//   };

//   const getStatusColor = (status: string, isAutoScheduled?: boolean) => {
//     if (isAutoScheduled) return "bg-purple-100 text-purple-800 border-purple-200";
//     switch (status) {
//       case "Agendado": return "bg-yellow-100 text-yellow-800 border-yellow-200";
//       case "Em Andamento": return "bg-purple-100 text-purple-800 border-purple-200";
//       case "Concluído": return "bg-green-100 text-green-800 border-green-200";
//       default: return "bg-gray-100 text-gray-800 border-gray-200";
//     }
//   };

//   const getPriorityColor = (priority: string) => {
//     switch (priority) {
//       case "Crítica": return "bg-red-100 text-red-800 border-red-200";
//       case "Alta": return "bg-orange-100 text-orange-800 border-orange-200";
//       case "Média": return "bg-yellow-100 text-yellow-800 border-yellow-200";
//       case "Baixa": return "bg-blue-100 text-blue-800 border-blue-200";
//       default: return "bg-gray-100 text-gray-800 border-gray-200";
//     }
//   };

//   const fetchMaintenanceData = async () => {
//     setLoading(true);
//     try {
//       // Query 1: Ordens de Serviço (Work Orders)
//       const { data: workOrders, error: workOrdersError } = await supabase
//         .from('work_orders')
//         .select(`
//           id, title, description, type, priority, status, equipment_id, assigned_to,
//           maintenance_plan_id, scheduled_date, completed_date, estimated_hours,
//           equipment:equipment_id (id, name, code), 
//           assigned_to_profile:assigned_to (full_name)
//         `)
//         .order('scheduled_date');
//       if (workOrdersError) throw workOrdersError;

//       const workOrderEvents: MaintenanceEvent[] = (workOrders || []).map(order => ({
//         id: order.id,
//         title: order.title,
//         date: order.scheduled_date || new Date().toISOString().split('T')[0],
//         time: "08:00",
//         duration: `${order.estimated_hours || 2}h`,
//         type: order.type === 'preventiva' ? 'Preventiva' : order.type === 'preditiva' ? 'Preditiva' : 'Corretiva',
//         technician: order.assigned_to_profile?.full_name || 'Não atribuído',
//         equipment: order.equipment?.name || 'Equipamento desconhecido',
//         status: order.status === 'open' ? 'Agendado' : order.status === 'in_progress' ? 'Em Andamento' : order.status === 'completed' ? 'Concluído' : 'Cancelado',
//         priority: order.priority as 'Baixa' | 'Média' | 'Alta' | 'Crítica',
//         description: order.description,
//         isAutoScheduled: false,
//         sourceData: order
//       }));

//       // Query 2: Planos Agendados (Scheduled Plans)
//       const { data: scheduledPlans, error: schedulesError } = await supabase
//         .from('maintenance_plan_schedules')
//         .select(`
//           id, next_scheduled_date, 
//           maintenance_plans:maintenance_plan_id (
//             name, type, priority, description, tasks, frequency_days, end_date, 
//             equipment:equipment_id (id, name)
//           )
//         `)
//         .filter('maintenance_plans.active', 'eq', true);
//       if (schedulesError) throw schedulesError;

//       const scheduledEvents: MaintenanceEvent[] = [];
//       const projectionLimit = new Date();
//       projectionLimit.setMonth(projectionLimit.getMonth() + 3);

//       (scheduledPlans || []).forEach(schedule => {
//         if (!schedule.maintenance_plans || !schedule.maintenance_plans.frequency_days) return;
//         let cursorDate = createLocalDate(schedule.next_scheduled_date);
//         const planEndDate = schedule.maintenance_plans.end_date ? createLocalDate(schedule.maintenance_plans.end_date) : null;
//         const frequency = schedule.maintenance_plans.frequency_days;
//         while (cursorDate <= projectionLimit) {
//           let eventDate = new Date(cursorDate.getTime());
//           const dayOfWeek = eventDate.getDay();
//           if (dayOfWeek === 6) { eventDate.setDate(eventDate.getDate() + 2); }
//           else if (dayOfWeek === 0) { eventDate.setDate(eventDate.getDate() + 1); }
//           if (planEndDate && eventDate > planEndDate) break;
//           if (eventDate > projectionLimit) break;
//           scheduledEvents.push({
//             id: `scheduled-${schedule.id}-${eventDate.toISOString()}`,
//             title: `Plano: ${schedule.maintenance_plans.name}`,
//             date: eventDate.toISOString().split('T')[0],
//             time: 'A definir', duration: 'A definir',
//             type: schedule.maintenance_plans.type === 'preventiva' ? 'Preventiva' : 'Preditiva',
//             technician: 'Automático',
//             equipment: schedule.maintenance_plans.equipment?.name || 'N/A',
//             status: 'Agendamento Automático',
//             priority: schedule.maintenance_plans.priority as 'Baixa' | 'Média' | 'Alta' | 'Crítica',
//             description: schedule.maintenance_plans.description || (Array.isArray(schedule.maintenance_plans.tasks) ? schedule.maintenance_plans.tasks.join('\n') : ''),
//             isAutoScheduled: true,
//             sourceData: schedule,
//           });
//           cursorDate.setDate(cursorDate.getDate() + frequency);
//         }
//       });
      
//       const allEvents = [...workOrderEvents, ...scheduledEvents];
//       setMaintenanceEvents(allEvents);
      
//       const preventiveDays = allEvents.filter(e => e.type === 'Preventiva' && !e.isAutoScheduled).map(e => createLocalDate(e.date));
//       const predictiveDays = allEvents.filter(e => e.type === 'Preditiva' && !e.isAutoScheduled).map(e => createLocalDate(e.date));
//       const correctiveDays = allEvents.filter(e => e.type === 'Corretiva' && !e.isAutoScheduled).map(e => createLocalDate(e.date));
//       const autoScheduledDays = allEvents.filter(e => e.isAutoScheduled).map(e => createLocalDate(e.date));
      
//       setModifiers({
//         preventive: preventiveDays,
//         predictive: predictiveDays,
//         corrective: correctiveDays,
//         autoScheduled: autoScheduledDays,
//       });

//     } catch (error: any) {
//       console.error('Error fetching maintenance data:', error);
//       toast({ title: "Erro ao carregar dados do calendário", description: error.message, variant: "destructive" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchMaintenanceData();
//   }, []);
  
//   const selectedDayEvents = maintenanceEvents.filter(event => date && event.date === date.toISOString().split('T')[0]);

//   return (
//     <div className="space-y-6">
//       <Card>
//         <CardHeader>
//           <div className="flex justify-between items-center">
//             <div>
//               <CardTitle>Calendário de Manutenção</CardTitle>
//               <CardDescription>Visualização e gestão de cronogramas de manutenção</CardDescription>
//             </div>
//             <div className="flex space-x-2">
//               <Select value={selectedFilter} onValueChange={setSelectedFilter}>
//                 <SelectTrigger className="w-40"><Filter className="w-4 h-4 mr-2" /><SelectValue /></SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">Todos os Tipos</SelectItem>
//                   <SelectItem value="preventiva">Preventiva</SelectItem>
//                   <SelectItem value="preditiva">Preditiva</SelectItem>
//                   <SelectItem value="corretiva">Corretiva</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>
//         </CardHeader>
//       </Card>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <Card className="lg:col-span-1">
//           <CardHeader><CardTitle className="flex items-center"><CalendarIcon className="w-5 h-5 mr-2" />Calendário</CardTitle></CardHeader>
//           <CardContent>
//             <Calendar
//               mode="single"
//               selected={date}
//               onSelect={setDate}
//               modifiers={modifiers}
//               modifiersClassNames={{
//                 preventive: "bg-green-200 text-green-900 rounded-full",
//                 predictive: "bg-blue-200 text-blue-900 rounded-full",
//                 corrective: "bg-red-200 text-red-900 rounded-full",
//                 autoScheduled: "border-2 border-dashed border-purple-400 rounded-full",
//               }}
//               className="rounded-md border pointer-events-auto"
//             />
//             <div className="mt-4 space-y-2">
//               <h4 className="text-sm font-medium">Legenda:</h4>
//               <div className="space-y-1">
//                 <div className="flex items-center space-x-2"><div className="w-3 h-3 bg-green-500 rounded-full"></div><span className="text-xs">OS Preventiva</span></div>
//                 <div className="flex items-center space-x-2"><div className="w-3 h-3 bg-blue-500 rounded-full"></div><span className="text-xs">OS Preditiva</span></div>
//                 <div className="flex items-center space-x-2"><div className="w-3 h-3 bg-red-500 rounded-full"></div><span className="text-xs">OS Corretiva</span></div>
//                 <div className="flex items-center space-x-2"><div className="w-3 h-3 border-2 border-dashed border-purple-500 rounded-full"></div><span className="text-xs">Agend. Automático</span></div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="lg:col-span-2">
//           <CardHeader>
//             <CardTitle>Eventos para {date ? formatDateForDisplay(date.toISOString()) : 'Nenhuma data selecionada'}</CardTitle>
//             <CardDescription>Lista de manutenções para o dia selecionado</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4 max-h-[500px] overflow-y-auto">
//             {loading ? <p>Carregando...</p> : selectedDayEvents.length === 0 ? (
//               <div className="text-center py-8"><Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" /><p className="text-gray-600">Nenhuma manutenção para este dia</p></div>
//             ) : (
//               selectedDayEvents.map((event) => (
//                 <Dialog key={event.id}>
//                   <DialogTrigger asChild>
//                     <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
//                       <div className="flex justify-between items-start mb-2"><h4 className="font-medium">{event.title}</h4><div className="flex space-x-2"><Badge className={getTypeColor(event.type)}>{event.type}</Badge><Badge className={getPriorityColor(event.priority)}>{event.priority}</Badge></div></div>
//                       <div className="grid grid-cols-2 gap-4 text-sm text-gray-600"><div className="flex items-center"><CalendarIcon className="w-4 h-4 mr-1" />{formatDateForDisplay(event.date)}</div><div className="flex items-center"><Clock className="w-4 h-4 mr-1" />{event.time} ({event.duration})</div><div className="flex items-center"><User className="w-4 h-4 mr-1" />{event.technician}</div><div className="flex items-center"><Wrench className="w-4 h-4 mr-1" />{event.equipment}</div></div>
//                       <div className="mt-2"><Badge className={getStatusColor(event.status, event.isAutoScheduled)}>{event.status}</Badge></div>
//                     </div>
//                   </DialogTrigger>
//                   <DialogContent className="max-w-2xl">
//                     <DialogHeader><DialogTitle>{event.title}</DialogTitle><DialogDescription>Detalhes da manutenção programada</DialogDescription></DialogHeader>
//                     <div className="space-y-4">
//                       <div className="grid grid-cols-2 gap-4">
//                         <div><label className="text-sm font-medium text-gray-600">Equipamento</label><p className="text-sm">{event.equipment}</p></div>
//                         <div><label className="text-sm font-medium text-gray-600">Tipo</label><Badge className={getTypeColor(event.type)}>{event.type}</Badge></div>
//                         <div><label className="text-sm font-medium text-gray-600">Data e Hora</label><p className="text-sm">{formatDateForDisplay(event.date)} às {event.time}</p></div>
//                         <div><label className="text-sm font-medium text-gray-600">Duração</label><p className="text-sm">{event.duration}</p></div>
//                         <div><label className="text-sm font-medium text-gray-600">Técnico Responsável</label><p className="text-sm">{event.technician}</p></div>
//                         <div><label className="text-sm font-medium text-gray-600">Prioridade</label><Badge className={getPriorityColor(event.priority)}>{event.priority}</Badge></div>
//                         <div><label className="text-sm font-medium text-gray-600">Status</label><Badge className={getStatusColor(event.status, event.isAutoScheduled)}>{event.status}</Badge></div>
//                       </div>
//                       {event.description && (<div><label className="text-sm font-medium text-gray-600">Descrição</label><p className="text-sm mt-1">{event.description}</p></div>)}
//                       <div className="flex space-x-2 pt-4 border-t">
//                         {!event.isAutoScheduled && (<><Button variant="outline" className="flex-1">Reagendar</Button><Button variant="outline" className="flex-1">Editar</Button><Button className="flex-1">Iniciar Manutenção</Button></>)}
//                         {event.isAutoScheduled && (<Button variant="outline" className="flex-1" onClick={() => onGenerateOrder(event.sourceData)}>Gerar Ordem Manualmente</Button>)}
//                       </div>
//                     </div>
//                   </DialogContent>
//                 </Dialog>
//               ))
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default MaintenanceCalendar;

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar as CalendarIcon, Clock, User, Wrench, AlertTriangle, CheckCircle, Filter, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { formatDateForDisplay } from "@/lib/utils";

interface MaintenanceEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  type: string;
  technician: string;
  equipment: string;
  status: string;
  priority: string;
  description?: string;
  isAutoScheduled?: boolean;
  sourceData?: any;
}

interface MaintenanceCalendarProps {
  onGenerateOrder: (scheduleData: any) => void;
}

const createLocalDate = (dateString: string): Date => {
  if (!dateString) return new Date();
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const MaintenanceCalendar = ({ onGenerateOrder }: MaintenanceCalendarProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [maintenanceEvents, setMaintenanceEvents] = useState<MaintenanceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [modifiers, setModifiers] = useState<any>({});

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Preventiva": return "bg-green-100 text-green-800 border-green-200";
      case "Preditiva": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Corretiva": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string, isAutoScheduled?: boolean) => {
    if (isAutoScheduled) return "bg-purple-100 text-purple-800 border-purple-200";
    switch (status) {
      case "Agendado": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Em Andamento": return "bg-purple-100 text-purple-800 border-purple-200";
      case "Concluído": return "bg-green-100 text-green-800 border-green-200";
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

  useEffect(() => {
    const fetchMaintenanceData = async () => {
      setLoading(true);
      try {
        const { data: workOrders, error: workOrdersError } = await supabase.from('work_orders').select(`id, title, description, type, priority, status, equipment_id, assigned_to, maintenance_plan_id, scheduled_date, completed_date, estimated_hours, created_at, equipment:equipment_id (id, name, code), assigned_to_profile:assigned_to (full_name)`);
        if (workOrdersError) throw workOrdersError;

        const { data: scheduledPlans, error: schedulesError } = await supabase.from('maintenance_plan_schedules').select(`*, maintenance_plans:maintenance_plan_id (id, name, type, priority, description, tasks, frequency_days, end_date, required_resources, equipment:equipment_id (id, name))`).filter('maintenance_plans.active', 'eq', true);
        if (schedulesError) throw schedulesError;

        const workOrderLookup = new Set(workOrders?.filter(wo => wo.maintenance_plan_id).map(wo => `${wo.maintenance_plan_id}_${wo.scheduled_date}`));
        
        const workOrderEvents: MaintenanceEvent[] = (workOrders || []).map(order => ({
          id: order.id,
          title: order.title,
          date: order.scheduled_date || new Date().toISOString().split('T')[0],
          time: "08:00",
          duration: `${order.estimated_hours || 2}h`,
          type: order.type === 'preventiva' ? 'Preventiva' : order.type === 'preditiva' ? 'Preditiva' : 'Corretiva',
          technician: order.assigned_to_profile?.full_name || 'Não atribuído',
          equipment: order.equipment?.name || 'Equipamento desconhecido',
          status: order.status === 'open' ? 'Agendado' : order.status === 'in_progress' ? 'Em Andamento' : order.status === 'completed' ? 'Concluído' : 'Cancelado',
          priority: order.priority as string,
          description: order.description,
          isAutoScheduled: false,
          sourceData: order
        }));

        const scheduledEvents: MaintenanceEvent[] = [];
        const projectionLimit = new Date();
        projectionLimit.setMonth(projectionLimit.getMonth() + 3);

        (scheduledPlans || []).forEach(schedule => {
            if (!schedule.maintenance_plans || !schedule.maintenance_plans.frequency_days) return;
            let cursorDate = createLocalDate(schedule.next_scheduled_date);
            const planEndDate = schedule.maintenance_plans.end_date ? createLocalDate(schedule.maintenance_plans.end_date) : null;
            const frequency = schedule.maintenance_plans.frequency_days;
            
            while (cursorDate <= projectionLimit) {
                if (planEndDate && cursorDate > planEndDate) break;
                const eventDateStr = cursorDate.toISOString().split('T')[0];
                const lookupKey = `${schedule.maintenance_plans.id}_${eventDateStr}`;
                if (!workOrderLookup.has(lookupKey)) {
                    scheduledEvents.push({
                      id: `scheduled-${schedule.id}-${eventDateStr}`,
                      title: `Plano: ${schedule.maintenance_plans.name}`,
                      date: eventDateStr,
                      time: 'A definir', duration: 'A definir',
                      type: schedule.maintenance_plans.type === 'preventiva' ? 'Preventiva' : 'Preditiva',
                      technician: 'Automático',
                      equipment: schedule.maintenance_plans.equipment?.name || 'N/A',
                      status: 'Agendamento Automático',
                      priority: schedule.maintenance_plans.priority as string,
                      description: schedule.maintenance_plans.description || (Array.isArray(schedule.maintenance_plans.tasks) ? schedule.maintenance_plans.tasks.join('\n') : ''),
                      isAutoScheduled: true,
                      sourceData: { ...schedule, next_scheduled_date: eventDateStr },
                    });
                }
                cursorDate.setDate(cursorDate.getDate() + frequency);
            }
        });
        
        const allEvents = [...workOrderEvents, ...scheduledEvents];
        setMaintenanceEvents(allEvents);
        
        const preventiveDays = allEvents.filter(e => e.type === 'Preventiva' && !e.isAutoScheduled).map(e => createLocalDate(e.date));
        const predictiveDays = allEvents.filter(e => e.type === 'Preditiva' && !e.isAutoScheduled).map(e => createLocalDate(e.date));
        const correctiveDays = allEvents.filter(e => e.type === 'Corretiva' && !e.isAutoScheduled).map(e => createLocalDate(e.date));
        const autoScheduledDays = allEvents.filter(e => e.isAutoScheduled).map(e => createLocalDate(e.date));
        
      setModifiers({
        preventive: preventiveDays,
        predictive: predictiveDays,
        corrective: correctiveDays,
        autoScheduled: autoScheduledDays,
      });
      
      } catch (error: any) {
        toast({ title: "Erro ao carregar dados do calendário", description: error.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchMaintenanceData();
  }, []);
  
  const selectedDayEvents = maintenanceEvents.filter(event => date && event.date === date.toISOString().split('T')[0]);

  return (
    <div className="space-y-6">
      <Card>
          <CardHeader>
              <div className="flex justify-between items-center">
              <div>
                  <CardTitle>Calendário de Manutenção</CardTitle>
                  <CardDescription>Visualização e gestão de cronogramas de manutenção</CardDescription>
              </div>
              <div className="flex space-x-2">
                  <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                  <SelectTrigger className="w-40"><Filter className="w-4 h-4 mr-2" /><SelectValue /></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">Todos os Tipos</SelectItem>
                      <SelectItem value="preventiva">Preventiva</SelectItem>
                      <SelectItem value="preditiva">Preditiva</SelectItem>
                      <SelectItem value="corretiva">Corretiva</SelectItem>
                  </SelectContent>
                  </Select>
              </div>
              </div>
          </CardHeader>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
            <CardHeader><CardTitle className="flex items-center"><CalendarIcon className="w-5 h-5 mr-2" />Calendário</CardTitle></CardHeader>
            <CardContent>
              <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  modifiers={modifiers}
                  modifiersClassNames={{
                  preventive: "bg-green-200 text-green-900 rounded-full",
                  predictive: "bg-blue-200 text-blue-900 rounded-full",
                  corrective: "bg-red-200 text-red-900 rounded-full",
                  autoScheduled: "border-2 border-dashed border-purple-400 rounded-full",
                  }}
                  className="rounded-md border pointer-events-auto"
              />
              <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium">Legenda:</h4>
                  <div className="space-y-1">
                  <div className="flex items-center space-x-2"><div className="w-3 h-3 bg-green-500 rounded-full"></div><span className="text-xs">OS Preventiva</span></div>
                  <div className="flex items-center space-x-2"><div className="w-3 h-3 bg-blue-500 rounded-full"></div><span className="text-xs">OS Preditiva</span></div>
                  <div className="flex items-center space-x-2"><div className="w-3 h-3 bg-red-500 rounded-full"></div><span className="text-xs">OS Corretiva</span></div>
                  <div className="flex items-center space-x-2"><div className="w-3 h-3 border-2 border-dashed border-purple-500 rounded-full"></div><span className="text-xs">Agend. Automático</span></div>
                  </div>
              </div>
            </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Eventos para {date ? formatDateForDisplay(date.toISOString()) : 'Nenhuma data selecionada'}</CardTitle>
            <CardDescription>Lista de manutenções para o dia selecionado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[500px] overflow-y-auto">
            {loading ? <div className="flex justify-center items-center py-8"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div> : selectedDayEvents.length === 0 ? (
              <div className="text-center py-8"><Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" /><p className="text-gray-600">Nenhuma manutenção para este dia</p></div>
            ) : (
              selectedDayEvents.map((event) => (
                <Dialog key={event.id}>
                  <DialogTrigger asChild>
                    <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="flex justify-between items-start mb-2"><h4 className="font-medium">{event.title}</h4><div className="flex space-x-2"><Badge className={getTypeColor(event.type)}>{event.type}</Badge><Badge className={getPriorityColor(event.priority)}>{event.priority}</Badge></div></div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600"><div className="flex items-center"><CalendarIcon className="w-4 h-4 mr-1" />{formatDateForDisplay(event.date)}</div><div className="flex items-center"><Clock className="w-4 h-4 mr-1" />{event.time} ({event.duration})</div><div className="flex items-center"><User className="w-4 h-4 mr-1" />{event.technician}</div><div className="flex items-center"><Wrench className="w-4 h-4 mr-1" />{event.equipment}</div></div>
                      <div className="mt-2"><Badge className={getStatusColor(event.status, event.isAutoScheduled)}>{event.status}</Badge></div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader><DialogTitle>{event.title}</DialogTitle><DialogDescription>Detalhes da manutenção programada</DialogDescription></DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-sm font-medium text-gray-600">Equipamento</label><p className="text-sm">{event.equipment}</p></div>
                        <div><label className="text-sm font-medium text-gray-600">Tipo</label><Badge className={getTypeColor(event.type)}>{event.type}</Badge></div>
                        <div><label className="text-sm font-medium text-gray-600">Data e Hora</label><p className="text-sm">{formatDateForDisplay(event.date)} às {event.time}</p></div>
                        <div><label className="text-sm font-medium text-gray-600">Duração</label><p className="text-sm">{event.duration}</p></div>
                        <div><label className="text-sm font-medium text-gray-600">Técnico Responsável</label><p className="text-sm">{event.technician}</p></div>
                        <div><label className="text-sm font-medium text-gray-600">Prioridade</label><Badge className={getPriorityColor(event.priority)}>{event.priority}</Badge></div>
                        <div><label className="text-sm font-medium text-gray-600">Status</label><Badge className={getStatusColor(event.status, event.isAutoScheduled)}>{event.status}</Badge></div>
                      </div>
                      {event.description && (<div><label className="text-sm font-medium text-gray-600">Descrição</label><p className="text-sm mt-1 whitespace-pre-wrap">{event.description}</p></div>)}
                      <div className="flex space-x-2 pt-4 border-t">
                        {!event.isAutoScheduled && (<><Button variant="outline" className="flex-1">Reagendar</Button><Button variant="outline" className="flex-1">Editar</Button><Button className="flex-1">Iniciar Manutenção</Button></>)}
                        {event.isAutoScheduled && (
                            <DialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => onGenerateOrder(event.sourceData)}
                                >
                                    Gerar Ordem de Serviço
                                </Button>
                            </DialogTrigger>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MaintenanceCalendar;