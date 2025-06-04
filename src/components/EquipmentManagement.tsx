
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Settings, Wrench, AlertTriangle, CheckCircle, Edit, Trash2 } from "lucide-react";

const EquipmentManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");

  const equipment = [
    {
      id: "EQ-001",
      name: "Compressor de Ar Principal",
      type: "Compressor",
      location: "Setor A",
      status: "Operacional",
      criticality: "Alta",
      lastMaintenance: "15/05/2024",
      nextMaintenance: "15/08/2024",
      mtbf: "2,340h",
      mttr: "4.2h",
      availability: 96.5
    },
    {
      id: "EQ-002", 
      name: "Motor Elétrico 001",
      type: "Motor",
      location: "Setor B",
      status: "Manutenção",
      criticality: "Média",
      lastMaintenance: "10/06/2024",
      nextMaintenance: "10/09/2024",
      mtbf: "1,890h",
      mttr: "6.1h",
      availability: 94.2
    },
    {
      id: "EQ-003",
      name: "Bomba Hidráulica 102",
      type: "Bomba",
      location: "Setor C",
      status: "Parado",
      criticality: "Alta",
      lastMaintenance: "05/06/2024",
      nextMaintenance: "05/07/2024",
      mtbf: "1,560h",
      mttr: "8.5h",
      availability: 89.8
    },
    {
      id: "EQ-004",
      name: "Transformador Principal",
      type: "Transformador",
      location: "Subestação",
      status: "Operacional",
      criticality: "Crítica",
      lastMaintenance: "01/05/2024",
      nextMaintenance: "01/11/2024",
      mtbf: "4,200h",
      mttr: "12.3h",
      availability: 98.7
    },
    {
      id: "EQ-005",
      name: "Esteira Transportadora 01",
      type: "Esteira",
      location: "Setor A",
      status: "Operacional",
      criticality: "Baixa",
      lastMaintenance: "20/05/2024",
      nextMaintenance: "20/07/2024",
      mtbf: "1,200h",
      mttr: "3.2h",
      availability: 92.1
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Operacional": return "bg-green-100 text-green-800 border-green-200";
      case "Manutenção": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Parado": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case "Crítica": return "bg-red-100 text-red-800 border-red-200";
      case "Alta": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Média": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Baixa": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredEquipment = equipment.filter(eq => 
    eq.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedLocation === "all" || eq.location === selectedLocation)
  );

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Gestão de Equipamentos</CardTitle>
              <CardDescription>Controle e monitoramento de ativos industriais</CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Equipamento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Cadastrar Novo Equipamento</DialogTitle>
                  <DialogDescription>
                    Adicione um novo equipamento ao sistema de manutenção
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="equipment-name">Nome do Equipamento</Label>
                    <Input id="equipment-name" placeholder="Ex: Compressor de Ar 001" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="equipment-type">Tipo</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compressor">Compressor</SelectItem>
                        <SelectItem value="motor">Motor</SelectItem>
                        <SelectItem value="bomba">Bomba</SelectItem>
                        <SelectItem value="transformador">Transformador</SelectItem>
                        <SelectItem value="esteira">Esteira</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Localização</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a localização" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="setor-a">Setor A</SelectItem>
                        <SelectItem value="setor-b">Setor B</SelectItem>
                        <SelectItem value="setor-c">Setor C</SelectItem>
                        <SelectItem value="subestacao">Subestação</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="criticality">Criticidade</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a criticidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critica">Crítica</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="baixa">Baixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea id="description" placeholder="Descrição detalhada do equipamento..." />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline">Cancelar</Button>
                  <Button>Salvar Equipamento</Button>
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
                placeholder="Buscar equipamentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por localização" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as localizações</SelectItem>
                <SelectItem value="Setor A">Setor A</SelectItem>
                <SelectItem value="Setor B">Setor B</SelectItem>
                <SelectItem value="Setor C">Setor C</SelectItem>
                <SelectItem value="Subestação">Subestação</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEquipment.map((eq) => (
          <Card key={eq.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{eq.name}</CardTitle>
                  <CardDescription>{eq.id} • {eq.type}</CardDescription>
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
                <Badge className={getStatusColor(eq.status)}>{eq.status}</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Criticidade:</span>
                <Badge className={getCriticalityColor(eq.criticality)}>{eq.criticality}</Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Localização:</span>
                <span className="text-sm font-medium">{eq.location}</span>
              </div>

              <div className="space-y-3 pt-3 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Disponibilidade:</span>
                  <span className="font-medium">{eq.availability}%</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">MTBF:</span>
                  <span className="font-medium">{eq.mtbf}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">MTTR:</span>
                  <span className="font-medium">{eq.mttr}</span>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Última Manutenção:</span>
                  <span className="font-medium">{eq.lastMaintenance}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Próxima Manutenção:</span>
                  <span className="font-medium text-blue-600">{eq.nextMaintenance}</span>
                </div>
              </div>

              <div className="flex space-x-2 pt-3">
                <Button variant="outline" size="sm" className="flex-1">
                  <Wrench className="w-4 h-4 mr-1" />
                  Manutenção
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Settings className="w-4 h-4 mr-1" />
                  Detalhes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEquipment.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum equipamento encontrado</h3>
            <p className="text-gray-600">Tente ajustar seus filtros de busca ou adicione um novo equipamento.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EquipmentManagement;
