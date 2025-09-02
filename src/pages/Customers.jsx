
import React, { useState, useEffect } from 'react';
import { Customer, Order } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
    Users,
    Search,
    Plus,
    Edit,
    Mail,
    Phone,
    DollarSign,
    CakeSlice,
    UserPlus,
    UploadCloud // Added UploadCloud icon
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { toast, Toaster } from 'sonner';

import ContactImporter from '../components/customers/ContactImporter'; // New import for ContactImporter component

export default function Customers() {
    const [customers, setCustomers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        notes: '',
        tags: ''
    });
    const [dialogMode, setDialogMode] = useState('edit'); // 'edit' or 'import'

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [customersData, ordersData] = await Promise.all([
                Customer.list('-created_date'),
                Order.list('-created_date')
            ]);

            // Calculate stats for each customer
            const customersWithStats = customersData.map(customer => {
                const customerOrders = ordersData.filter(order => order.customer_id === customer.id);
                const completedOrders = customerOrders.filter(order => ['completed', 'confirmed', 'in_progress', 'ready'].includes(order.status));
                const totalSpent = completedOrders.reduce((sum, order) => sum + (order.quoted_price || 0), 0);

                return {
                    ...customer,
                    total_orders: customerOrders.length,
                    total_spent: totalSpent,
                    recent_orders: customerOrders.slice(0, 3)
                };
            });

            setCustomers(customersWithStats);
            setOrders(ordersData);
        } catch (error) {
            console.error('Error loading customers data:', error);
            toast.error('Failed to load customers.');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredCustomers = customers.filter(customer =>
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm)
    );

    const handleInputChange = (field, value) => {
        setFormData(prev => ({...prev, [field]: value}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const submitData = {
                ...formData,
                tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
            };

            if (editingCustomer) {
                await Customer.update(editingCustomer.id, submitData);
                toast.success('Customer updated successfully!');
            } else {
                await Customer.create(submitData);
                toast.success('Customer added successfully!');
            }

            resetForm();
            setShowDialog(false);
            loadData();
        } catch (error) {
            console.error('Error saving customer:', error);
            toast.error('Failed to save customer.');
        }
    };

    const handleEdit = (customer) => {
        setEditingCustomer(customer);
        setFormData({
            name: customer.name || '',
            email: customer.email || '',
            phone: customer.phone || '',
            notes: customer.notes || '',
            tags: Array.isArray(customer.tags) ? customer.tags.join(', ') : ''
        });
        setDialogMode('edit'); // Set dialog mode to 'edit' when editing
        setShowDialog(true);
    };

    const resetForm = () => {
        setEditingCustomer(null);
        setFormData({ name: '', email: '', phone: '', notes: '', tags: '' });
    };

    const handleNewCustomer = () => {
        resetForm();
        setDialogMode('edit'); // Set dialog mode to 'edit' when adding new customer
        setShowDialog(true);
    };

    const handleImportContacts = () => {
        setDialogMode('import'); // Set dialog mode to 'import' for importing
        setShowDialog(true);
    };

    const handleImportComplete = () => {
        loadData(); // Reload customers after import
        setShowDialog(false); // Close dialog after import
    };

    if (isLoading) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-6">
                    <div className="flex justify-between items-center">
                        <div className="bg-white rounded-xl h-12 w-64 border border-amber-200"></div>
                        <div className="bg-white rounded-xl h-12 w-32 border border-amber-200"></div>
                    </div>
                    <div className="grid gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl h-32 border border-amber-200"></div>
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <Users className="w-8 h-8 text-amber-800" />
                        <div>
                            <h1 className="text-3xl font-bold text-amber-900">Customers</h1>
                            <p className="text-amber-700 mt-1">Manage your customer relationships</p>
                        </div>
                    </div>

                    <Dialog open={showDialog} onOpenChange={setShowDialog}>
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"> {/* Group both trigger buttons */}
                            <DialogTrigger asChild>
                                <Button
                                    onClick={handleImportContacts}
                                    variant="outline"
                                    className="border-amber-300 text-amber-700 hover:bg-amber-50"
                                >
                                    <UploadCloud className="w-4 h-4 mr-2" />
                                    Import Contacts
                                </Button>
                            </DialogTrigger>

                            <DialogTrigger asChild>
                                <Button
                                    onClick={handleNewCustomer}
                                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg"
                                >
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Add Customer
                                </Button>
                            </DialogTrigger>
                        </div>

                        <DialogContent className="max-w-2xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto rounded-lg">
                            <DialogHeader>
                                <DialogTitle>
                                    {dialogMode === 'import' ? 'Import Contacts' : editingCustomer ? 'Edit Customer' : 'Add New Customer'}
                                </DialogTitle>
                            </DialogHeader>
                            <div className="p-1 md:p-6"> {/* Conditional rendering based on dialogMode */}
                                {dialogMode === 'import' ? (
                                    <ContactImporter
                                        onImportComplete={handleImportComplete}
                                        closeDialog={() => setShowDialog(false)}
                                    />
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="name">Full Name *</Label>
                                                <Input
                                                    id="name"
                                                    value={formData.name}
                                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                                    required
                                                    className="border-amber-300 focus:border-amber-500"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="email">Email *</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                                    required
                                                    className="border-amber-300 focus:border-amber-500"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                                className="border-amber-300 focus:border-amber-500"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="tags">Tags (comma separated)</Label>
                                            <Input
                                                id="tags"
                                                value={formData.tags}
                                                onChange={(e) => handleInputChange('tags', e.target.value)}
                                                placeholder="VIP, Wedding Client, Repeat Customer"
                                                className="border-amber-300 focus:border-amber-500"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="notes">Notes</Label>
                                            <Textarea
                                                id="notes"
                                                value={formData.notes}
                                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                                rows={4}
                                                placeholder="Add any notes about this customer..."
                                                className="border-amber-300 focus:border-amber-500"
                                            />
                                        </div>
                                        <div className="flex justify-end gap-3 pt-6 border-t">
                                            <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                                                Cancel
                                            </Button>
                                            <Button type="submit" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                                                {editingCustomer ? 'Update Customer' : 'Add Customer'}
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                    <div className="relative flex-1 w-full sm:max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400 w-4 h-4" />
                        <Input
                            placeholder="Search customers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 border-amber-300 focus:border-amber-500"
                        />
                    </div>
                    <div className="text-sm text-amber-600">
                        {filteredCustomers.length} of {customers.length} customers
                    </div>
                </div>

                <div className="grid gap-6">
                    {filteredCustomers.map(customer => (
                        <Card key={customer.id} className="bg-white/80 backdrop-blur-sm border-amber-200 shadow-lg hover:shadow-xl transition-shadow">
                            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                        {customer.name?.charAt(0) || 'C'}
                                    </div>
                                    <div className="min-w-0">
                                        <CardTitle className="text-amber-900 truncate">{customer.name}</CardTitle>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 text-sm text-amber-600 mt-1">
                                            {customer.email && (
                                                <div className="flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    {customer.email}
                                                </div>
                                            )}
                                            {customer.phone && (
                                                <div className="flex items-center gap-1">
                                                    <Phone className="w-3 h-3" />
                                                    {customer.phone}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <Button variant="outline" size="icon" onClick={() => handleEdit(customer)} className="self-end sm:self-center">
                                    <Edit className="w-4 h-4" />
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <CakeSlice className="w-4 h-4 text-amber-600" />
                                                <span className="text-sm text-amber-800">Total Orders</span>
                                            </div>
                                            <span className="font-bold text-amber-900">{customer.total_orders || 0}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="w-4 h-4 text-green-600" />
                                                <span className="text-sm text-green-800">Total Spent</span>
                                            </div>
                                            <span className="font-bold text-green-900">${customer.total_spent?.toLocaleString() || 0}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {customer.tags && customer.tags.length > 0 && (
                                            <div>
                                                <p className="text-sm text-amber-800 font-medium mb-2">Tags</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {customer.tags.map((tag, idx) => (
                                                        <Badge key={idx} variant="outline" className="text-xs border-amber-300 text-amber-700">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {customer.notes && (
                                            <div>
                                                <p className="text-sm text-amber-800 font-medium mb-2">Notes</p>
                                                <p className="text-sm text-amber-600 line-clamp-3">{customer.notes}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <p className="text-sm text-amber-800 font-medium">Recent Orders</p>
                                        {customer.recent_orders && customer.recent_orders.length > 0 ? (
                                            <div className="space-y-2">
                                                {customer.recent_orders.map(order => (
                                                    <div key={order.id} className="p-2 bg-amber-50 rounded text-xs">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <Badge variant="outline" className="capitalize text-xs">
                                                                {order.status}
                                                            </Badge>
                                                            <span className="text-amber-600">
                                                                {order.event_date ? new Date(order.event_date).toLocaleDateString() : ''}
                                                            </span>
                                                        </div>
                                                        <p className="text-amber-800 truncate">{order.cake_description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-amber-400 italic">No orders yet</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {filteredCustomers.length === 0 && !isLoading && (
                    <div className="text-center py-12">
                        <Users className="w-24 h-24 mx-auto mb-4 text-amber-400 opacity-50" />
                        <h3 className="text-xl font-semibold text-amber-800 mb-2">
                            {searchTerm ? 'No customers found' : 'No customers yet'}
                        </h3>
                        <p className="text-amber-600">
                            {searchTerm
                                ? 'Try adjusting your search terms'
                                : 'Start building your customer base by adding your first customer'
                            }
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}
