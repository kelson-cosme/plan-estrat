
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MaintenanceCalendar from "@/components/MaintenanceCalendar";
import EquipmentManagement from "@/components/EquipmentManagement";
import MaintenanceDashboard from "@/components/MaintenanceDashboard";
import MaintenancePlans from "@/components/MaintenancePlans";
import WorkOrders from "@/components/WorkOrders";
import Reports from "@/components/Reports";
import { LogOut, User, Wrench } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mb-4"></div>
          <p>Carregando sistema...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="calendar">Calendário</TabsTrigger>
            <TabsTrigger value="equipment">Equipamentos</TabsTrigger>
            <TabsTrigger value="maintenance-plans">Planos de Manutenção</TabsTrigger>
            <TabsTrigger value="work-orders">Ordens de Serviço</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <MaintenanceDashboard />
          </TabsContent>

          <TabsContent value="calendar">
            <MaintenanceCalendar />
          </TabsContent>

          <TabsContent value="equipment">
            <EquipmentManagement />
          </TabsContent>

          <TabsContent value="maintenance-plans">
            <MaintenancePlans />
          </TabsContent>

          <TabsContent value="work-orders">
            <WorkOrders />
          </TabsContent>

          <TabsContent value="reports">
            <Reports />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
