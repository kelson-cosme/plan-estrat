import React from 'react';
import { formatDateForDisplay } from '@/lib/utils';
import { useWorkOrders } from '@/hooks/useWorkOrders';

interface PrintableWorkOrderProps {
  order: ReturnType<typeof useWorkOrders>['workOrders'][0] | null;
}

export const PrintableWorkOrder = React.forwardRef<HTMLDivElement, PrintableWorkOrderProps>(({ order }, ref) => {
  if (!order) {
    return null;
  }

  const typeMap: { [key: string]: string } = { 'preventiva': 'Preventiva', 'preditiva': 'Preditiva', 'corretiva': 'Corretiva' };
  const priorityMap: { [key: string]: string } = { 'low': 'Baixa', 'medium': 'Média', 'high': 'Alta', 'critical': 'Crítica' };
  const statusMap: { [key: string]: string } = { 'open': 'Aberta', 'in_progress': 'Em Andamento', 'completed': 'Concluída', 'cancelled': 'Cancelada' };

  return (
    <div ref={ref} className="p-8 font-sans text-black bg-white">
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

        {/* NOVO: Seção para Recursos Utilizados */}
        {order.used_resources && order.used_resources.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-4">Recursos Utilizados</h2>
            <ul className="list-disc list-inside text-sm">
              {order.used_resources.map((resource, index) => (
                <li key={index}>{resource}</li>
              ))}
            </ul>
          </section>
        )}
        {/* FIM NOVO: Seção para Recursos Utilizados */}

        <section className="mb-8">
          <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-4">Descrição e Tarefas</h2>
          <div className="text-sm whitespace-pre-wrap p-4 bg-gray-50 rounded-md border">
            {order.description || 'Nenhuma descrição fornecida.'}
          </div>
        </section>

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