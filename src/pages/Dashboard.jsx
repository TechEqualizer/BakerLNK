
import React, { useState, useEffect } from 'react';
import { Order, Customer } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, CakeSlice, Users, DollarSign, ListOrdered, Rocket } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalCustomers: 0,
        totalRevenue: 0,
        pendingInquiries: 0,
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ordersData, customersData] = await Promise.all([
                    Order.list('-created_date', 100),
                    Customer.list()
                ]);

                const totalRevenue = ordersData
                    .filter(o => ['completed', 'confirmed', 'in_progress', 'ready'].includes(o.status))
                    .reduce((acc, order) => acc + (order.quoted_price || 0), 0);

                setStats({
                    totalOrders: ordersData.length,
                    totalCustomers: customersData.length,
                    totalRevenue: totalRevenue,
                    pendingInquiries: ordersData.filter(o => o.status === 'inquiry').length
                });

                setRecentOrders(ordersData.slice(0, 5));

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const statCards = [
        { title: "Total Revenue", value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-primary" },
        { title: "Pending Inquiries", value: stats.pendingInquiries, icon: ListOrdered, color: "text-primary" },
        { title: "Total Orders", value: stats.totalOrders, icon: CakeSlice, color: "text-primary" },
        { title: "Total Customers", value: stats.totalCustomers, icon: Users, color: "text-primary" },
    ];
    
    if (isLoading) {
      return (
        <div className="p-8 bg-gradient-to-br from-background via-background/95 to-muted/50 min-h-screen">
          <div className="animate-pulse space-y-6">
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="bg-card rounded-xl h-28 border"></div>
                <div className="bg-card rounded-xl h-28 border"></div>
                <div className="bg-card rounded-xl h-28 border"></div>
                <div className="bg-card rounded-xl h-28 border"></div>
             </div>
            <div className="bg-card rounded-xl h-96 border"></div>
          </div>
        </div>
      );
    }

    return (
        <>
        <Toaster richColors position="top-center" />
        <div className="p-4 md:p-8 bg-gradient-to-br from-background via-background/95 to-muted/50 min-h-screen">
          <Tabs defaultValue="main" className="w-full space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Welcome back! Here's a snapshot of your bakery.</p>
                </div>
                <TabsList className="bg-card/80 backdrop-blur-sm border self-start sm:self-center">
                    <TabsTrigger value="main">Overview</TabsTrigger>
                    <TabsTrigger value="developer">
                        <Rocket className="w-4 h-4 mr-2" /> Developer
                    </TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="main" className="space-y-8 mt-0">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {statCards.map((card, index) => (
                      <Card key={index} className="bg-card/80 backdrop-blur-sm border shadow-lg hover:shadow-xl transition-shadow">
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                              <card.icon className={`h-4 w-4 ${card.color}`} />
                          </CardHeader>
                          <CardContent>
                              <div className="text-2xl font-bold text-foreground">{card.value}</div>
                          </CardContent>
                      </Card>
                  ))}
              </div>

              <Card className="bg-card/80 backdrop-blur-sm border shadow-lg">
                  <CardHeader className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="flex-1">
                          <CardTitle>Recent Orders</CardTitle>
                      </div>
                      <Button asChild size="sm" className="ml-auto gap-1 w-full sm:w-auto">
                          <Link to={createPageUrl('Orders')}>
                              View All
                              <ArrowUpRight className="h-4 w-4" />
                          </Link>
                      </Button>
                  </CardHeader>
                  <CardContent>
                     <div className="overflow-x-auto">
                          <table className="min-w-full w-full">
                              <thead>
                                  <tr className="border-b border-border">
                                      <th className="text-left p-3 text-sm font-semibold text-muted-foreground">Status</th>
                                      <th className="text-left p-3 text-sm font-semibold text-muted-foreground">Description</th>
                                      <th className="text-left p-3 text-sm font-semibold text-muted-foreground">Event Date</th>
                                      <th className="text-right p-3 text-sm font-semibold text-muted-foreground">Price</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  {recentOrders.map((order) => (
                                      <tr key={order.id} className="border-b border-border/50 last:border-0 hover:bg-muted/50">
                                          <td className="p-3">
                                              <Badge variant="outline" className="capitalize whitespace-nowrap">{order.status}</Badge>
                                          </td>
                                          <td className="p-3 font-medium text-foreground truncate max-w-xs">{order.cake_description}</td>
                                          <td className="p-3 text-muted-foreground whitespace-nowrap">{order.event_date ? new Date(order.event_date).toLocaleDateString() : 'N/A'}</td>
                                          <td className="p-3 text-right font-semibold text-primary whitespace-nowrap">${(order.quoted_price || 0).toLocaleString()}</td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="developer" className="mt-0">
              <Card className="bg-card/80 backdrop-blur-sm border shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Rocket className="h-5 w-5 text-foreground" />
                    Developer Tools
                  </CardTitle>
                  <p className="text-sm text-muted-foreground pt-2">These actions are for development and testing purposes.</p>
                </CardHeader>
                <CardContent>
                    <h3 className="font-semibold text-foreground mb-2">Onboarding Wizard</h3>
                    <p className="text-muted-foreground mb-4 text-sm">
                        Use this button to re-trigger the 3-step onboarding flow. Note: This may create new data or redirect you away from the dashboard.
                    </p>
                    <Button asChild>
                        <Link to={createPageUrl('OnboardingWizard') + '?force=true'}>
                            Test Onboarding Flow
                        </Link>
                    </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        </>
    );
}
