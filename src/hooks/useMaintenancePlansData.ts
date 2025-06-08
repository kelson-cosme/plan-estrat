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

// Helper function to convert frequency string to days
const frequencyToDays = (frequency: string): number | undefined => {
  switch (frequency) {
    case 'diaria': return 1;
    case 'semanal': return 7;
    case 'quinzenal': return 15;
    case 'mensal': return 30;
    case 'anual': return 365;
    default: return undefined;
  }
};

// Helper function to convert days to frequency string
const daysToFrequency = (days: number): string | undefined => {
  switch (days) {
    case 1: return 'diaria';
    case 7: return 'semanal';
    case 15: return 'quinzenal';
    case 30: return 'mensal';
    case 365: return 'anual';
    default: return undefined;
  }
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
        frequency: item.frequency_days ? daysToFrequency(item.frequency_days) : undefined,
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
      // Convert frequency string to days for database storage
      const dbData = {
        name: planData.name,
        type: planData.type,
        equipment_id: planData.equipment_id || undefined,
        frequency_days: planData.frequency ? frequencyToDays(planData.frequency) : undefined,
        estimated_duration_hours: planData.estimated_duration_hours,
        priority: planData.priority,
        active: planData.active,
        description: planData.description,
        tasks: planData.tasks,
      };

      const { data, error } = await supabase
        .from('maintenance_plans')
        .insert(dbData)
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
      // Convert frequency string to days if frequency is being updated
      const dbData = { ...planData };
      if (planData.frequency) {
        delete dbData.frequency;
        (dbData as any).frequency_days = frequencyToDays(planData.frequency);
      }

      const { data, error } = await supabase
        .from('maintenance_plans')
        .update(dbData)
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
