"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Shield, RefreshCw } from 'lucide-react';
import axios from 'axios';

export default function JusticeAdminDashboard() {
    const [firs, setFirs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Action State
    const [selectedFIR, setSelectedFIR] = useState<any>(null);
    const [actionNote, setActionNote] = useState('');
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);

    useEffect(() => {
        fetchAllFIRs();
    }, []);

    const fetchAllFIRs = async () => {
        try {
            setIsLoading(true);
            const { data } = await axios.get('/api/justice/firs');
            // Sort by ID descending
            setFirs(data.reverse());
        } catch (error) {
            console.error("Error fetching FIRs:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = async (status: string) => {
        if (!selectedFIR) return;

        try {
            setIsProcessing(true);
            await axios.patch('/api/justice/firs', {
                id: selectedFIR.id,
                status: status,
                notes: actionNote
            });

            alert(`FIR #${selectedFIR.id} Updated to ${status}`);
            setIsActionModalOpen(false);
            setActionNote('');
            setSelectedFIR(null);
            fetchAllFIRs();
        } catch (error: any) {
            console.error(error);
            alert("Transaction failed. Check console.");
        } finally {
            setIsProcessing(false);
        }
    };

    const openActionModal = (fir: any) => {
        setSelectedFIR(fir);
        setActionNote(fir.resolutionNotes || '');
        setIsActionModalOpen(true);
    };

    return (
        <div className="space-y-8 animate-in bg-black min-h-screen p-6">
            <Card className="overflow-hidden border border-red-900/20 bg-zinc-950/50 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-[2rem]">
                <div className="h-1.5 bg-gradient-to-r from-red-600 via-red-500 to-red-900" />
                <CardHeader className="pb-8 pt-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-900/20 rounded-2xl text-red-600 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                                <Shield className="h-6 w-6" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-black text-white tracking-tight uppercase">Investigation Registry</CardTitle>
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Case Management</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-950/30 px-3 py-1 rounded-full border border-red-900/30">Official Access</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                    <div className="space-y-6">
                        <div className="flex justify-between items-center border-b border-red-900/10 pb-4">
                            <h3 className="font-black text-[10px] text-zinc-300 uppercase tracking-widest">Active Case Records</h3>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={fetchAllFIRs} 
                                disabled={isLoading}
                                className="border-red-900/30 text-zinc-300 hover:bg-red-600 hover:text-white font-black text-[9px] uppercase tracking-widest rounded-lg transition-all"
                            >
                                <RefreshCw className={`h-3 w-3 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                Refresh Records
                            </Button>
                        </div>
                        {isLoading ? (
                            <div className="text-center py-20 bg-black/40 rounded-3xl border border-dashed border-red-900/20">
                                <RefreshCw className="h-10 w-10 text-red-900/40 animate-spin mx-auto mb-4" />
                                <p className="text-zinc-400 font-black tracking-[0.2em] text-[10px] uppercase">Loading Records...</p>
                            </div>
                        ) : firs.length === 0 ? (
                            <div className="text-center py-20 bg-black/40 rounded-3xl border border-dashed border-red-900/20">
                                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">No records found.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {firs.map((fir: any, idx: number) => (
                                    <div 
                                        key={fir.id} 
                                        className="group p-6 rounded-[1.5rem] bg-black/40 border border-red-900/10 shadow-sm flex flex-col md:flex-row gap-6 justify-between transition-all hover:border-red-600/30 hover:bg-red-900/5 animate-in"
                                        style={{ animationDelay: `${idx * 0.05}s` }}
                                    >
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <span className="font-black bg-red-600 text-white px-3 py-1 rounded-lg text-[10px] tracking-widest">RECORD-ID-#{fir.id}</span>
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                                                    fir.status === 'Open' ? 'bg-red-600/10 text-red-500 border-red-600/20' :
                                                    fir.status === 'Closed' ? 'bg-zinc-900 text-zinc-500 border-zinc-800' :
                                                    'bg-amber-600/10 text-amber-500 border-amber-600/20'
                                                }`}>{fir.status}</span>
                                                <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">
                                                    {new Date(fir.timestamp).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="p-4 rounded-xl bg-zinc-950/50 border border-red-900/10 text-sm text-zinc-200 leading-relaxed font-bold">
                                                {fir.description}
                                            </div>
                                            
                                            <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                                <div className="h-1.5 w-1.5 rounded-full bg-red-900/50" />
                                                CITIZEN ID: {fir.reporter.substring(0, 16)}...
                                            </div>

                                            {fir.resolutionNotes && (
                                                <div className="mt-4 p-4 rounded-xl bg-red-600/5 border border-red-600/10 relative">
                                                    <div className="absolute -top-2 left-4 px-2 bg-red-600 text-[10px] font-black text-white uppercase tracking-widest rounded-md shadow-[0_0_10px_rgba(220,38,38,0.3)]">Official Update</div>
                                                    <p className="text-sm text-zinc-200 font-semibold italic">"{fir.resolutionNotes}"</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-2 justify-center">
                                            <Button
                                                size="sm"
                                                className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-widest px-6 py-6 transition-all shadow-[0_5px_15px_rgba(239,68,68,0.2)] active:scale-95"
                                                onClick={() => openActionModal(fir)}
                                            >
                                                UPDATE CASE
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isActionModalOpen} onOpenChange={setIsActionModalOpen}>
                <DialogContent className="bg-zinc-950 border-red-900/30 text-white rounded-[2rem] overflow-hidden">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase tracking-tight">Update Case Status</DialogTitle>
                        <DialogDescription className="text-zinc-300 font-bold text-xs uppercase tracking-widest">
                            Record a status update in the official registry.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="bg-black/60 p-4 rounded-xl border border-red-900/10 text-sm text-zinc-200 max-h-[150px] overflow-y-auto mb-2 font-bold">
                            <strong className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Original Description</strong>
                            {selectedFIR?.description}
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-300 uppercase tracking-widest ml-1">Investigation Notes</label>
                            <Textarea
                                value={actionNote}
                                onChange={(e) => setActionNote(e.target.value)}
                                placeholder="Enter investigation details or closure reason..."
                                rows={4}
                                className="bg-black/40 border-red-900/30 text-white placeholder:text-zinc-700 rounded-xl focus:ring-red-600 focus:border-red-600 font-bold"
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-3 sm:gap-0 mt-4">
                        <div className="flex flex-col sm:flex-row justify-between w-full gap-3">
                            <Button variant="outline" onClick={() => setIsActionModalOpen(false)} className="border-red-900/30 text-zinc-300 hover:bg-zinc-900 font-black text-[10px] uppercase tracking-widest rounded-xl">CANCEL</Button>
                            <div className="flex gap-2">
                                <Button
                                    className="bg-zinc-800 hover:bg-zinc-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl px-6"
                                    onClick={() => handleAction('Investigating')}
                                    disabled={isProcessing}
                                >
                                    INVESTIGATE
                                </Button>
                                <Button
                                    className="bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl px-6"
                                    onClick={() => handleAction('Closed')}
                                    disabled={isProcessing}
                                >
                                    COMPLETE CASE
                                </Button>
                            </div>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
