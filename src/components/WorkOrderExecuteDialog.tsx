import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { WorkOrder } from "@/hooks/useWorkOrders";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface WorkOrderExecuteDialogProps {
  order: WorkOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onExecute: (orderId: string, data: { actual_hours?: number; description?: string; completed_date: string; status: string }) => Promise<any>;
  createFollowUpOrder: (orderData: any) => Promise<any>;
}

const WorkOrderExecuteDialog = ({ order, isOpen, onClose, onExecute, createFollowUpOrder }: WorkOrderExecuteDialogProps) => {
  const [actualHours, setActualHours] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<Record<number, boolean>>({});
  
  // NOVO: Estados para controlar o diálogo de tarefas pendentes
  const [isFollowUpDialogOpen, setIsFollowUpDialogOpen] = useState(false);
  const [pendingTasksState, setPendingTasksState] = useState<string[]>([]);
  const [followUpScheduleDate, setFollowUpScheduleDate] = useState('');


  const tasks = useMemo(() => {
    if (!order?.description) return [];
    const parts = order.description.split('--- Tarefas ---');
    if (parts.length < 2) return [];
    return parts[1].trim().split('\n').map(task => task.replace(/^- /, ''));
  }, [order]);

  useEffect(() => {
    if (order) {
      setActualHours(order.actual_hours?.toString() || "");
      setNotes("");
      setCompletedTasks({});
      setFollowUpScheduleDate('');
      setPendingTasksState([]);
    }
  }, [order]);

  const handleTaskToggle = (index: number) => {
    setCompletedTasks(prev => ({ ...prev, [index]: !prev[index] }));
  };

  // NOVO: Função que decide qual diálogo abrir
  const handleConcludeClick = () => {
    const pending = tasks.filter((_, index) => !completedTasks[index]);
    if (pending.length > 0) {
      setPendingTasksState(pending);
      setIsFollowUpDialogOpen(true); // Abre o diálogo de agendamento de pendências
    } else {
      // Se não há pendências, abre o alerta simples de confirmação
      // O botão dentro do AlertDialogTrigger já fará isso.
      return;
    }
  };

  // NOVO: Função para lidar com a conclusão COM criação de ordem pendente
  const handleExecuteWithFollowUp = async () => {
    if (!order || pendingTasksState.length === 0) return;
    setLoading(true);

    // 1. Criar a nova ordem de serviço para tarefas pendentes
    await createFollowUpOrder({
      title: `Pendências da OS: ${order.title}`,
      type: order.type,
      description: `Esta OS foi criada para completar as tarefas pendentes da ordem de serviço original ID: ${order.id}.\n\n--- Tarefas ---\n${pendingTasksState.map(task => `- ${task}`).join('\n')}`,
      priority: 'high',
      status: 'open',
      equipment_id: order.equipment_id,
      maintenance_plan_id: order.maintenance_plan_id,
      scheduled_date: followUpScheduleDate || undefined, // Usa a data agendada
    });
    toast({ title: "Ordem de pendências criada", description: `Agendada para ${followUpScheduleDate ? new Date(followUpScheduleDate).toLocaleDateString('pt-BR') : 'imediatamente'}.` });

    // 2. Concluir a ordem original
    const finalNotes = `${notes}\n\n--- AVISO: ${pendingTasksState.length} tarefa(s) pendente(s) foram movidas para uma nova OS.`;
    await handleExecute(finalNotes);
    
    setLoading(false);
    setIsFollowUpDialogOpen(false); // Fecha o diálogo de pendências
  };

  // Função principal de execução, agora reutilizável
  const handleExecute = async (executionNotes: string = notes) => {
    if (!order) return;
    setLoading(true);

    const executeData = {
      actual_hours: actualHours ? parseInt(actualHours) : undefined,
      description: `${order.description}\n\n--- Observações da Execução ---\n${executionNotes}`,
      completed_date: new Date().toISOString().split('T')[0],
      status: 'completed' as const
    };

    const result = await onExecute(order.id, executeData);
    if (result) {
      toast({ title: "Ordem executada", description: "Ordem de serviço marcada como concluída." });
      onClose(); // Fecha o diálogo principal
    }
    setLoading(false);
  };
  
  if (!order) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Executar Ordem de Serviço</DialogTitle>
            <DialogDescription>Marque as tarefas concluídas e finalize a ordem.</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
            {tasks.length > 0 && (
              <div className="space-y-2">
                <Label>Checklist de Tarefas</Label>
                <div className="space-y-2 rounded-md border p-4">
                  {tasks.map((task, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Checkbox id={`task-${index}`} checked={!!completedTasks[index]} onCheckedChange={() => handleTaskToggle(index)} />
                      <label htmlFor={`task-${index}`} className="text-sm cursor-pointer">{task}</label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="actual-hours">Horas Trabalhadas (Reais)</Label>
              <Input id="actual-hours" type="number" placeholder="Ex: 4" value={actualHours} onChange={(e) => setActualHours(e.target.value)} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="execution-notes">Observações da Execução</Label>
              <Textarea id="execution-notes" placeholder="Descreva o que foi realizado, problemas encontrados, etc..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}/>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    {/* Este botão agora abre o diálogo de pendências ou o alerta simples */}
                    <Button onClick={handleConcludeClick} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Concluir Ordem
                    </Button>
                </AlertDialogTrigger>
                {/* Este é o alerta para o caso de NÃO haver tarefas pendentes */}
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Conclusão</AlertDialogTitle>
                        <AlertDialogDescription>Tem a certeza que deseja marcar esta ordem como concluída?</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Não</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleExecute()}>Sim, Concluir</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* NOVO: Diálogo para agendar tarefas pendentes */}
      <Dialog open={isFollowUpDialogOpen} onOpenChange={setIsFollowUpDialogOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Tarefas Pendentes Encontradas</DialogTitle>
                  <DialogDescription>
                      Existem {pendingTasksState.length} tarefas não concluídas. Deseja criar uma nova OS para elas? Por favor, agende uma data para a nova ordem.
                  </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                  <Label htmlFor="follow-up-date">Agendar Nova OS para:</Label>
                  <Input 
                      id="follow-up-date" 
                      type="date"
                      value={followUpScheduleDate}
                      onChange={(e) => setFollowUpScheduleDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                  />
              </div>
              <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsFollowUpDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleExecuteWithFollowUp} disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Criar OS e Concluir'}
                  </Button>
              </div>
          </DialogContent>
      </Dialog>
    </>
  );
};

export default WorkOrderExecuteDialog;