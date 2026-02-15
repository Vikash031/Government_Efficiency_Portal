"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import axios from 'axios';
import { Plus, Trash2 } from 'lucide-react';

export default function ResourceTracker({ departmentId }: { departmentId: string }) {
    const [department, setDepartment] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // New Resource State
    const [newItemName, setNewItemName] = useState('');
    const [newItemAllocated, setNewItemAllocated] = useState('');

    useEffect(() => {
        if (departmentId) fetchResources();
    }, [departmentId]);

    const fetchResources = async () => {
        try {
            setIsLoading(true);
            const { data } = await axios.get(`/api/admin/resources?departmentId=${departmentId}`);
            setDepartment(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateExpenditure = async (newExp: number) => {
        try {
            const { data } = await axios.patch('/api/admin/resources', {
                departmentId,
                expenditure: newExp
            });
            setDepartment((prev: any) => ({ ...prev, expenditure: data.expenditure }));
        } catch (error) {
            alert("Failed to update expenditure");
        }
    };

    const handleAddResource = async () => {
        if (!newItemName || !newItemAllocated) return;

        const newResources = [
            ...(department.resources || []),
            { name: newItemName, allocated: Number(newItemAllocated), used: 0 }
        ];

        try {
            const { data } = await axios.patch('/api/admin/resources', {
                departmentId,
                resources: newResources
            });
            setDepartment((prev: any) => ({ ...prev, resources: data.resources }));
            setNewItemName('');
            setNewItemAllocated('');
        } catch (error) {
            alert("Failed to add resource");
        }
    };

    const handleUpdateResourceUsage = async (index: number, usedAmount: number) => {
        const updatedResources = [...department.resources];
        updatedResources[index].used = usedAmount;

        try {
            const { data } = await axios.patch('/api/admin/resources', {
                departmentId,
                resources: updatedResources
            });
            setDepartment((prev: any) => ({ ...prev, resources: data.resources }));
        } catch (error) {
            alert("Failed to update usage");
        }
    };

    if (isLoading) return <div>Loading resources...</div>;
    if (!department) return <div>No data available</div>;

    const budgetData = [
        { name: 'Utilized', value: department.expenditure },
        { name: 'Remaining', value: Math.max(0, department.budget - department.expenditure) }
    ];
    const COLORS = ['#ef4444', '#22c55e']; // Red for used, Green for remaining

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Resource Allocation & Budget</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Budget Overview */}
                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle>Financial Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="h-[200px] w-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={budgetData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {budgetData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-4 flex-1 w-full">
                                <div>
                                    <p className="text-sm text-gray-500">Total Budget</p>
                                    <p className="text-2xl font-bold text-gray-800">₹{department.budget.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Expenditure (To Date)</p>
                                    <div className="flex gap-2">
                                        <Input
                                            type="number"
                                            value={department.expenditure ?? 0}
                                            onChange={(e) => setDepartment((prev: any) => ({ ...prev, expenditure: Number(e.target.value) }))}
                                            onBlur={(e) => handleUpdateExpenditure(Number(e.target.value))}
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                                <div className="text-sm">
                                    <span className="text-green-600 font-bold">
                                        {((department.budget - department.expenditure) / department.budget * 100).toFixed(1)}%
                                    </span> Remaining
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Resource Chart */}
                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle>Resource Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        {department.resources && department.resources.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={department.resources}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="allocated" fill="#8884d8" name="Allocated" />
                                    <Bar dataKey="used" fill="#82ca9d" name="Used" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                No specific resources allocated yet.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Inventory / Resource List */}
            <Card>
                <CardHeader>
                    <CardTitle>Department Resources Inventory</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="mb-6 flex gap-2 items-end bg-gray-50 p-4 rounded-lg">
                        <div className="space-y-1 flex-1">
                            <label className="text-xs font-bold text-gray-600">Resource Name</label>
                            <Input placeholder="e.g. Office Laptops" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} />
                        </div>
                        <div className="space-y-1 w-32">
                            <label className="text-xs font-bold text-gray-600">Quantity/Budget</label>
                            <Input type="number" placeholder="100" value={newItemAllocated} onChange={(e) => setNewItemAllocated(e.target.value)} />
                        </div>
                        <Button onClick={handleAddResource} className="bg-indigo-600 hover:bg-indigo-700">
                            <Plus className="mr-2 h-4 w-4" /> Add
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {department.resources?.map((res: any, index: number) => (
                            <div key={index} className="flex items-center gap-4 border p-4 rounded-lg bg-white">
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1">
                                        <span className="font-bold text-gray-800">{res.name}</span>
                                        <span className="text-xs text-gray-500">{res.used} / {res.allocated} units</span>
                                    </div>
                                    <Progress value={(res.used / res.allocated) * 100} className="h-2" />
                                </div>
                                <div className="w-24">
                                    <label className="text-[10px] text-gray-400 block">Update Usage</label>
                                    <Input
                                        type="number"
                                        className="h-8 text-sm"
                                        value={res.used ?? 0}
                                        onChange={(e) => {
                                            const val = Number(e.target.value);
                                            // Handle local update for smooth UI, then DB
                                            const updated = [...department.resources];
                                            updated[index].used = val;
                                            setDepartment({ ...department, resources: updated });
                                        }}
                                        onBlur={(e) => handleUpdateResourceUsage(index, Number(e.target.value))}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
