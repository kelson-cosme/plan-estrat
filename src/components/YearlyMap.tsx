// src/components/YearlyMap.tsx

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { useEquipment, Equipment } from '@/hooks/useEquipment';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface DowntimeData {
  id?: string;
  equipment_id: string;
  year: number;
  week_number: number;
  stop_type?: string | null;
  reason?: string | null;
  status?: string | null;
}

const YearlyMap = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [downtimeData, setDowntimeData] = useState<DowntimeData[]>([]);
  const { equipment, loading: loadingEquipment } = useEquipment();
  const [loadingMap, setLoadingMap] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<DowntimeData | null>(null);

  // NOVO: Definição dos cabeçalhos dos meses
  const monthHeaders = [
    { name: 'Janeiro', colSpan: 4 },   // Semanas 1-4
    { name: 'Fevereiro', colSpan: 4 }, // Semanas 5-8
    { name: 'Março', colSpan: 5 },     // Semanas 9-13 (Fecha Q1)
    { name: 'Abril', colSpan: 4 },     // Semanas 14-17
    { name: 'Maio', colSpan: 4 },      // Semanas 18-21
    { name: 'Junho', colSpan: 5 },     // Semanas 22-26 (Fecha Q2)
    { name: 'Julho', colSpan: 4 },     // Semanas 27-30
    { name: 'Agosto', colSpan: 5 },    // Semanas 31-35
    { name: 'Setembro', colSpan: 4 },  // Semanas 36-39 (Fecha Q3)
    { name: 'Outubro', colSpan: 4 },   // Semanas 40-43
    { name: 'Novembro', colSpan: 4 },  // Semanas 44-47
    { name: 'Dezembro', colSpan: 5 },  // Semanas 48-52 (Fecha Q4)
  ];


  const fetchDowntimeData = async (selectedYear: number) => {
    setLoadingMap(true);
    try {
      const { data, error } = await supabase
        .from('yearly_downtime_map')
        .select('id, equipment_id, year, week_number, stop_type, reason, status')
        .eq('year', selectedYear);

      if (error) {
        throw error;
      }
      setDowntimeData((data as DowntimeData[]) || []);
    } catch (error: any) {
      toast({ title: "Erro ao carregar dados do mapa", description: error.message, variant: "destructive" });
    } finally {
      setLoadingMap(false);
    }
  };

  useEffect(() => {
    fetchDowntimeData(year);
  }, [year]);

  const handleCellClick = (eq: Equipment, week: number) => {
    const existingDowntime = downtimeData.find(d => d.equipment_id === eq.id && d.week_number === week);
    setSelectedCell(existingDowntime || { equipment_id: eq.id, year, week_number: week });
    setIsDialogOpen(true);
  };

  const handleSaveDowntime = async () => {
    if (!selectedCell) return;
    
    if (!selectedCell.reason && !selectedCell.stop_type && !selectedCell.id) {
        setIsDialogOpen(false);
        return;
    }
    
    const { id, ...upsertData } = selectedCell;

    try {
      const { error } = await supabase.from('yearly_downtime_map').upsert(upsertData, {
        onConflict: 'equipment_id, year, week_number'
      });
      if (error) throw error;
      toast({ title: "Parada salva com sucesso!" });
      fetchDowntimeData(year);
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({ title: "Erro ao salvar parada", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteDowntime = async () => {
    if (!selectedCell || !selectedCell.id) return;

    try {
      const { error } = await supabase
        .from('yearly_downtime_map')
        .delete()
        .eq('id', selectedCell.id);
        
      if (error) throw error;

      toast({ title: "Parada removida com sucesso!" });
      fetchDowntimeData(year);
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({ title: "Erro ao remover parada", description: error.message, variant: "destructive" });
    }
  };
  
  const getCellColor = (stop_type?: string | null, status?: string | null) => {
    if (stop_type === 'planned') {
      return status === 'confirmed' ? 'bg-blue-500' : 'bg-blue-300';
    }
    if (stop_type === 'unplanned') {
      return status === 'confirmed' ? 'bg-red-500' : 'bg-red-300';
    }
    return 'bg-gray-100 hover:bg-gray-200';
  };
  
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Mapa Anual de 52 Semanas</CardTitle>
            <CardDescription>Planeamento de paradas de equipamentos ao longo do ano.</CardDescription>
          </div>
          <div className="w-32">
            <Select value={String(year)} onValueChange={(value) => setYear(Number(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {(loadingEquipment || loadingMap) ? (
          <div className="flex justify-center items-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              {/* NOVO CABEÇALHO COM MESES E SEMANAS */}
              <thead>
                <tr>
                  <th
                    rowSpan={2}
                    className="sticky left-0 z-20 bg-gray-200 border p-2 font-semibold text-left align-middle"
                  >
                    Equipamento
                  </th>
                  {monthHeaders.map((month) => (
                    <th
                      key={month.name}
                      colSpan={month.colSpan}
                      className="border p-2 font-semibold text-center bg-gray-100"
                    >
                      {month.name}
                    </th>
                  ))}
                </tr>
                <tr>
                  {Array.from({ length: 52 }, (_, i) => i + 1).map(week => (
                    <th key={week} className="border p-2 font-semibold min-w-[40px] bg-gray-50">{week}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {equipment.map(eq => (
                  <tr key={eq.id}>
                    <td className="sticky left-0 z-10 bg-white border p-2 font-medium text-gray-800 whitespace-nowrap">{eq.name}</td>
                    {Array.from({ length: 52 }, (_, i) => i + 1).map(week => {
                      const downtime = downtimeData.find(d => d.equipment_id === eq.id && d.week_number === week);
                      return (
                        <td key={week} className="border p-0 text-center">
                          <TooltipProvider delayDuration={300}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  className={`w-full h-8 block transition-colors ${getCellColor(downtime?.stop_type, downtime?.status)}`}
                                  onClick={() => handleCellClick(eq, week)}
                                />
                              </TooltipTrigger>
                              {downtime && (
                                <TooltipContent>
                                  <p><strong>Tipo:</strong> {downtime.stop_type || 'N/A'}</p>
                                  <p><strong>Status:</strong> {downtime.status || 'N/A'}</p>
                                  <p><strong>Motivo:</strong> {downtime.reason || 'N/A'}</p>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedCell && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registar Parada - Semana {selectedCell.week_number}</DialogTitle>
                <DialogDescription>
                  Equipamento: {equipment.find(e => e.id === selectedCell.equipment_id)?.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="stop_type">Tipo de Parada</Label>
                  <Select value={selectedCell.stop_type || ""} onValueChange={(value) => setSelectedCell({ ...selectedCell, stop_type: value })}>
                    <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planejada</SelectItem>
                      <SelectItem value="unplanned">Não Planejada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={selectedCell.status || ""} onValueChange={(value) => setSelectedCell({ ...selectedCell, status: value })}>
                    <SelectTrigger><SelectValue placeholder="Selecione o status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tentative">Agendado</SelectItem>
                      <SelectItem value="confirmed">Confirmada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Motivo/Descrição</Label>
                  <Textarea
                    id="reason"
                    value={selectedCell.reason || ""}
                    onChange={(e) => setSelectedCell({ ...selectedCell, reason: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  {selectedCell?.id && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">Remover Parada</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Tem a certeza?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isto irá remover permanentemente o registo de parada para esta semana.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteDowntime}>Confirmar Remoção</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleSaveDowntime}>Salvar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default YearlyMap;