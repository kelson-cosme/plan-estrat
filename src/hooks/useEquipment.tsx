
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Equipment {
  id: string;
  name: string;
  code: string;
  type: string;
  location?: string;
  manufacturer?: string;
  model?: string;
  installation_date?: string;
  status: 'active' | 'inactive' | 'maintenance' | 'retired';
  criticality: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  updated_at: string;
}

export const useEquipment = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEquipment = async () => {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching equipment:', error);
        toast({
          title: "Erro ao carregar equipamentos",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Convert database types to interface types
      const equipmentData: Equipment[] = (data || []).map(item => ({
        ...item,
        status: item.status as Equipment['status'],
        criticality: item.criticality as Equipment['criticality'],
      }));

      setEquipment(equipmentData);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro ao carregar equipamentos",
        description: "Erro inesperado ao carregar dados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  return {
    equipment,
    loading,
    refetch: fetchEquipment,
  };
};
