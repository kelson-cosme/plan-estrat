
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Play, Settings } from "lucide-react";
import { useMaintenancePlansData } from "@/hooks/useMaintenancePlansData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const MaintenanceScheduler = () => {
  const { initializeAllSchedules, generateScheduledOrders } = useMaintenancePlansData();

  // Fetch schedule data
  const { data: schedules = [], refetch: refetchSchedules } = useQuery({
    queryKey: ['maintenance_schedules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_plan_schedules')
        .select(`
          *,
          maintenance_plans:maintenance_plan_id (
            id,
            name,
            type,
            frequency_days,
            active,
            equipment:equipment_id (
              name
            )
          )
        `)
        .order('next_scheduled_date');
      
      if (error) throw error;
      return data || [];
    }
  });

  const handleInitializeSchedules = async () => {
    const success = await initializeAllSchedules();
    if (success) {
      refetchSchedules();
    }
  };

  const handleGenerateOrders = async () => {
    const success = await generateScheduledOrders();
    if (success) {
      refetchSchedules();
    }
  };

  const getFrequencyLabel = (days: number) => {
    switch (days) {
      case 1: return "Diária";
      case 7: return "Semanal";
      case 15: return "Quinzenal";
      case 30: return "Mensal";
      case 365: return "Anual";
      default: return `${days} dias`;
    }
  };

  const getStatusColor = (date: string) => {
    const today = new Date();
    const scheduleDate = new Date(date);
    const diffDays = Math.ceil((scheduleDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (diffDays < 0) return "bg-red-100 text-red-800 border-red-200";
    if (diffDays === 0) return "bg-orange-100 text-orange-800 border-orange-200";
    if (diffDays <= 7) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-green-100 text-green-800 border-green-200";
  };

  const getStatusText = (date: string) => {
    const today = new Date();
    const scheduleDate = new Date(date);
    const diffDays = Math.ceil((scheduleDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (diffDays < 0) return "Atrasado";
    if (diffDays === 0) return "Hoje";
    if (diffDays === 1) return "Amanhã";
    if (diffDays <= 7) return `${diffDays} dias`;
    return "Futuro";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Agendamentos Automáticos</CardTitle>
              <CardDescription>
                Gerencie os agendamentos automáticos dos planos de manutenção
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline"
                onClick={handleInitializeSchedules}
              >
                <Settings className="w-4 h-4 mr-2" />
                Inicializar Agendamentos
              </Button>
              <Button 
                onClick={handleGenerateOrders}
              >
                <Play className="w-4 h-4 mr-2" />
                Gerar Ordens Agendadas
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{schedules.length}</p>
              <p className="text-sm text-gray-600">Total Agendamentos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {schedules.filter(s => {
                  const today = new Date();
                  const scheduleDate = new Date(s.next_scheduled_date);
                  return scheduleDate < today;
                }).length}
              </p>
              <p className="text-sm text-gray-600">Atrasados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {schedules.filter(s => {
                  const today = new Date();
                  const scheduleDate = new Date(s.next_scheduled_date);
                  return scheduleDate.toDateString() === today.toDateString();
                }).length}
              </p>
              <p className="text-sm text-gray-600">Hoje</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {schedules.filter(s => {
                  const today = new Date();
                  const scheduleDate = new Date(s.next_scheduled_date);
                  const diffDays = Math.ceil((scheduleDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
                  return diffDays > 0 && diffDays <= 7;
                }).length}
              </p>
              <p className="text-sm text-gray-600">Próximos 7 dias</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedules List */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Agendamentos</CardTitle>
          <CardDescription>Lista de agendamentos automáticos configurados</CardDescription>
        </CardHeader>
        <CardContent>
          {schedules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum agendamento encontrado</h3>
              <p className="text-gray-600">Clique em "Inicializar Agendamentos" para configurar os agendamentos automáticos.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {schedules.map((schedule: any) => (
                <div key={schedule.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {schedule.maintenance_plans?.name || "Plano não encontrado"}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {schedule.maintenance_plans?.equipment?.name || "Sem equipamento"} • 
                      {schedule.maintenance_plans?.type || "Tipo não definido"}
                    </p>
                    {schedule.maintenance_plans?.frequency_days && (
                      <p className="text-xs text-gray-500">
                        Frequência: {getFrequencyLabel(schedule.maintenance_plans.frequency_days)}
                      </p>
                    )}
                  </div>
                  <div className="text-right space-y-2">
                    <Badge className={getStatusColor(schedule.next_scheduled_date)}>
                      {getStatusText(schedule.next_scheduled_date)}
                    </Badge>
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {new Date(schedule.next_scheduled_date).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    {schedule.last_generated_date && (
                      <div className="text-xs text-gray-500">
                        Último: {new Date(schedule.last_generated_date).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceScheduler;
