
import React from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link2, Database, Search, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { links, pages } = useData();

  const dashboardCards = [
    {
      title: "Link Generator",
      description: "Create unique links with custom landing pages",
      icon: <Link2 className="h-6 w-6 mr-4" />,
      path: "/link-generator",
      color: "bg-blue-100 dark:bg-blue-900"
    },
    {
      title: "Database",
      description: "Manage all your links and pages",
      icon: <Database className="h-6 w-6 mr-4" />,
      path: "/database",
      color: "bg-green-100 dark:bg-green-900"
    },
    {
      title: "Search",
      description: "Find links and pages quickly",
      icon: <Search className="h-6 w-6 mr-4" />,
      path: "/search",
      color: "bg-purple-100 dark:bg-purple-900"
    },
    {
      title: "Settings",
      description: "Configure your preferences",
      icon: <Settings className="h-6 w-6 mr-4" />,
      path: "/settings/change-link",
      color: "bg-amber-100 dark:bg-amber-900"
    }
  ];

  const stats = [
    { title: "Total Links", value: links.length },
    { title: "Total Pages", value: pages.length },
    { title: "Total Visits", value: links.reduce((acc, link) => acc + link.visits, 0) }
  ];

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-8">
        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <h2 className="text-2xl font-bold tracking-tight">Quick Access</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {dashboardCards.map((card) => (
            <Card 
              key={card.title} 
              className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary"
              onClick={() => navigate(card.path)}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`rounded-full p-3 ${card.color}`}>
                    {card.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{card.title}</h3>
                    <p className="text-sm text-muted-foreground">{card.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome, {user?.username}!</h2>
          <p className="text-muted-foreground">
            This is your Book Market dashboard. Use the sidebar to navigate
            between different sections of the application.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
