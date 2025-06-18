import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// A interface permanece a mesma
export interface Equipment {
  id: string;
  name: string;
  code: string;
  type: string;
  location?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  installation_date?: string | null;
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
      // ***** A CORREÇÃO CRÍTICA ESTÁ AQUI *****
      // Trocamos o select('*') por uma lista explícita de todas as colunas da tabela 'equipment'.
      const { data, error } = await supabase
        .from('equipment')
        .select(
          'id, name, code, type, location, manufacturer, model, installation_date, status, criticality, created_at, updated_at'
        )
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

      // O resto da função permanece igual, mas agora mais segura
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