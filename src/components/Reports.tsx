import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Download, Share, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon, Calendar, Filter, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { differenceInHours, format, getYear, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Reports = () => {
  const [activeTab, setActiveTab] = useState("equipment");
  const [selectedPeriod, setSelectedPeriod] = useState("last-year");
  const [selectedChart, setSelectedChart] = useState("bar");

  // --- CONSTANTES DE CUSTO SIMULADO ---
  const HOURLY_LABOR_COST = 75; // Custo de R$75 por hora de mão de obra
  const SIMULATED_PART_COST = 50; // Custo simulado de R$50 por peça/recurso

  // --- BUSCA DE DADOS REAIS DO SUPABASE ---
  const { data: workOrders = [], isLoading: isLoadingWorkOrders } = useQuery({
    queryKey: ['reportsWorkOrders'],
    queryFn: async () => {
      const { data, error } = await supabase.from('work_orders').select(`*, equipment:equipment_id(id, name, location, installation_date, created_at)`);
      if (error) {
        console.error('Error fetching work orders for reports:', error);
        return [];
      }
      return data;
    }
  });

  const { data: equipmentList = [], isLoading: isLoadingEquipment } = useQuery({
    queryKey: ['reportsEquipment'],
    queryFn: async () => {
      const { data, error } = await supabase.from('equipment').select('id, name, installation_date, created_at');
      if (error) {
        console.error('Error fetching equipment for reports:', error);
        return [];
      }
      return data;
    }
  });

  // --- DADOS PROCESSADOS PARA GRÁFICOS ---

  // Cálculo dos Indicadores de Confiabilidade (MTBF, MTTR, Disponibilidade)
  const equipmentPerformanceData = useMemo(() => {
    if (!equipmentList.length || !workOrders.length) return [];
    return equipmentList.map(equipment => {
      const correctiveOrders = workOrders.filter(
        wo => wo.equipment_id === equipment.id && wo.type === 'corretiva' && wo.status === 'completed' && wo.completed_date && wo.actual_hours
      ).sort((a, b) => new Date(a.completed_date!).getTime() - new Date(b.completed_date!).getTime());
      const repairs = correctiveOrders.length;
      if (repairs === 0) return { equipment: equipment.name, mtbf: 0, mttr: 0, availability: 100, repairs: 0 };
      const totalRepairHours = correctiveOrders.reduce((sum, wo) => sum + (wo.actual_hours || 0), 0);
      const mttr = totalRepairHours / repairs;
      let totalOperationalHours = 0;
      if (repairs > 1) {
        for (let i = 1; i < correctiveOrders.length; i++) {
          const previousRepairDate = new Date(correctiveOrders[i - 1].completed_date!);
          const currentRepairDate = new Date(correctiveOrders[i].completed_date!);
          totalOperationalHours += differenceInHours(currentRepairDate, previousRepairDate);
        }
      } else {
        const installDate = new Date(equipment.installation_date || equipment.created_at);
        const failureDate = new Date(correctiveOrders[0].completed_date!);
        totalOperationalHours = differenceInHours(failureDate, installDate);
      }
      const mtbf = totalOperationalHours > 0 ? totalOperationalHours / repairs : 0;
      const availability = mtbf && mttr ? (mtbf / (mtbf + mttr)) * 100 : 100;
      return {
        equipment: equipment.name,
        mtbf: Math.round(mtbf),
        mttr: parseFloat(mttr.toFixed(2)),
        availability: parseFloat(availability.toFixed(2)),
        repairs: repairs,
      };
    });
  }, [equipmentList, workOrders]);

  // Histórico de Manutenções e Custos por Mês
  const { maintenanceHistoryData, maintenanceCostData } = useMemo(() => {
    const currentYear = getYear(new Date());
    const history: { [key: string]: { month: string; preventiva: number; corretiva: number; preditiva: number } } = {};
    const costs: { [key: string]: { month: string; preventiva: number; corretiva: number; preditiva: number } } = {};
    const months = Array.from({ length: 12 }, (_, i) => format(new Date(currentYear, i, 1), 'MMM', { locale: ptBR }));

    months.forEach(month => {
      history[month] = { month, preventiva: 0, corretiva: 0, preditiva: 0 };
      costs[month] = { month, preventiva: 0, corretiva: 0, preditiva: 0 };
    });

    workOrders.forEach(wo => {
      if (wo.created_at && getYear(parseISO(wo.created_at)) === currentYear) {
        const month = format(parseISO(wo.created_at), 'MMM', { locale: ptBR });
        if (history[month]) {
          const laborCost = (wo.actual_hours || 0) * HOURLY_LABOR_COST;
          const resources = Array.isArray(wo.used_resources) ? wo.used_resources : [];
          const partsCost = resources.length * SIMULATED_PART_COST;
          const totalCost = laborCost + partsCost;

          if (wo.type === 'preventiva') {
            history[month].preventiva++;
            costs[month].preventiva += totalCost;
          }
          if (wo.type === 'corretiva') {
            history[month].corretiva++;
            costs[month].corretiva += totalCost;
          }
          if (wo.type === 'preditiva') {
            history[month].preditiva++;
            costs[month].preditiva += totalCost;
          }
        }
      }
    });

    return { maintenanceHistoryData: Object.values(history), maintenanceCostData: Object.values(costs) };
  }, [workOrders]);

  // Dados de Custo por Equipamento e Composição
  const { costByEquipmentData, costCompositionData } = useMemo(() => {
    const equipmentCosts: { [key: string]: number } = {};
    let totalLaborCost = 0;
    let totalPartsCost = 0;

    workOrders.forEach(wo => {
      if (!wo.equipment_id) return;
      const laborCost = (wo.actual_hours || 0) * HOURLY_LABOR_COST;
      const resources = Array.isArray(wo.used_resources) ? wo.used_resources : [];
      const partsCost = resources.length * SIMULATED_PART_COST;
      
      totalLaborCost += laborCost;
      totalPartsCost += partsCost;
      
      const totalCost = laborCost + partsCost;
      equipmentCosts[wo.equipment_id] = (equipmentCosts[wo.equipment_id] || 0) + totalCost;
    });

    const costByEquipment = Object.entries(equipmentCosts).map(([equipmentId, cost]) => {
      const equipment = equipmentList.find(e => e.id === equipmentId);
      return {
        name: equipment ? equipment.name : 'Desconhecido',
        value: cost
      };
    }).sort((a, b) => b.value - a.value).slice(0, 5); // Top 5 mais custosos

    const totalCost = totalLaborCost + totalPartsCost;
    const costComposition = [
        { name: 'Mão de Obra', value: totalCost > 0 ? Math.round((totalLaborCost / totalCost) * 100) : 0, color: '#3B82F6' },
        { name: 'Peças', value: totalCost > 0 ? Math.round((totalPartsCost / totalCost) * 100) : 0, color: '#10B981' },
    ];

    return { costByEquipmentData: costByEquipment, costCompositionData: costComposition };
  }, [workOrders, equipmentList]);

  // Dados de Falhas por Setor
  const failurePerSectorData = useMemo(() => {
    const sectorFailures: { [key: string]: { sector: string; failures: number; hours: number } } = {};
    const correctiveOrders = workOrders.filter(wo => wo.type === 'corretiva' && wo.equipment?.location);

    correctiveOrders.forEach(wo => {
      const sector = wo.equipment!.location!;
      if (!sectorFailures[sector]) {
        sectorFailures[sector] = { sector, failures: 0, hours: 0 };
      }
      sectorFailures[sector].failures++;
      sectorFailures[sector].hours += wo.actual_hours || 0;
    });

    return Object.values(sectorFailures);
  }, [workOrders]);

  // Dados de Tipo de Manutenção (usando workOrders reais)
  const maintenanceTypeData = useMemo(() => {
    const preventiveCount = workOrders.filter(order => order.type === 'preventiva').length;
    const predictiveCount = workOrders.filter(order => order.type === 'preditiva').length;
    const correctiveCount = workOrders.filter(order => order.type === 'corretiva').length;
    const total = preventiveCount + predictiveCount + correctiveCount;
    if (total === 0) return [{ name: "Nenhum dado", value: 100, color: "#CCCCCC" }];
    return [
      { name: "Preventiva", value: Math.round((preventiveCount / total) * 100), color: "#10B981" },
      { name: "Preditiva", value: Math.round((predictiveCount / total) * 100), color: "#3B82F6" },
      { name: "Corretiva", value: Math.round((correctiveCount / total) * 100), color: "#EF4444" },
    ];
  }, [workOrders]);

  const availabilityTrendData = useMemo(() => {
    const monthlyAvailability: { [key: string]: { totalAvailability: number, count: number } } = {};
  
    equipmentPerformanceData.forEach(eq => {
      const month = format(new Date(), 'MMM', { locale: ptBR });
      if (!monthlyAvailability[month]) {
        monthlyAvailability[month] = { totalAvailability: 0, count: 0 };
      }
      monthlyAvailability[month].totalAvailability += eq.availability;
      monthlyAvailability[month].count++;
    });
  
    return Object.entries(monthlyAvailability).map(([month, data]) => ({
      month,
      availability: data.count > 0 ? parseFloat((data.totalAvailability / data.count).toFixed(2)) : 0,
    }));
  }, [equipmentPerformanceData]);
  

  const getMTBFColor = (mtbf: number) => { if (mtbf >= 3000) return "text-green-600"; if (mtbf >= 2000) return "text-blue-600"; if (mtbf >= 1000) return "text-yellow-600"; return "text-red-600"; };
  const getMTTRColor = (mttr: number) => { if (mttr <= 4) return "text-green-600"; if (mttr <= 6) return "text-blue-600"; if (mttr <= 8) return "text-yellow-600"; return "text-red-600"; };
  const getAvailabilityColor = (availability: number) => { if (availability >= 95) return "text-green-600"; if (availability >= 90) return "text-blue-600"; if (availability >= 85) return "text-yellow-600"; return "text-red-600"; };

  if (isLoadingWorkOrders || isLoadingEquipment) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2 mx-auto" />
          <p>Carregando dados dos relatórios...</p>
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
              <CardTitle>Relatórios e Análises</CardTitle>
              <CardDescription>Métricas e indicadores de desempenho da manutenção</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-40">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last-month">Último Mês</SelectItem>
                  <SelectItem value="last-quarter">Último Trimestre</SelectItem>
                  <SelectItem value="last-year">Último Ano</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline"><Download className="w-4 h-4 mr-2" />Exportar</Button>
              <Button variant="outline"><Share className="w-4 h-4 mr-2" />Compartilhar</Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Report Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="equipment" className="flex items-center space-x-2"><BarChart3 className="w-4 h-4" /><span>Equipamentos</span></TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center space-x-2"><PieChartIcon className="w-4 h-4" /><span>Manutenções</span></TabsTrigger>
          <TabsTrigger value="costs" className="flex items-center space-x-2"><LineChartIcon className="w-4 h-4" /><span>Custos</span></TabsTrigger>
          <TabsTrigger value="failures" className="flex items-center space-x-2"><BarChart3 className="w-4 h-4" /><span>Falhas</span></TabsTrigger>
        </TabsList>

        {/* Equipment Performance Report */}
        <TabsContent value="equipment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Desempenho dos Equipamentos</CardTitle>
              <CardDescription>Análise de disponibilidade e confiabilidade</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end space-x-2 mb-4">
                <Button variant={selectedChart === "bar" ? "default" : "outline"} size="sm" onClick={() => setSelectedChart("bar")}><BarChart3 className="w-4 h-4 mr-1" />Barras</Button>
                <Button variant={selectedChart === "line" ? "default" : "outline"} size="sm" onClick={() => setSelectedChart("line")}><LineChartIcon className="w-4 h-4 mr-1" />Linha</Button>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  {selectedChart === "bar" ? (
                    <BarChart data={equipmentPerformanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="equipment" /><YAxis /><Tooltip /><Legend /><Bar dataKey="availability" name="Disponibilidade (%)" fill="#3B82F6" /><Bar dataKey="repairs" name="Reparos" fill="#EF4444" />
                    </BarChart>
                  ) : (
                    <LineChart data={equipmentPerformanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="equipment" /><YAxis /><Tooltip /><Legend /><Line type="monotone" dataKey="availability" name="Disponibilidade (%)" stroke="#3B82F6" strokeWidth={2} /><Line type="monotone" dataKey="repairs" name="Reparos" stroke="#EF4444" strokeWidth={2} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Indicadores de Confiabilidade</CardTitle>
              <CardDescription>MTBF, MTTR e Disponibilidade por Equipamento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b"><th className="text-left py-3 px-4">Equipamento</th><th className="text-center py-3 px-4">MTBF (horas)</th><th className="text-center py-3 px-4">MTTR (horas)</th><th className="text-center py-3 px-4">Disponibilidade</th><th className="text-center py-3 px-4">Reparos</th></tr></thead>
                  <tbody>
                    {equipmentPerformanceData.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}><td className="py-3 px-4">{item.equipment}</td><td className={`text-center py-3 px-4 ${getMTBFColor(item.mtbf)} font-medium`}>{item.mtbf}h</td><td className={`text-center py-3 px-4 ${getMTTRColor(item.mttr)} font-medium`}>{item.mttr}h</td><td className={`text-center py-3 px-4 ${getAvailabilityColor(item.availability)} font-medium`}>{item.availability}%</td><td className="text-center py-3 px-4">{item.repairs}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Types Report */}
        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Manutenções</CardTitle>
              <CardDescription>Porcentagem de manutenções por tipo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={maintenanceTypeData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                        {maintenanceTypeData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className="text-lg font-medium mb-4">Análise de Distribuição</h3>
                  <div className="space-y-6">
                    <div className="space-y-2"><div className="flex items-center justify-between"><div className="flex items-center"><div className="w-4 h-4 bg-green-500 rounded-sm mr-2"></div><span>Manutenção Preventiva</span></div><span className="font-bold">{maintenanceTypeData.find(d => d.name === "Preventiva")?.value || 0}%</span></div><p className="text-sm text-gray-600">Foco em manutenções planejadas, prevenindo falhas antes que ocorram.</p></div>
                    <div className="space-y-2"><div className="flex items-center justify-between"><div className="flex items-center"><div className="w-4 h-4 bg-blue-500 rounded-sm mr-2"></div><span>Manutenção Preditiva</span></div><span className="font-bold">{maintenanceTypeData.find(d => d.name === "Preditiva")?.value || 0}%</span></div><p className="text-sm text-gray-600">Monitoramento baseado em condições para predizer necessidades.</p></div>
                    <div className="space-y-2"><div className="flex items-center justify-between"><div className="flex items-center"><div className="w-4 h-4 bg-red-500 rounded-sm mr-2"></div><span>Manutenção Corretiva</span></div><span className="font-bold">{maintenanceTypeData.find(d => d.name === "Corretiva")?.value || 0}%</span></div><p className="text-sm text-gray-600">Reparos após falhas, indicando eficiência das outras estratégias.</p></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Tendência de Disponibilidade</CardTitle><CardDescription>Evolução da disponibilidade dos equipamentos</CardDescription></CardHeader>
              <CardContent>
                <div className="h-80"><ResponsiveContainer width="100%" height="100%"><LineChart data={availabilityTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis domain={[90, 100]} /><Tooltip /><Line type="monotone" dataKey="availability" name="Disponibilidade (%)" stroke="#10B981" strokeWidth={2} /></LineChart></ResponsiveContainer></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Histórico de Manutenções</CardTitle><CardDescription>Manutenções realizadas por período</CardDescription></CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={maintenanceHistoryData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Legend />
                      <Bar dataKey="preventiva" name="Preventivas" fill="#10B981" stackId="a" />
                      <Bar dataKey="preditiva" name="Preditivas" fill="#3B82F6" stackId="a" />
                      <Bar dataKey="corretiva" name="Corretivas" fill="#EF4444" stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="costs" className="space-y-6">
            <Card>
                <CardHeader>
                <CardTitle>Custos de Manutenção</CardTitle>
                <CardDescription>Análise financeira dos investimentos em manutenção</CardDescription>
                </CardHeader>
                <CardContent>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={maintenanceCostData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} /><Legend />
                        <Bar dataKey="preventiva" name="Preventiva" fill="#10B981" />
                        <Bar dataKey="corretiva" name="Corretiva" fill="#EF4444" />
                        <Bar dataKey="preditiva" name="Preditiva" fill="#3B82F6" />
                    </BarChart>
                    </ResponsiveContainer>
                </div>
                </CardContent>
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                <CardHeader>
                    <CardTitle>Composição de Custos</CardTitle>
                    <CardDescription>Divisão dos custos por categorias</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                    {costCompositionData.map(item => (
                        <div key={item.name}>
                        <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">{item.name}</span>
                            <span className="text-sm font-medium">{item.value}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="h-2 rounded-full" style={{ width: `${item.value}%`, backgroundColor: item.color }}></div>
                        </div>
                        </div>
                    ))}
                    </div>
                </CardContent>
                </Card>
                <Card>
                <CardHeader>
                    <CardTitle>Custos por Equipamento</CardTitle>
                    <CardDescription>Comparação dos 5 equipamentos mais custosos</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={costByEquipmentData} margin={{ top: 10, right: 30, left: 80, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" /><XAxis type="number" tickFormatter={(value) => `R$ ${value/1000}k`} /><YAxis dataKey="name" type="category" width={80} /><Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} /><Bar dataKey="value" name="Custo" fill="#3B82F6" />
                        </BarChart>
                    </ResponsiveContainer>
                    </div>
                </CardContent>
                </Card>
            </div>
            </TabsContent>

        <TabsContent value="failures" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Falhas por Setor</CardTitle>
              <CardDescription>Distribuição de falhas corretivas e horas de parada por localização</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={failurePerSectorData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="sector" /><YAxis /><Tooltip /><Legend />
                    <Bar dataKey="failures" name="Quantidade de Falhas" fill="#EF4444" />
                    <Bar dataKey="hours" name="Horas de Inatividade" fill="#F59E0B" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Causas Raiz de Falhas</CardTitle>
                <CardDescription>Principais razões de falhas identificadas (simulado)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={[ { name: "Desgaste Natural", value: 35, color: "#3B82F6" }, { name: "Falha Operacional", value: 25, color: "#EF4444" }, { name: "Falta de Manutenção", value: 20, color: "#F59E0B" }, { name: "Defeito de Fabricação", value: 12, color: "#8B5CF6" }, { name: "Outros", value: 8, color: "#6B7280" } ]} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                        {maintenanceTypeData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Falhas por Componente</CardTitle>
                <CardDescription>Componentes com maior incidência de falhas (simulado)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div><div className="flex justify-between mb-1"><span className="text-sm font-medium">Rolamentos</span><span className="text-sm font-medium">18 falhas</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: "90%" }}></div></div></div>
                  <div><div className="flex justify-between mb-1"><span className="text-sm font-medium">Selos Mecânicos</span><span className="text-sm font-medium">12 falhas</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: "60%" }}></div></div></div>
                  <div><div className="flex justify-between mb-1"><span className="text-sm font-medium">Correia de Transmissão</span><span className="text-sm font-medium">9 falhas</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: "45%" }}></div></div></div>
                  <div><div className="flex justify-between mb-1"><span className="text-sm font-medium">Válvulas</span><span className="text-sm font-medium">7 falhas</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: "35%" }}></div></div></div>
                  <div><div className="flex justify-between mb-1"><span className="text-sm font-medium">Sensores</span><span className="text-sm font-medium">5 falhas</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: "25%" }}></div></div></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;