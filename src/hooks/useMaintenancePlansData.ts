
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface MaintenancePlan {
  id: string;
  name: string;
  type: string;
  equipment_id?: string;
  frequency?: string;
  estimated_duration_hours?: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  active: boolean;
  description?: string;
  tasks?: string;
  created_at: string;
  updated_at: string;
  equipment?: {
    id: string;
    name: string;
    code: string;
  };
}

type CreateMaintenancePlanData = {
  name: string;
  type: string;
  equipment_id?: string;
  frequency?: string;
  estimated_duration_hours?: number;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  active?: boolean;
  description?: string;
  tasks?: string;
};

export const useMaintenancePlansData = () => {
  const [plans, setPlans] = useState<MaintenancePlan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('maintenance_plans')
        .select(`
          *,
          equipment:equipment_id (
            id,
            name,
            code
          )
        `)
        .order('name');

      if (error) {
        console.error('Error fetching maintenance plans:', error);
        toast({
          title: "Erro ao carregar planos de manutenção",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      const plansData: MaintenancePlan[] = (data || []).map(item => ({
        ...item,
        priority: item.priority as MaintenancePlan['priority'],
        frequency: item.frequency_days ? item.frequency_days.toString() : item.frequency,
      }));

      setPlans(plansData);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro ao carregar planos",
        description: "Erro inesperado ao carregar dados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPlan = async (planData: CreateMaintenancePlanData) => {
    try {
      const { data, error } = await supabase
        .from('maintenance_plans')
        .insert(planData)
        .select()
        .single();

      if (error) {
        console.error('Error creating maintenance plan:', error);
        toast({
          title: "Erro ao criar plano",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Plano criado",
        description: "Plano de manutenção criado com sucesso",
      });

      await fetchPlans(); // Refresh the list
      return data;
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro ao criar plano",
        description: "Erro inesperado ao criar plano",
        variant: "destructive",
      });
      return null;
    }
  };

  const updatePlan = async (id: string, planData: Partial<MaintenancePlan>) => {
    try {
      const { data, error } = await supabase
        .from('maintenance_plans')
        .update(planData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating maintenance plan:', error);
        toast({
          title: "Erro ao atualizar plano",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Plano atualizado",
        description: "Plano de manutenção atualizado com sucesso",
      });

      await fetchPlans(); // Refresh the list
      return data;
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro ao atualizar plano",
        description: "Erro inesperado ao atualizar plano",
        variant: "destructive",
      });
      return null;
    }
  };

  const deletePlan = async (id: string) => {
    try {
      const { error } = await supabase
        .from('maintenance_plans')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting maintenance plan:', error);
        toast({
          title: "Erro ao deletar plano",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Plano deletado",
        description: "Plano de manutenção deletado com sucesso",
      });

      await fetchPlans(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro ao deletar plano",
        description: "Erro inesperado ao deletar plano",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return {
    plans,
    loading,
    createPlan,
    updatePlan,
    deletePlan,
    refetch: fetchPlans,
  };
};
