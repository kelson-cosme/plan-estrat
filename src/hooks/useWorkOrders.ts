
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface WorkOrder {
  id: string;
  title: string;
  description?: string;
  type: 'preventiva' | 'preditiva' | 'corretiva';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  equipment_id?: string;
  assigned_to?: string;
  maintenance_plan_id?: string;
  scheduled_date?: string;
  completed_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  created_at: string;
  updated_at: string;
  equipment?: {
    id: string;
    name: string;
    code: string;
  };
  assigned_to_profile?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export const useWorkOrders = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          equipment:equipment_id (
            id,
            name,
            code
          ),
          assigned_to_profile:assigned_to (
            id,
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching work orders:', error);
        toast({
          title: "Erro ao carregar ordens de serviço",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      const workOrdersData: WorkOrder[] = (data || []).map(item => ({
        ...item,
        type: item.type as WorkOrder['type'],
        priority: item.priority as WorkOrder['priority'],
        status: item.status as WorkOrder['status'],
      }));

      setWorkOrders(workOrdersData);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro ao carregar ordens",
        description: "Erro inesperado ao carregar dados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createWorkOrder = async (orderData: Partial<WorkOrder>) => {
    try {
      const { data, error } = await supabase
        .from('work_orders')
        .insert([orderData])
        .select()
        .single();

      if (error) {
        console.error('Error creating work order:', error);
        toast({
          title: "Erro ao criar ordem",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Ordem criada",
        description: "Ordem de serviço criada com sucesso",
      });

      await fetchWorkOrders(); // Refresh the list
      return data;
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro ao criar ordem",
        description: "Erro inesperado ao criar ordem",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateWorkOrder = async (id: string, orderData: Partial<WorkOrder>) => {
    try {
      const { data, error } = await supabase
        .from('work_orders')
        .update(orderData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating work order:', error);
        toast({
          title: "Erro ao atualizar ordem",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Ordem atualizada",
        description: "Ordem de serviço atualizada com sucesso",
      });

      await fetchWorkOrders(); // Refresh the list
      return data;
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro ao atualizar ordem",
        description: "Erro inesperado ao atualizar ordem",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteWorkOrder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('work_orders')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting work order:', error);
        toast({
          title: "Erro ao deletar ordem",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Ordem deletada",
        description: "Ordem de serviço deletada com sucesso",
      });

      await fetchWorkOrders(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro ao deletar ordem",
        description: "Erro inesperado ao deletar ordem",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  return {
    workOrders,
    loading,
    createWorkOrder,
    updateWorkOrder,
    deleteWorkOrder,
    refetch: fetchWorkOrders,
  };
};
