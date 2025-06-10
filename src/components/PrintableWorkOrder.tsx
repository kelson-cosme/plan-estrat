import React from 'react';
import { formatDateForDisplay } from '@/lib/utils';
import { useWorkOrders } from '@/hooks/useWorkOrders';

// Definimos a interface para as props, esperando uma ordem de serviço
interface PrintableWorkOrderProps {
  order: ReturnType<typeof useWorkOrders>['workOrders'][0] | null;
}

// Usamos forwardRef para compatibilidade e boas práticas
export const PrintableWorkOrder = React.forwardRef<HTMLDivElement, PrintableWorkOrderProps>(({ order }, ref) => {
  // Se não houver ordem para imprimir, não renderiza nada
  if (!order) {
    return null;
  }

  // Mapeamento de valores para exibição amigável
  const typeMap: { [key: string]: string } = { 'preventiva': 'Preventiva', 'preditiva': 'Preditiva', 'corretiva': 'Corretiva' };
  const priorityMap: { [key: string]: string } = { 'low': 'Baixa', 'medium': 'Média', 'high': 'Alta', 'critical': 'Crítica' };
  const statusMap: { [key: string]: string } = { 'open': 'Aberta', 'in_progress': 'Em Andamento', 'completed': 'Concluída', 'cancelled': 'Cancelada' };

  return (
    <div ref={ref} className="p-8 font-sans text-black bg-white">
      {/* Cabeçalho */}
      <header className="flex justify-between items-start border-b-2 border-black pb-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Ordem de Serviço</h1>
          <p className="text-sm text-gray-600">ID da OS: {order.id.split('-')[0]}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg">Status: {statusMap[order.status] || order.status}</p>
          <p className="text-sm">Data de Emissão: {formatDateForDisplay(order.created_at)}</p>
        </div>
      </header>

      <main>
        {/* Detalhes da Ordem */}
        <section className="mb-6">
          <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-4">Detalhes da Ordem</h2>
          <div className="grid grid-cols-3 gap-x-8 gap-y-4 text-sm">
            <div className="col-span-3">
              <p className="font-bold">Título:</p>
              <p>{order.title}</p>
            </div>
            <div>
              <p className="font-bold">Tipo de Manutenção:</p>
              <p>{typeMap[order.type] || order.type}</p>
            </div>
            <div>
              <p className="font-bold">Prioridade:</p>
              <p>{priorityMap[order.priority] || order.priority}</p>
            </div>
            <div>
              <p className="font-bold">Data Agendada:</p>
              <p>{order.scheduled_date ? formatDateForDisplay(order.scheduled_date) : 'N/A'}</p>
            </div>
          </div>
        </section>

        {/* Informações do Equipamento */}
        <section className="mb-6">
          <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-4">Equipamento</h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div>
              <p className="font-bold">Nome:</p>
              <p>{order.equipment?.name || 'Não especificado'}</p>
            </div>
            <div>
              <p className="font-bold">Código:</p>
              <p>{order.equipment?.code || 'N/A'}</p>
            </div>
          </div>
        </section>

        {/* Descrição e Tarefas */}
        <section className="mb-8">
          <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-4">Descrição e Tarefas</h2>
          <div className="text-sm whitespace-pre-wrap p-4 bg-gray-50 rounded-md border">
            {order.description || 'Nenhuma descrição fornecida.'}
          </div>
        </section>

        {/* Assinaturas */}
        <section>
          <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-4">Aprovações</h2>
          <div className="grid grid-cols-2 gap-8 pt-20 text-center text-sm">
            <div>
              <p className="border-t border-gray-400 pt-2">
                {order.assigned_to_profile?.full_name || '___________________________'}
              </p>
              <p className="text-xs text-gray-500">Técnico Responsável</p>
            </div>
            <div>
              <p className="border-t border-gray-400 pt-2">___________________________</p>
              <p className="text-xs text-gray-500">Supervisor de Manutenção</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
});