
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface MaintenancePlan {
  id: string;
  equipment_id: string;
  name: string;
  type: 'preventiva' | 'preditiva' | 'corretiva';
  frequency_days?: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
  estimated_duration_hours?: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  equipment?: {
    name: string;
    code: string;
  };
}

export const useMaintenancePlans = () => {
  const [plans, setPlans] = useState<MaintenancePlan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('maintenance_plans')
        .select(`
          *,
          equipment:equipment_id (
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

      // Convert database types to interface types
      const plansData: MaintenancePlan[] = (data || []).map(item => ({
        ...item,
        type: item.type as MaintenancePlan['type'],
        priority: item.priority as MaintenancePlan['priority'],
      }));

      setPlans(plansData);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro ao carregar planos de manutenção",
        description: "Erro inesperado ao carregar dados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return {
    plans,
    loading,
    refetch: fetchPlans,
  };
};
