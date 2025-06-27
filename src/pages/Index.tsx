import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MaintenanceCalendar from "@/components/MaintenanceCalendar";
import EquipmentManagement from "@/components/EquipmentManagement";
import MaintenanceDashboard from "@/components/MaintenanceDashboard";
import MaintenancePlans from "@/components/MaintenancePlans";
import WorkOrders from "@/components/WorkOrders";
import Reports from "@/components/Reports";
import YearlyMap from "@/components/YearlyMap";
import { LogOut, User, Wrench } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { PrintableWorkOrder } from "@/components/PrintableWorkOrder"; // Importe aqui
import { WorkOrder } from "@/hooks/useWorkOrders"; // Importe o tipo

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [workOrderPrefill, setWorkOrderPrefill] = useState<any>(null);
  
  // Mova o estado da ordem para impressão para o nível superior
  const [orderToPrint, setOrderToPrint] = useState<WorkOrder | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado do sistema",
    });
    navigate("/auth");
  };
  
  const handlePrintOrder = (order: WorkOrder) => {
    setOrderToPrint(order);
    setTimeout(() => {
      window.print();
      setOrderToPrint(null); // Limpa após a impressão
    }, 100);
  };


  const handleNavigateAndPrefill = (scheduleData: any) => {
    const plan = scheduleData.maintenance_plans;
    if (!plan) return;

    let tasksArray: string[] = [];
    if (plan.tasks && typeof plan.tasks === 'string') {
      try {
        tasksArray = JSON.parse(plan.tasks);
      } catch (e) {
        tasksArray = [];
      }
    } else if (Array.isArray(plan.tasks)) {
      tasksArray = plan.tasks;
    }
    
    let resourcesArray: string[] = [];
    if (plan.required_resources && typeof plan.required_resources === 'string') {
        try { resourcesArray = JSON.parse(plan.required_resources); } catch(e) { resourcesArray = []; }
    } else if (Array.isArray(plan.required_resources)) {
        resourcesArray = plan.required_resources;
    }

    const prefill = {
      title: `Execução Agendada: ${plan.name}`,
      description: plan.description || "",
      tasks: tasksArray,
      type: plan.type,
      priority: plan.priority,
      equipment_id: plan.equipment?.id,
      maintenance_plan_id: scheduleData.maintenance_plan_id,
      scheduled_date: scheduleData.next_scheduled_date,
      required_resources: resourcesArray,
    };

    setWorkOrderPrefill(prefill);
    setActiveTab("work-orders");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mb-4"></div>
        <p>Carregando sistema...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Adicione a área de impressão aqui, fora dos elementos que serão ocultados */}
      <div className="printable-area">
        {orderToPrint && <PrintableWorkOrder order={orderToPrint} />}
      </div>

      {/* Adicione a classe 'no-print' aos elementos que você não quer imprimir */}
      <header className="bg-white shadow-sm border-b no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Wrench className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sistema de Manutenção</h1>
                <p className="text-sm text-gray-600">Gestão Inteligente de Manutenção Industrial</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-700">{user.email}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 no-print">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="calendar">Calendário</TabsTrigger>
            <TabsTrigger value="equipment">Equipamentos</TabsTrigger>
            <TabsTrigger value="maintenance-plans">Planos de Manutenção</TabsTrigger>
            <TabsTrigger value="work-orders">Ordens de Serviço</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
            <TabsTrigger value="yearly-map">Mapa Anual</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard"><MaintenanceDashboard /></TabsContent>
          <TabsContent value="calendar">
            <MaintenanceCalendar onGenerateOrder={handleNavigateAndPrefill} />
          </TabsContent>
          <TabsContent value="yearly-map"><YearlyMap /></TabsContent>
          <TabsContent value="equipment"><EquipmentManagement /></TabsContent>
          <TabsContent value="maintenance-plans"><MaintenancePlans /></TabsContent>
          <TabsContent value="work-orders">
            <WorkOrders
              onPrintOrder={handlePrintOrder} // Passe a função de impressão
              prefillData={workOrderPrefill}
              onPrefillHandled={() => setWorkOrderPrefill(null)}
            />
          </TabsContent>
          <TabsContent value="reports"><Reports /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;