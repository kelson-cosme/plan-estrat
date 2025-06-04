
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Download, Share, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon, Calendar, Filter } from "lucide-react";

const Reports = () => {
  const [activeTab, setActiveTab] = useState("equipment");
  const [selectedPeriod, setSelectedPeriod] = useState("last-month");
  const [selectedChart, setSelectedChart] = useState("bar");

  const equipmentPerformanceData = [
    { equipment: "Compressor AR-001", mtbf: 2340, mttr: 4.2, availability: 98.5, repairs: 5 },
    { equipment: "Motor EL-205", mtbf: 1890, mttr: 6.1, availability: 94.2, repairs: 8 },
    { equipment: "Bomba HY-102", mtbf: 1560, mttr: 8.5, availability: 89.8, repairs: 12 },
    { equipment: "Transformador TR-204", mtbf: 4200, mttr: 12.3, availability: 98.7, repairs: 2 },
    { equipment: "Esteira TR-01", mtbf: 1200, mttr: 3.2, availability: 92.1, repairs: 7 }
  ];

  const maintenanceTypeData = [
    { name: "Preventiva", value: 65, color: "#10B981" },
    { name: "Preditiva", value: 20, color: "#3B82F6" },
    { name: "Corretiva", value: 15, color: "#EF4444" },
  ];

  const maintenanceCostData = [
    { month: "Jan", preventiva: 15000, corretiva: 8000, preditiva: 5000 },
    { month: "Fev", preventiva: 14000, corretiva: 9500, preditiva: 4200 },
    { month: "Mar", preventiva: 16500, corretiva: 7800, preditiva: 6000 },
    { month: "Abr", preventiva: 15800, corretiva: 5400, preditiva: 5800 },
    { month: "Mai", preventiva: 17200, corretiva: 6300, preditiva: 7000 },
    { month: "Jun", preventiva: 16000, corretiva: 4800, preditiva: 8500 },
  ];

  const failurePerSectorData = [
    { sector: "Setor A", failures: 15, hours: 48 },
    { sector: "Setor B", failures: 8, hours: 32 },
    { sector: "Setor C", failures: 12, hours: 56 },
    { sector: "Subestação", failures: 3, hours: 24 },
  ];

  const availabilityTrendData = [
    { month: "Jan", availability: 94.5 },
    { month: "Fev", availability: 93.8 },
    { month: "Mar", availability: 95.2 },
    { month: "Abr", availability: 96.1 },
    { month: "Mai", availability: 95.8 },
    { month: "Jun", availability: 97.2 },
  ];

  const getMTBFColor = (mtbf: number) => {
    if (mtbf >= 3000) return "text-green-600";
    if (mtbf >= 2000) return "text-blue-600";
    if (mtbf >= 1000) return "text-yellow-600";
    return "text-red-600";
  };

  const getMTTRColor = (mttr: number) => {
    if (mttr <= 4) return "text-green-600";
    if (mttr <= 6) return "text-blue-600";
    if (mttr <= 8) return "text-yellow-600";
    return "text-red-600";
  };

  const getAvailabilityColor = (availability: number) => {
    if (availability >= 95) return "text-green-600";
    if (availability >= 90) return "text-blue-600";
    if (availability >= 85) return "text-yellow-600";
    return "text-red-600";
  };

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
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button variant="outline">
                <Share className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Report Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="equipment" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Equipamentos</span>
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center space-x-2">
            <PieChartIcon className="w-4 h-4" />
            <span>Manutenções</span>
          </TabsTrigger>
          <TabsTrigger value="costs" className="flex items-center space-x-2">
            <LineChartIcon className="w-4 h-4" />
            <span>Custos</span>
          </TabsTrigger>
          <TabsTrigger value="failures" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Falhas</span>
          </TabsTrigger>
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
                <Button 
                  variant={selectedChart === "bar" ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setSelectedChart("bar")}
                >
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Barras
                </Button>
                <Button 
                  variant={selectedChart === "line" ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setSelectedChart("line")}
                >
                  <LineChartIcon className="w-4 h-4 mr-1" />
                  Linha
                </Button>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  {selectedChart === "bar" ? (
                    <BarChart
                      data={equipmentPerformanceData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="equipment" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="availability" name="Disponibilidade (%)" fill="#3B82F6" />
                      <Bar dataKey="repairs" name="Reparos" fill="#EF4444" />
                    </BarChart>
                  ) : (
                    <LineChart
                      data={equipmentPerformanceData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="equipment" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="availability" name="Disponibilidade (%)" stroke="#3B82F6" strokeWidth={2} />
                      <Line type="monotone" dataKey="repairs" name="Reparos" stroke="#EF4444" strokeWidth={2} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Equipment MTBF & MTTR Table */}
          <Card>
            <CardHeader>
              <CardTitle>Indicadores de Confiabilidade</CardTitle>
              <CardDescription>MTBF, MTTR e Disponibilidade por Equipamento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Equipamento</th>
                      <th className="text-center py-3 px-4">MTBF (horas)</th>
                      <th className="text-center py-3 px-4">MTTR (horas)</th>
                      <th className="text-center py-3 px-4">Disponibilidade</th>
                      <th className="text-center py-3 px-4">Reparos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {equipmentPerformanceData.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                        <td className="py-3 px-4">{item.equipment}</td>
                        <td className={`text-center py-3 px-4 ${getMTBFColor(item.mtbf)} font-medium`}>{item.mtbf}h</td>
                        <td className={`text-center py-3 px-4 ${getMTTRColor(item.mttr)} font-medium`}>{item.mttr}h</td>
                        <td className={`text-center py-3 px-4 ${getAvailabilityColor(item.availability)} font-medium`}>{item.availability}%</td>
                        <td className="text-center py-3 px-4">{item.repairs}</td>
                      </tr>
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
                      <Pie
                        data={maintenanceTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {maintenanceTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className="text-lg font-medium mb-4">Análise de Distribuição</h3>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-green-500 rounded-sm mr-2"></div>
                          <span>Manutenção Preventiva</span>
                        </div>
                        <span className="font-bold">65%</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Foco em manutenções planejadas, prevenindo falhas antes que ocorram.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-blue-500 rounded-sm mr-2"></div>
                          <span>Manutenção Preditiva</span>
                        </div>
                        <span className="font-bold">20%</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Monitoramento baseado em condições para predizer necessidades.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-red-500 rounded-sm mr-2"></div>
                          <span>Manutenção Corretiva</span>
                        </div>
                        <span className="font-bold">15%</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Reparos após falhas, indicando eficiência das outras estratégias.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tendência de Disponibilidade</CardTitle>
                <CardDescription>Evolução da disponibilidade dos equipamentos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={availabilityTrendData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[90, 100]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="availability" name="Disponibilidade (%)" stroke="#10B981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Histórico de Manutenções</CardTitle>
                <CardDescription>Manutenções realizadas por período</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={maintenanceCostData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
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

        {/* Maintenance Costs Report */}
        <TabsContent value="costs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Custos de Manutenção</CardTitle>
              <CardDescription>Análise financeira dos investimentos em manutenção</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={maintenanceCostData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
                    <Legend />
                    <Bar dataKey="preventiva" name="Preventiva" fill="#10B981" />
                    <Bar dataKey="corretiva" name="Corretiva" fill="#EF4444" />
                    <Bar dataKey="preditiva" name="Preditiva" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Cost Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Composição de Custos</CardTitle>
                <CardDescription>Divisão dos custos por categorias</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Mão de Obra</span>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "45%" }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Peças e Componentes</span>
                      <span className="text-sm font-medium">30%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: "30%" }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Ferramentas e Equipamentos</span>
                      <span className="text-sm font-medium">15%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{ width: "15%" }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Serviços Terceirizados</span>
                      <span className="text-sm font-medium">10%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-600 h-2 rounded-full" style={{ width: "10%" }}></div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium mb-2">Resumo Financeiro</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Custo Total (Último Mês):</span>
                      <span className="font-medium">R$ 124.500,00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Custo Médio por Equipamento:</span>
                      <span className="font-medium">R$ 4.980,00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Custo por Hora de Manutenção:</span>
                      <span className="font-medium">R$ 185,00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Variação vs. Mês Anterior:</span>
                      <span className="font-medium text-green-600">-5%</span>
                    </div>
                  </div>
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
                    <BarChart
                      layout="vertical"
                      data={[
                        { name: "Bomba HY-102", value: 28500 },
                        { name: "Compressor AR-001", value: 24200 },
                        { name: "Motor EL-205", value: 18700 },
                        { name: "Transformador TR-204", value: 12800 },
                        { name: "Esteira TR-01", value: 9600 }
                      ]}
                      margin={{ top: 10, right: 30, left: 80, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tickFormatter={(value) => `R$ ${value/1000}k`} />
                      <YAxis dataKey="name" type="category" width={80} />
                      <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
                      <Bar dataKey="value" name="Custo" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Failures Analysis Report */}
        <TabsContent value="failures" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Falhas</CardTitle>
              <CardDescription>Distribuição de falhas por setor e impacto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={failurePerSectorData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="sector" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
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
                <CardDescription>Principais razões de falhas identificadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Desgaste Natural", value: 35, color: "#3B82F6" },
                          { name: "Falha Operacional", value: 25, color: "#EF4444" },
                          { name: "Falta de Manutenção", value: 20, color: "#F59E0B" },
                          { name: "Defeito de Fabricação", value: 12, color: "#8B5CF6" },
                          { name: "Outros", value: 8, color: "#6B7280" }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {maintenanceTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
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
                <CardDescription>Componentes com maior incidência de falhas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Rolamentos</span>
                      <span className="text-sm font-medium">18 falhas</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "90%" }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Selos Mecânicos</span>
                      <span className="text-sm font-medium">12 falhas</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "60%" }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Correia de Transmissão</span>
                      <span className="text-sm font-medium">9 falhas</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "45%" }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Válvulas</span>
                      <span className="text-sm font-medium">7 falhas</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "35%" }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Sensores</span>
                      <span className="text-sm font-medium">5 falhas</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "25%" }}></div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium mb-2">Impactos e Mitigações</h4>
                  <ul className="space-y-2 text-sm list-disc pl-5">
                    <li>Implementação de rota de inspeção para rolamentos</li>
                    <li>Substituição preventiva de selos mecânicos a cada 6 meses</li>
                    <li>Verificação semanal de tensão de correias de transmissão</li>
                    <li>Implementação de programa de calibração de válvulas</li>
                    <li>Verificação mensal de todos os sensores críticos</li>
                  </ul>
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
