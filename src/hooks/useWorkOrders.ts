// src/hooks/useWorkOrders.ts

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

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
  used_resources?: string[] | null;
}

type CreateWorkOrderData = {
  title: string;
  type: 'preventiva' | 'preditiva' | 'corretiva';
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'open' | 'in_progress' | 'completed' | 'cancelled';
  equipment_id?: string;
  assigned_to?: string;
  maintenance_plan_id?: string;
  scheduled_date?: string;
  completed_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  used_resources?: string[] | null;
};

export const useWorkOrders = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkOrders = async () => {
    try {
      // ALTERAÇÃO: Removemos o '*' e especificamos as colunas de work_orders
      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          id, title, description, type, priority, status, equipment_id, assigned_to,
          maintenance_plan_id, scheduled_date, completed_date, estimated_hours,
          actual_hours, created_at, updated_at, used_resources,
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
        used_resources: item.used_resources && typeof item.used_resources === 'string'
          ? JSON.parse(item.used_resources) : item.used_resources,
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

  const createWorkOrder = async (orderData: CreateWorkOrderData) => {
    try {
      // Garante que used_resources é um array antes de serializar
      const resourcesToSave = Array.isArray(orderData.used_resources)
        ? JSON.stringify(orderData.used_resources)
        : null;

      const dbData: TablesInsert<'work_orders'> = {
        title: orderData.title,
        type: orderData.type,
        description: orderData.description,
        priority: orderData.priority,
        status: orderData.status,
        equipment_id: orderData.equipment_id,
        assigned_to: orderData.assigned_to,
        maintenance_plan_id: orderData.maintenance_plan_id,
        scheduled_date: orderData.scheduled_date,
        estimated_hours: orderData.estimated_hours,
        actual_hours: orderData.actual_hours,
        used_resources: resourcesToSave, // Agora TypeScript aceita 'string | null' aqui
      };

      const { data, error } = await supabase
        .from('work_orders')
        .insert(dbData)
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

      await fetchWorkOrders();
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
      const { used_resources, ...restOfOrderData } = orderData;

      // Garante que used_resources é um array antes de serializar para a atualização
      const resourcesToSaveForUpdate = Array.isArray(used_resources)
        ? JSON.stringify(used_resources)
        : null;

      const payloadForDb: TablesUpdate<'work_orders'> = {
        ...restOfOrderData,
        used_resources: resourcesToSaveForUpdate,
      };

      const { data, error } = await supabase
        .from('work_orders')
        .update(payloadForDb)
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

      await fetchWorkOrders();
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

      await fetchWorkOrders();
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