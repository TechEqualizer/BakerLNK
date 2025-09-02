
import React, { useState, useEffect } from 'react';
import { Order, Customer } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    CakeSlice, 
    Search, 
    Filter, 
    Calendar,
    DollarSign,
    User,
    MapPin,
    Edit,
    CheckCircle,
    Clock,
    AlertTriangle
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { toast, Toaster } from 'sonner';
import { format } from 'date-fns';

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);
    const [formData, setFormData] = useState({
        status: 'inquiry',
        quoted_price: '',
        deposit_amount: '',
        deposit_paid: false,
        baker_notes: '',
        priority: 'medium'
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [ordersData, customersData] = await Promise.all([
                Order.list('-created_date'),
                Customer.list()
            ]);
            
            // Map customer names to orders
            const ordersWithCustomers = ordersData.map(order => {
                const customer = customersData.find(c => c.id === order.customer_id);
                return {
                    ...order,
                    customer_name: customer?.name || 'Unknown Customer',
                    customer_email: customer?.email || ''
                };
            });
            
            setOrders(ordersWithCustomers);
            setCustomers(customersData);
        } catch (error) {
            console.error('Error loading orders data:', error);
            toast.error('Failed to load orders.');
        } finally {
            setIsLoading(false);
        }
    };

    const statusOptions = [
        { value: 'inquiry', label: 'Inquiry', color: 'bg-blue-100 text-blue-800' },
        { value: 'quoted', label: 'Quoted', color: 'bg-yellow-100 text-yellow-800' },
        { value: 'confirmed', label: 'Confirmed', color: 'bg-green-100 text-green-800' },
        { value: 'in_progress', label: 'In Progress', color: 'bg-purple-100 text-purple-800' },
        { value: 'ready', label: 'Ready', color: 'bg-indigo-100 text-indigo-800' },
        { value: 'completed', label: 'Completed', color: 'bg-emerald-100 text-emerald-800' },
        { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
    ];

    const getStatusIcon = (status) => {
        switch (status) {
            case 'inquiry': return <AlertTriangle className="w-4 h-4" />;
            case 'quoted': return <DollarSign className="w-4 h-4" />;
            case 'confirmed': return <CheckCircle className="w-4 h-4" />;
            case 'in_progress': return <Clock className="w-4 h-4" />;
            case 'ready': return <CheckCircle className="w-4 h-4" />;
            case 'completed': return <CheckCircle className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.cake_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleInputChange = (field, value) => {
        setFormData(prev => ({...prev, [field]: value}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!editingOrder) return;

        try {
            const updateData = {
                status: formData.status,
                quoted_price: formData.quoted_price ? parseFloat(formData.quoted_price) : null,
                deposit_amount: formData.deposit_amount ? parseFloat(formData.deposit_amount) : null,
                deposit_paid: formData.deposit_paid,
                baker_notes: formData.baker_notes,
                priority: formData.priority
            };

            await Order.update(editingOrder.id, updateData);
            toast.success('Order updated successfully!');
            
            setShowDialog(false);
            setEditingOrder(null);
            loadData();
        } catch (error) {
            console.error('Error updating order:', error);
            toast.error('Failed to update order.');
        }
    };

    const handleEdit = (order) => {
        setEditingOrder(order);
        setFormData({
            status: order.status || 'inquiry',
            quoted_price: order.quoted_price?.toString() || '',
            deposit_amount: order.deposit_amount?.toString() || '',
            deposit_paid: order.deposit_paid || false,
            baker_notes: order.baker_notes || '',
            priority: order.priority || 'medium'
        });
        setShowDialog(true);
    };

    const getOrderStats = () => {
        const total = orders.length;
        const pending = orders.filter(o => ['inquiry', 'quoted'].includes(o.status)).length;
        const active = orders.filter(o => ['confirmed', 'in_progress'].includes(o.status)).length;
        const completed = orders.filter(o => o.status === 'completed').length;
        
        return { total, pending, active, completed };
    };

    const stats = getOrderStats();

    if (isLoading) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-6">
                    <div className="grid gap-4 md:grid-cols-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl h-24 border border-amber-200"></div>
                        ))}
                    </div>
                    <div className="grid gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl h-48 border border-amber-200"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <Toaster richColors position="top-center" />
            <div className="p-4 md:p-8 space-y-8 bg-gradient-to-br from-background via-background/95 to-muted/50 min-h-screen">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-8">
                    <div className="flex items-center gap-3">
                        <CakeSlice className="w-8 h-8 text-foreground" />
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Orders</h1>
                            <p className="text-muted-foreground mt-1">Manage all your cake orders</p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    <Card className="bg-white/80 backdrop-blur-sm border-amber-200 shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-amber-800">Total Orders</CardTitle>
                            <CakeSlice className="h-4 w-4 text-amber-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-900">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/80 backdrop-blur-sm border-amber-200 shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-blue-800">Pending</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-900">{stats.pending}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/80 backdrop-blur-sm border-amber-200 shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-purple-800">Active</CardTitle>
                            <Clock className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-900">{stats.active}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/80 backdrop-blur-sm border-amber-200 shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-green-800">Completed</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-900">{stats.completed}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400 w-4 h-4" />
                        <Input
                            placeholder="Search orders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 border-amber-300 focus:border-amber-500"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 flex-1">
                            <Filter className="w-4 h-4 text-amber-400" />
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full md:w-40 border-amber-300 focus:border-amber-500">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    {statusOptions.map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="text-sm text-amber-600 flex items-center whitespace-nowrap">
                            {filteredOrders.length} of {orders.length} orders
                        </div>
                    </div>
                </div>

                {/* Orders List */}
                <div className="grid gap-6">
                    {filteredOrders.map(order => {
                        const statusOption = statusOptions.find(s => s.value === order.status);
                        return (
                            <Card key={order.id} className="bg-white/80 backdrop-blur-sm border-amber-200 shadow-lg hover:shadow-xl transition-shadow">
                                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex-shrink-0 flex items-center justify-center text-white">
                                            <CakeSlice className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <CardTitle className="text-amber-900 truncate">
                                                {order.cake_description}
                                            </CardTitle>
                                            <div className="flex items-center gap-4 text-sm text-amber-600 mt-1">
                                                <div className="flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    {order.customer_name}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {order.event_date ? format(new Date(order.event_date), 'MMM d, yyyy') : 'No date'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 self-end sm:self-center">
                                        <Badge className={`${statusOption?.color} whitespace-nowrap`}>
                                            <div className="flex items-center gap-1">
                                                {getStatusIcon(order.status)}
                                                {statusOption?.label || order.status}
                                            </div>
                                        </Badge>
                                        <Button variant="outline" size="icon" onClick={() => handleEdit(order)}>
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid md:grid-cols-3 gap-6">
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-sm font-medium text-amber-800">Event Details</p>
                                                <div className="text-sm text-amber-600 space-y-1">
                                                    <p>Type: {order.event_type?.replace('_', ' ').toUpperCase()}</p>
                                                    {order.serves_count && <p>Serves: {order.serves_count} people</p>}
                                                    {order.pickup_delivery && (
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" />
                                                            {order.pickup_delivery === 'delivery' ? 'Delivery' : 'Pickup'}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {(order.budget_min || order.budget_max) && (
                                                <div>
                                                    <p className="text-sm font-medium text-amber-800">Budget Range</p>
                                                    <p className="text-sm text-amber-600">
                                                        ${order.budget_min || 0} - ${order.budget_max || 'No max'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="space-y-3">
                                            {order.quoted_price && (
                                                <div className="p-3 bg-green-50 rounded-lg">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-green-800">Quoted Price</span>
                                                        <span className="font-bold text-green-900">${order.quoted_price.toLocaleString()}</span>
                                                    </div>
                                                    {order.deposit_amount && (
                                                        <div className="flex items-center justify-between mt-1">
                                                            <span className="text-xs text-green-700">Deposit</span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-green-700">${order.deposit_amount}</span>
                                                                <Badge variant={order.deposit_paid ? "default" : "outline"} className="text-xs">
                                                                    {order.deposit_paid ? "Paid" : "Pending"}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {order.priority && order.priority !== 'medium' && (
                                                <div>
                                                    <Badge variant={order.priority === 'high' || order.priority === 'urgent' ? 'destructive' : 'default'}>
                                                        {order.priority.toUpperCase()} PRIORITY
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="space-y-3">
                                            {order.special_requests && (
                                                <div>
                                                    <p className="text-sm font-medium text-amber-800">Special Requests</p>
                                                    <p className="text-sm text-amber-600 line-clamp-2">{order.special_requests}</p>
                                                </div>
                                            )}
                                            {order.baker_notes && (
                                                <div>
                                                    <p className="text-sm font-medium text-amber-800">Baker Notes</p>
                                                    <p className="text-sm text-amber-600 line-clamp-2">{order.baker_notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {filteredOrders.length === 0 && !isLoading && (
                    <div className="text-center py-12">
                        <CakeSlice className="w-24 h-24 mx-auto mb-4 text-amber-400 opacity-50" />
                        <h3 className="text-xl font-semibold text-amber-800 mb-2">
                            {searchTerm || statusFilter !== 'all' ? 'No orders found' : 'No orders yet'}
                        </h3>
                        <p className="text-amber-600">
                            {searchTerm || statusFilter !== 'all'
                                ? 'Try adjusting your search or filters'
                                : 'Orders from your showcase will appear here'
                            }
                        </p>
                    </div>
                )}

                {/* Edit Order Dialog */}
                <Dialog open={showDialog} onOpenChange={setShowDialog}>
                    <DialogContent className="max-w-2xl w-[95vw] sm:w-full rounded-lg">
                        <DialogHeader>
                            <DialogTitle>Update Order</DialogTitle>
                        </DialogHeader>
                        {editingOrder && (
                            <form onSubmit={handleSubmit} className="space-y-6 p-1 sm:p-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="status">Status</Label>
                                        <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                                            <SelectTrigger className="border-amber-300">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statusOptions.map(option => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="priority">Priority</Label>
                                        <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                                            <SelectTrigger className="border-amber-300">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">Low</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                                <SelectItem value="urgent">Urgent</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="quoted_price">Quoted Price</Label>
                                        <Input
                                            id="quoted_price"
                                            type="number"
                                            step="0.01"
                                            value={formData.quoted_price}
                                            onChange={(e) => handleInputChange('quoted_price', e.target.value)}
                                            className="border-amber-300 focus:border-amber-500"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="deposit_amount">Deposit Amount</Label>
                                        <Input
                                            id="deposit_amount"
                                            type="number"
                                            step="0.01"
                                            value={formData.deposit_amount}
                                            onChange={(e) => handleInputChange('deposit_amount', e.target.value)}
                                            className="border-amber-300 focus:border-amber-500"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="deposit_paid"
                                        checked={formData.deposit_paid}
                                        onChange={(e) => handleInputChange('deposit_paid', e.target.checked)}
                                        className="rounded border-amber-300"
                                    />
                                    <Label htmlFor="deposit_paid">Deposit Paid</Label>
                                </div>
                                <div>
                                    <Label htmlFor="baker_notes">Baker Notes</Label>
                                    <Textarea
                                        id="baker_notes"
                                        value={formData.baker_notes}
                                        onChange={(e) => handleInputChange('baker_notes', e.target.value)}
                                        rows={4}
                                        className="border-amber-300 focus:border-amber-500"
                                        placeholder="Add notes about this order..."
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-6 border-t">
                                    <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                                        Update Order
                                    </Button>
                                </div>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
