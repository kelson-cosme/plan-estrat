// src/hooks/useMaintenancePlansData.ts
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
  tasks?: string[] | null;
  end_date?: string | null;
  schedule_days_of_week?: string[] | null;
  required_resources?: string[] | null; // NOVO CAMPO
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
  tasks?: string[] | null;
  end_date?: string | null;
  schedule_days_of_week?: string[] | null;
  required_resources?: string[] | null; // NOVO CAMPO
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
      // ALTERAÇÃO FINAL: Trocamos o select('*') pelas colunas explícitas.
      const { data, error } = await supabase
        .from('maintenance_plans')
        .select(`
          id,
          name,
          type,
          equipment_id,
          frequency_days,
          estimated_duration_hours,
          priority,
          active,
          description,
          tasks,
          end_date,
          schedule_days_of_week,
          required_resources,
          created_at,
          updated_at,
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
        tasks: (() => {
          if (item.tasks === null || typeof item.tasks === 'undefined') {
            return null;
          }
          if (Array.isArray(item.tasks)) {
            return item.tasks;
          }
          if (typeof item.tasks === 'string') {
            try {
              const parsed = JSON.parse(item.tasks);
              if (Array.isArray(parsed)) {
                return parsed;
              }
              return [item.tasks];
            } catch (e) {
              return [item.tasks];
            }
          }
          return null;
        })(),
        end_date: item.end_date as string | null,
        schedule_days_of_week: item.schedule_days_of_week && typeof item.schedule_days_of_week === 'string'
          ? JSON.parse(item.schedule_days_of_week) : item.schedule_days_of_week,
        required_resources: item.required_resources && typeof item.required_resources === 'string'
          ? JSON.parse(item.required_resources) : item.required_resources,
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
      const tasksToSave = planData.tasks ? JSON.stringify(planData.tasks) : null;
      const daysToSave = planData.schedule_days_of_week ? JSON.stringify(planData.schedule_days_of_week) : null;
      const resourcesToSave = planData.required_resources ? JSON.stringify(planData.required_resources) : null; // NOVO: Serializa recursos

      const dbData = {
        name: planData.name,
        type: planData.type,
        equipment_id: planData.equipment_id || undefined,
        frequency_days: planData.frequency ? frequencyToDays(planData.frequency) : undefined,
        estimated_duration_hours: planData.estimated_duration_hours,
        priority: planData.priority,
        active: planData.active,
        description: planData.description,
        tasks: tasksToSave,
        end_date: planData.end_date,
        schedule_days_of_week: daysToSave,
        required_resources: resourcesToSave, // NOVO: Envia recursos serializados
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

      if (dbData.frequency_days) {
        await initializeScheduleForPlan(data.id);
      }

      toast({
        title: "Plano criado",
        description: "Plano de manutenção criado com sucesso",
      });

      await fetchPlans();
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

  const initializeScheduleForPlan = async (planId: string) => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 1);

      const { error } = await supabase
        .from('maintenance_plan_schedules')
        .insert({
          maintenance_plan_id: planId,
          next_scheduled_date: startDate.toISOString().split('T')[0]
        });

      if (error) {
        console.error('Error initializing schedule:', error);
      }
    } catch (error) {
      console.error('Error initializing schedule:', error);
    }
  };

  const initializeAllSchedules = async () => {
    try {
      console.log('🔧 Chamando função initialize_maintenance_schedules...');
      const { error } = await supabase.rpc('initialize_maintenance_schedules');

      if (error) {
        console.error('❌ Erro ao inicializar agendamentos:', error);
        toast({
          title: "Erro ao inicializar agendamentos",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      console.log('✅ Agendamentos inicializados com sucesso');
      toast({
        title: "Agendamentos inicializados",
        description: "Agendamentos automáticos foram configurados para os planos ativos",
      });

      return true;
    } catch (error) {
      console.error('❌ Erro inesperado:', error);
      toast({
        title: "Erro ao inicializar agendamentos",
        description: "Erro inesperado ao inicializar agendamentos",
        variant: "destructive",
      });
      return false;
    }
  };

  const generateScheduledOrders = async () => {
    try {
      console.log('🚀 Chamando função generate_scheduled_work_orders...');

      const { data: schedulesData, error: schedulesError } = await supabase
        .from('maintenance_plan_schedules')
        .select(`
          *,
          maintenance_plans:maintenance_plan_id (
            id,
            name,
            active
          )
        `)
        .lte('next_scheduled_date', new Date().toISOString().split('T')[0]);

      if (schedulesError) {
        console.error('❌ Erro ao verificar agendamentos:', schedulesError);
        return false;
      }

      console.log('📊 Agendamentos elegíveis para geração:', schedulesData?.length || 0);

      if (!schedulesData || schedulesData.length === 0) {
        toast({
          title: "Nenhum agendamento devido",
          description: "Não há agendamentos que precisem gerar ordens hoje",
        });
        return true;
      }

      const { error } = await supabase.rpc('generate_scheduled_work_orders');

      if (error) {
        console.error('❌ Erro ao gerar ordens agendadas:', error);
        toast({
          title: "Erro ao gerar ordens agendadas",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      console.log('✅ Ordens geradas com sucesso');
      toast({
        title: "Ordens geradas",
        description: `${schedulesData.length} nova(s) ordem(ns) de serviço foram geradas automaticamente`,
      });

      return true;
    } catch (error) {
      console.error('❌ Erro inesperado:', error);
      toast({
        title: "Erro ao gerar ordens",
        description: "Erro inesperado ao gerar ordens agendadas",
        variant: "destructive",
      });
      return false;
    }
  };

  const updatePlan = async (id: string, planData: Partial<MaintenancePlan>) => {
    try {
      const dbData: any = { ...planData };
      if (planData.frequency) {
        delete dbData.frequency;
        dbData.frequency_days = frequencyToDays(planData.frequency);
      }

      if (planData.tasks !== undefined) {
        dbData.tasks = planData.tasks ? JSON.stringify(planData.tasks) : null;
      }
      if (planData.schedule_days_of_week !== undefined) {
        dbData.schedule_days_of_week = planData.schedule_days_of_week ? JSON.stringify(planData.schedule_days_of_week) : null;
      }
      if (planData.required_resources !== undefined) { // NOVO: Serializa recursos
        dbData.required_resources = planData.required_resources ? JSON.stringify(planData.required_resources) : null;
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

      await fetchPlans();
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

      await fetchPlans();
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
    initializeAllSchedules,
    generateScheduledOrders,
  };
};