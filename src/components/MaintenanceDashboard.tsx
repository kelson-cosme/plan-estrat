
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { AlertTriangle, CheckCircle, Clock, Wrench, TrendingUp, TrendingDown } from "lucide-react";

const MaintenanceDashboard = () => {
  const monthlyData = [
    { month: "Jan", preventiva: 45, corretiva: 12, preditiva: 8 },
    { month: "Fev", preventiva: 52, corretiva: 8, preditiva: 12 },
    { month: "Mar", preventiva: 48, corretiva: 15, preditiva: 10 },
    { month: "Abr", preventiva: 61, corretiva: 6, preditiva: 14 },
    { month: "Mai", preventiva: 55, corretiva: 10, preditiva: 16 },
    { month: "Jun", preventiva: 67, corretiva: 4, preditiva: 18 },
  ];

  const equipmentStatus = [
    { name: "Operacional", value: 85, color: "#10B981" },
    { name: "Manutenção", value: 10, color: "#F59E0B" },
    { name: "Parado", value: 5, color: "#EF4444" },
  ];

  const criticalAlerts = [
    { id: 1, equipment: "Compressor AR-001", issue: "Temperatura alta", priority: "Alta", time: "2h ago" },
    { id: 2, equipment: "Motor EL-205", issue: "Vibração excessiva", priority: "Média", time: "4h ago" },
    { id: 3, equipment: "Bomba HY-102", issue: "Pressão baixa", priority: "Alta", time: "6h ago" },
  ];

  const upcomingMaintenance = [
    { id: 1, equipment: "Turbina GT-001", type: "Preventiva", date: "Amanhã", technician: "João Silva" },
    { id: 2, equipment: "Gerador GE-301", type: "Preditiva", date: "15/06", technician: "Maria Santos" },
    { id: 3, equipment: "Transformador TR-204", type: "Preventiva", date: "18/06", technician: "Pedro Costa" },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">MTBF Médio</p>
                <p className="text-2xl font-bold">2,340h</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span className="text-sm">+12% vs mês anterior</span>
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
                <p className="text-green-100">MTTR Médio</p>
                <p className="text-2xl font-bold">4.2h</p>
                <div className="flex items-center mt-2">
                  <TrendingDown className="w-4 h-4 mr-1" />
                  <span className="text-sm">-8% vs mês anterior</span>
                </div>
              </div>
              <Clock className="w-12 h-12 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">OEE Geral</p>
                <p className="text-2xl font-bold">87.5%</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span className="text-sm">+3.2% vs mês anterior</span>
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
                <p className="text-orange-100">Custo/Mês</p>
                <p className="text-2xl font-bold">R$ 124k</p>
                <div className="flex items-center mt-2">
                  <TrendingDown className="w-4 h-4 mr-1" />
                  <span className="text-sm">-5% vs mês anterior</span>
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
            <CardDescription>Distribuição mensal por tipo de manutenção</CardDescription>
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
              {criticalAlerts.map((alert) => (
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
              ))}
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
              {upcomingMaintenance.map((maintenance) => (
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
              ))}
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
