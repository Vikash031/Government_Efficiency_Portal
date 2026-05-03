"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import axios from 'axios';
import { Plus, Trash2, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

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
        <div className="space-y-8 animate-in bg-black p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950/50 p-6 rounded-[2rem] border border-red-900/10">
                <div>
                    <h2 className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em] mb-1">Resource Management</h2>
                    <p className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase leading-none">Department Resources</p>
                </div>
                <div className="flex items-center gap-3 bg-red-600 text-white px-6 py-3 rounded-2xl shadow-[0_10px_30px_rgba(239,68,68,0.2)] w-fit">
                    <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Real-time Budget Tracking</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Budget Overview */}
                <Card className="overflow-hidden border border-red-900/20 bg-zinc-950/50 backdrop-blur-xl shadow-2xl rounded-[2rem]">
                    <div className="h-1 bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                    <CardHeader>
                        <CardTitle className="text-white font-black tracking-widest text-xs uppercase opacity-70">Budget Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-8">
                        <div className="flex flex-col xl:flex-row items-center gap-8 xl:gap-12">
                            <div className="relative h-[180px] w-[180px] md:h-[220px] md:w-[220px] shrink-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={budgetData}
                                            innerRadius={60}
                                            outerRadius={85}
                                            paddingAngle={8}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {budgetData.map((_entry, index) => (
                                                <Cell key={`cell-${index}`} fill={index === 0 ? '#dc2626' : '#18181b'} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#000', border: '1px solid #991b1b', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                                            itemStyle={{ color: '#fff' }}
                                            formatter={(value: any) => `₹${(value ?? 0).toLocaleString()}`} 
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <p className="text-[8px] md:text-[10px] font-black text-zinc-300 uppercase tracking-widest">Budget Used</p>
                                    <p className="text-xl md:text-2xl font-black text-white">
                                        {((department.expenditure / department.budget) * 100).toFixed(0)}%
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-6 flex-1 w-full">
                                <div className="p-5 rounded-2xl bg-black/40 border border-red-900/10">
                                    <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest mb-1">Total Budget</p>
                                    <p className="text-2xl font-black text-white tracking-tight">₹{department.budget.toLocaleString()}</p>
                                </div>
                                <div className="p-5 rounded-2xl bg-zinc-950/40 border border-red-900/20 shadow-inner">
                                    <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest mb-3">Current Spending</p>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            value={department.expenditure ?? 0}
                                            onChange={(e) => setDepartment((prev: any) => ({ ...prev, expenditure: Number(e.target.value) }))}
                                            onBlur={(e) => handleUpdateExpenditure(Number(e.target.value))}
                                            className="w-full pl-8 font-black text-red-500 bg-black/40 border-red-900/30 rounded-xl h-12 focus:ring-red-600"
                                        />
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-red-900 font-black">₹</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-1.5 flex-1 bg-zinc-900 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-red-600 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                                            style={{ width: `${((department.budget - department.expenditure) / department.budget * 100)}%` }}
                                        />
                                    </div>
                                    <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">
                                        {((department.budget - department.expenditure) / department.budget * 100).toFixed(1)}% Available
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Resource Chart */}
                <Card className="overflow-hidden border border-red-900/20 bg-zinc-950/50 backdrop-blur-xl shadow-2xl rounded-[2rem]">
                    <div className="h-1 bg-zinc-800" />
                    <CardHeader>
                        <CardTitle className="text-white font-black tracking-widest text-xs uppercase opacity-70">Resource Usage</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] pb-8">
                        {department.resources && department.resources.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={department.resources} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#18181b" />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 9, fontWeight: 900, fill: '#52525b', textTransform: 'uppercase' }} 
                                    />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#52525b' }} />
                                    <Tooltip 
                                        cursor={{ fill: '#18181b' }}
                                        contentStyle={{ backgroundColor: '#000', border: '1px solid #991b1b', borderRadius: '16px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', paddingTop: '20px' }} />
                                    <Bar dataKey="allocated" fill="#18181b" radius={[4, 4, 0, 0]} name="Allocated" />
                                    <Bar dataKey="used" fill="#dc2626" radius={[4, 4, 0, 0]} name="Used" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full opacity-30">
                                <div className="h-0.5 w-8 bg-zinc-800 rounded-full mb-4" />
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-300">Inventory Offline</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Inventory / Resource List */}
            <Card className="overflow-hidden border border-red-900/20 bg-zinc-950/50 backdrop-blur-xl shadow-2xl rounded-[2rem]">
                <CardHeader className="bg-black/40 border-b border-red-900/10 py-6 px-6 md:px-8">
                    <CardTitle className="text-white font-black tracking-tight text-lg uppercase flex items-center gap-3">
                        <Database className="h-5 w-5 text-red-600" />
                        Resource List
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-8 px-4 md:px-8">
                    <div className="mb-10 flex flex-col md:flex-row gap-6 items-end bg-black/40 p-6 md:p-8 rounded-3xl border border-red-900/10 shadow-inner">
                        <div className="space-y-3 flex-1 w-full">
                            <label className="text-[10px] font-black text-zinc-300 uppercase tracking-widest ml-1">Resource Name</label>
                            <Input 
                                placeholder="ENTER ASSET NAME..." 
                                value={newItemName} 
                                onChange={(e) => setNewItemName(e.target.value)} 
                                className="bg-zinc-950/40 border-red-900/30 rounded-xl h-14 font-bold text-white uppercase tracking-tight focus:ring-red-600"
                            />
                        </div>
                        <div className="space-y-3 w-full md:w-48">
                            <label className="text-[10px] font-black text-zinc-300 uppercase tracking-widest ml-1">Quantity</label>
                            <Input 
                                type="number" 
                                placeholder="00" 
                                value={newItemAllocated} 
                                onChange={(e) => setNewItemAllocated(e.target.value)} 
                                className="bg-zinc-950/40 border-red-900/30 rounded-xl h-14 font-black text-red-500 text-center focus:ring-red-600"
                            />
                        </div>
                        <Button onClick={handleAddResource} className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-[10px] tracking-widest uppercase px-10 h-14 shadow-[0_10px_30px_rgba(239,68,68,0.2)] transition-all active:scale-95 w-full md:w-auto">
                            <Plus className="mr-2 h-5 w-5" /> ADD RESOURCE
                        </Button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {department.resources?.map((res: any, index: number) => (
                            <div key={index} className="group flex flex-col gap-5 p-6 rounded-2xl bg-black/40 border border-red-900/10 shadow-sm transition-all hover:border-red-600/30 hover:bg-red-900/5">
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-red-600 uppercase tracking-widest mb-1">Resource Item</span>
                                        <h4 className="font-black text-white tracking-tight uppercase">{res.name}</h4>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">Utilization</span>
                                        <p className="text-sm font-black text-white">{res.used} <span className="text-red-900">/</span> {res.allocated}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-red-900/10 shadow-inner">
                                        <div 
                                            className={cn(
                                                "h-full rounded-full transition-all duration-1000",
                                                (res.used / res.allocated) > 0.9 ? "bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]" : 
                                                (res.used / res.allocated) > 0.7 ? "bg-amber-600" : "bg-zinc-700"
                                            )}
                                            style={{ width: `${Math.min(100, (res.used / res.allocated) * 100)}%` }}
                                        />
                                    </div>
                                    <div className="flex items-center gap-4 bg-zinc-950/40 p-4 rounded-xl border border-red-900/5">
                                        <div className="flex-1">
                                            <p className="text-[8px] font-black text-zinc-300 uppercase tracking-[0.2em] mb-2">Update Status</p>
                                            <Input
                                                type="number"
                                                className="h-10 text-sm font-black bg-black/40 border-red-900/30 rounded-lg text-white text-center focus:ring-red-600"
                                                value={res.used ?? 0}
                                                onChange={(e) => {
                                                    const val = Number(e.target.value);
                                                    const updated = [...department.resources];
                                                    updated[index].used = val;
                                                    setDepartment({ ...department, resources: updated });
                                                }}
                                                onBlur={(e) => handleUpdateResourceUsage(index, Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="h-10 w-10 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-300 group-hover:bg-red-600 group-hover:text-white transition-all shadow-inner">
                                            <Database className="h-4 w-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
