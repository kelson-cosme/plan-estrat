import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Settings, Wrench, Edit, Trash2, List, LayoutGrid } from "lucide-react";
import { useEquipment } from "@/hooks/useEquipment";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useViewMode } from "@/contexts/ViewModeContext";

interface EquipmentFormData {
  name: string;
  code: string;
  type: string;
  location: string;
  manufacturer: string;
  model: string;
  criticality: 'low' | 'medium' | 'high' | 'critical';
  installation_date: string;
  status: 'active' | 'inactive' | 'maintenance' | 'retired';
}

const EquipmentManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const { viewMode, setViewMode } = useViewMode();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);
  const { equipment, loading, refetch } = useEquipment();
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<EquipmentFormData>();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 border-green-200";
      case "maintenance": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "inactive": return "bg-red-100 text-red-800 border-red-200";
      case "retired": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case "critical": return "bg-red-100 text-red-800 border-red-200";
      case "high": return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredEquipment = equipment.filter(eq =>
    eq.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedLocation === "all" || eq.location === selectedLocation)
  );

  const onSubmit = async (data: EquipmentFormData) => {
    try {
      const { error } = await supabase
        .from('equipment')
        .insert([{
          name: data.name,
          code: data.code,
          type: data.type,
          location: data.location,
          manufacturer: data.manufacturer,
          model: data.model,
          criticality: data.criticality,
          installation_date: data.installation_date || null,
          status: 'active'
        }]);

      if (error) {
        throw error;
      }

      toast({
        title: "Equipamento cadastrado",
        description: "O equipamento foi cadastrado com sucesso!",
      });

      reset();
      setIsDialogOpen(false);
      refetch();
    } catch (error: any) {
      console.error('Error creating equipment:', error);
      toast({
        title: "Erro ao cadastrar equipamento",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const onEditSubmit = async (data: EquipmentFormData) => {
    if (!selectedEquipment) return;

    try {
      const { error } = await supabase
        .from('equipment')
        .update({
          name: data.name,
          code: data.code,
          type: data.type,
          location: data.location,
          manufacturer: data.manufacturer,
          model: data.model,
          criticality: data.criticality,
          installation_date: data.installation_date || null,
          status: data.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedEquipment.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Equipamento atualizado",
        description: "O equipamento foi atualizado com sucesso!",
      });

      setIsEditDialogOpen(false);
      setSelectedEquipment(null);
      refetch();
    } catch (error: any) {
      console.error('Error updating equipment:', error);
      toast({
        title: "Erro ao atualizar equipamento",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (eq: any) => {
    setSelectedEquipment(eq);
    setValue("name", eq.name);
    setValue("code", eq.code);
    setValue("type", eq.type);
    setValue("location", eq.location || "");
    setValue("manufacturer", eq.manufacturer || "");
    setValue("model", eq.model || "");
    setValue("criticality", eq.criticality);
    setValue("status", eq.status);
    setValue("installation_date", eq.installation_date || "");
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "Equipamento excluído",
        description: "O equipamento foi excluído com sucesso!",
      });

      refetch();
    } catch (error: any) {
      console.error('Error deleting equipment:', error);
      toast({
        title: "Erro ao excluir equipamento",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleMaintenance = (eq: any) => {
    toast({
      title: "Manutenção solicitada",
      description: `Solicitação de manutenção criada para ${eq.name}`,
    });
  };

  const handleDetails = (eq: any) => {
    setSelectedEquipment(eq);
    setIsDetailsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
            <div className="flex items-center space-x-2">
            <ToggleGroup type="single" value={viewMode} onValueChange={(value) => { if (value) setViewMode(value as any) }} aria-label="Visualização">
                <ToggleGroupItem value="card" aria-label="Visualização em Card">
                  <LayoutGrid className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="list" aria-label="Visualização em Lista">
                  <List className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome do Equipamento*</Label>
                      <Input
                        id="name"
                        placeholder="Ex: Compressor de Ar 001"
                        {...register("name", { required: true })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="code">Código*</Label>
                      <Input
                        id="code"
                        placeholder="Ex: EQ-001"
                        {...register("code", { required: true })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Tipo*</Label>
                      <Select onValueChange={(value) => setValue("type", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="compressor">Compressor</SelectItem>
                          <SelectItem value="motor">Motor</SelectItem>
                          <SelectItem value="bomba">Bomba</SelectItem>
                          <SelectItem value="transformador">Transformador</SelectItem>
                          <SelectItem value="esteira">Esteira</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Localização</Label>
                      <Input
                        id="location"
                        placeholder="Ex: Setor A"
                        {...register("location")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="manufacturer">Fabricante</Label>
                      <Input
                        id="manufacturer"
                        placeholder="Ex: Siemens"
                        {...register("manufacturer")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model">Modelo</Label>
                      <Input
                        id="model"
                        placeholder="Ex: XYZ-123"
                        {...register("model")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="criticality">Criticidade*</Label>
                      <Select onValueChange={(value) => setValue("criticality", value as any)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a criticidade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical">Crítica</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="medium">Média</SelectItem>
                          <SelectItem value="low">Baixa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="installation_date">Data de Instalação</Label>
                      <Input
                        id="installation_date"
                        type="date"
                        {...register("installation_date")}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Salvar Equipamento</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            </div>
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

      {/* Equipment Grid / List */}
      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEquipment.map((eq) => (
            <Card key={eq.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{eq.name}</CardTitle>
                    <CardDescription>{eq.code} • {eq.type}</CardDescription>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(eq)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o equipamento "{eq.name}"? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(eq.id)}>
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge className={getStatusColor(eq.status)}>
                    {eq.status === 'active' ? 'Ativo' :
                     eq.status === 'maintenance' ? 'Manutenção' :
                     eq.status === 'inactive' ? 'Inativo' : 'Aposentado'}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Criticidade:</span>
                  <Badge className={getCriticalityColor(eq.criticality)}>
                    {eq.criticality === 'critical' ? 'Crítica' :
                     eq.criticality === 'high' ? 'Alta' :
                     eq.criticality === 'medium' ? 'Média' : 'Baixa'}
                  </Badge>
                </div>

                {eq.location && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Localização:</span>
                    <span className="text-sm font-medium">{eq.location}</span>
                  </div>
                )}

                {eq.manufacturer && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Fabricante:</span>
                    <span className="text-sm font-medium">{eq.manufacturer}</span>
                  </div>
                )}

                {eq.model && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Modelo:</span>
                    <span className="text-sm font-medium">{eq.model}</span>
                  </div>
                )}

                <div className="flex space-x-2 pt-3">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleMaintenance(eq)}>
                    <Wrench className="w-4 h-4 mr-1" />
                    Manutenção
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDetails(eq)}>
                    <Settings className="w-4 h-4 mr-1" />
                    Detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Nome</th>
                  <th className="text-left py-3 px-4">Código</th>
                  <th className="text-left py-3 px-4">Tipo</th>
                  <th className="text-left py-3 px-4">Localização</th>
                  <th className="text-center py-3 px-4">Status</th>
                  <th className="text-center py-3 px-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredEquipment.map((eq) => (
                  <tr key={eq.id} className="border-b">
                    <td className="py-3 px-4">{eq.name}</td>
                    <td className="py-3 px-4">{eq.code}</td>
                    <td className="py-3 px-4">{eq.type}</td>
                    <td className="py-3 px-4">{eq.location}</td>
                    <td className="text-center py-3 px-4">
                      <Badge className={getStatusColor(eq.status)}>
                        {eq.status === 'active' ? 'Ativo' :
                         eq.status === 'maintenance' ? 'Manutenção' :
                         eq.status === 'inactive' ? 'Inativo' : 'Aposentado'}
                      </Badge>
                    </td>
                    <td className="text-center py-3 px-4 flex items-center justify-center space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(eq)}><Edit className="w-4 h-4" /></Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm"><Trash2 className="w-4 h-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                    <AlertDialogDescription>
                                    Tem certeza que deseja excluir o equipamento "{eq.name}"? Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(eq.id)}>Excluir</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Edit Equipment Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Equipamento</DialogTitle>
            <DialogDescription>
              Atualize as informações do equipamento
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome do Equipamento*</Label>
                <Input
                  id="edit-name"
                  placeholder="Ex: Compressor de Ar 001"
                  {...register("name", { required: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-code">Código*</Label>
                <Input
                  id="edit-code"
                  placeholder="Ex: EQ-001"
                  {...register("code", { required: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">Tipo*</Label>
                <Select value={watch("type")} onValueChange={(value) => setValue("type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compressor">Compressor</SelectItem>
                    <SelectItem value="motor">Motor</SelectItem>
                    <SelectItem value="bomba">Bomba</SelectItem>
                    <SelectItem value="transformador">Transformador</SelectItem>
                    <SelectItem value="esteira">Esteira</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status*</Label>
                <Select value={watch("status")} onValueChange={(value) => setValue("status", value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="maintenance">Manutenção</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="retired">Aposentado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-location">Localização</Label>
                <Input
                  id="edit-location"
                  placeholder="Ex: Setor A"
                  {...register("location")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-manufacturer">Fabricante</Label>
                <Input
                  id="edit-manufacturer"
                  placeholder="Ex: Siemens"
                  {...register("manufacturer")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-model">Modelo</Label>
                <Input
                  id="edit-model"
                  placeholder="Ex: XYZ-123"
                  {...register("model")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-criticality">Criticidade*</Label>
                <Select value={watch("criticality")} onValueChange={(value) => setValue("criticality", value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a criticidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Crítica</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-installation_date">Data de Instalação</Label>
                <Input
                  id="edit-installation_date"
                  type="date"
                  {...register("installation_date")}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Atualizar Equipamento</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Equipment Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Equipamento</DialogTitle>
            <DialogDescription>
              Informações completas do equipamento
            </DialogDescription>
          </DialogHeader>
          {selectedEquipment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Nome</Label>
                  <p className="text-sm">{selectedEquipment.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Código</Label>
                  <p className="text-sm">{selectedEquipment.code}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Tipo</Label>
                  <p className="text-sm">{selectedEquipment.type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <Badge className={getStatusColor(selectedEquipment.status)}>
                    {selectedEquipment.status === 'active' ? 'Ativo' :
                     selectedEquipment.status === 'maintenance' ? 'Manutenção' :
                     selectedEquipment.status === 'inactive' ? 'Inativo' : 'Aposentado'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Criticidade</Label>
                  <Badge className={getCriticalityColor(selectedEquipment.criticality)}>
                    {selectedEquipment.criticality === 'critical' ? 'Crítica' :
                     selectedEquipment.criticality === 'high' ? 'Alta' :
                     selectedEquipment.criticality === 'medium' ? 'Média' : 'Baixa'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Localização</Label>
                  <p className="text-sm">{selectedEquipment.location || 'Não informado'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Fabricante</Label>
                  <p className="text-sm">{selectedEquipment.manufacturer || 'Não informado'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Modelo</Label>
                  <p className="text-sm">{selectedEquipment.model || 'Não informado'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Data de Instalação</Label>
                  <p className="text-sm">{selectedEquipment.installation_date ? new Date(selectedEquipment.installation_date).toLocaleDateString('pt-BR') : 'Não informado'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Criado em</Label>
                  <p className="text-sm">{new Date(selectedEquipment.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={() => setIsDetailsDialogOpen(false)}>
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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