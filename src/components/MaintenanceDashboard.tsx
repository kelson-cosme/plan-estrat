import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { AlertTriangle, CheckCircle, Clock, Wrench, TrendingUp, TrendingDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const MaintenanceDashboard = () => {
  // Fetch equipment data
  const { data: equipment = [] } = useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment')
        .select('*');
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch work orders data
  const { data: workOrders = [] } = useQuery({
    queryKey: ['work_orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_orders')
        .select('*');
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch maintenance plans data
  const { data: maintenancePlans = [] } = useQuery({
    queryKey: ['maintenance_plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_plans')
        .select('*');
      if (error) throw error;
      return data || [];
    }
  });

  // Calculate equipment status based on real data
  const equipmentStatus = [
    { 
      name: "Operacional", 
      value: Math.round((equipment.filter(eq => eq.status === 'active').length / Math.max(equipment.length, 1)) * 100), 
      color: "#10B981" 
    },
    { 
      name: "Manutenção", 
      value: Math.round((equipment.filter(eq => eq.status === 'maintenance').length / Math.max(equipment.length, 1)) * 100), 
      color: "#F59E0B" 
    },
    { 
      name: "Parado", 
      value: Math.round((equipment.filter(eq => eq.status === 'inactive').length / Math.max(equipment.length, 1)) * 100), 
      color: "#EF4444" 
    },
  ];

  // Filter critical equipment (maintenance status or high criticality)
  const criticalAlerts = equipment
    .filter(eq => eq.status === 'maintenance' || eq.criticality === 'critical')
    .slice(0, 3)
    .map((eq, index) => ({
      id: index + 1,
      equipment: eq.name,
      issue: eq.status === 'maintenance' ? 'Em manutenção' : 'Equipamento crítico',
      priority: eq.criticality === 'critical' ? 'Alta' : 'Média',
      time: '2h ago'
    }));

  // Get upcoming maintenance (work orders)
  const upcomingMaintenance = workOrders
    .filter(wo => wo.status === 'open' || wo.status === 'in_progress')
    .slice(0, 3)
    .map((wo, index) => ({
      id: wo.id,
      equipment: equipment.find(eq => eq.id === wo.equipment_id)?.name || 'Equipamento não encontrado',
      type: wo.type === 'preventiva' ? 'Preventiva' : wo.type === 'preditiva' ? 'Preditiva' : 'Corretiva',
      date: wo.scheduled_date ? new Date(wo.scheduled_date).toLocaleDateString('pt-BR') : 'Não agendado',
      technician: 'Técnico Responsável'
    }));

  // Calculate real monthly data from work orders
  const monthlyData = React.useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentYear = new Date().getFullYear();
    
    // Initialize monthly counts
    const monthlyStats = months.map(month => ({
      month,
      preventiva: 0,
      corretiva: 0,
      preditiva: 0
    }));

    // Count work orders by month and type
    workOrders.forEach(wo => {
      if (wo.created_at) {
        const date = new Date(wo.created_at);
        if (date.getFullYear() === currentYear) {
          const monthIndex = date.getMonth();
          const monthData = monthlyStats[monthIndex];
          
          // CORREÇÃO: Comparar com as strings em português
          if (wo.type === 'preventiva') { 
            monthData.preventiva++;
          } else if (wo.type === 'corretiva') { 
            monthData.corretiva++;
          } else if (wo.type === 'preditiva') { 
            monthData.preditiva++;
          }
        }
      }
    });

    return monthlyStats;
  }, [workOrders]);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Equipamentos</p>
                <p className="text-2xl font-bold">{equipment.length}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span className="text-sm">Equipamentos cadastrados</span>
                </div>
              </div>
              <Wrench className="w-12 h-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Ordens de Serviço</p>
                <p className="text-2xl font-bold">{workOrders.length}</p>
                <div className="flex items-center mt-2">
                  <Clock className="w-4 h-4 mr-1" />
                  <span className="text-sm">Total de ordens</span>
                </div>
              </div>
              <CheckCircle className="w-12 h-12 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Planos de Manutenção</p>
                <p className="text-2xl font-bold">{maintenancePlans.length}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span className="text-sm">Planos ativos</span>
                </div>
              </div>
              <TrendingUp className="w-12 h-12 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Equipamentos Críticos</p>
                <p className="text-2xl font-bold">{equipment.filter(eq => eq.criticality === 'critical').length}</p>
                <div className="flex items-center mt-2">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  <span className="text-sm">Requer atenção</span>
                </div>
              </div>
              <AlertTriangle className="w-12 h-12 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maintenance Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tendência de Manutenções</CardTitle>
            <CardDescription>Ordens de serviço criadas por mês e tipo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="preventiva" fill="#10B981" name="Preventiva" />
                <Bar dataKey="corretiva" fill="#EF4444" name="Corretiva" />
                <Bar dataKey="preditiva" fill="#3B82F6" name="Preditiva" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Equipment Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status dos Equipamentos</CardTitle>
            <CardDescription>Distribuição atual do status operacional</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={equipmentStatus}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {equipmentStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
              Alertas Críticos
            </CardTitle>
            <CardDescription>Equipamentos que requerem atenção imediata</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {criticalAlerts.length > 0 ? (
                criticalAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                    <div>
                      <p className="font-medium text-gray-900">{alert.equipment}</p>
                      <p className="text-sm text-gray-600">{alert.issue}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={alert.priority === "Alta" ? "destructive" : "secondary"}>
                        {alert.priority}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <p>Nenhum alerta crítico no momento</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Maintenance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
              Próximas Manutenções
            </CardTitle>
            <CardDescription>Manutenções programadas para os próximos dias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingMaintenance.length > 0 ? (
                upcomingMaintenance.map((maintenance) => (
                  <div key={maintenance.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <div>
                      <p className="font-medium text-gray-900">{maintenance.equipment}</p>
                      <p className="text-sm text-gray-600">Técnico: {maintenance.technician}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {maintenance.type}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">{maintenance.date}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                  <p>Nenhuma manutenção programada</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Acesso rápido às funcionalidades principais</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button className="h-20 flex-col space-y-2">
              <Wrench className="w-6 h-6" />
              <span>Nova Ordem</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <CheckCircle className="w-6 h-6" />
              <span>Plano Preventivo</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <AlertTriangle className="w-6 h-6" />
              <span>Relatório Falha</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <TrendingUp className="w-6 h-6" />
              <span>Análise KPI</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceDashboard;