"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
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
        <div className="space-y-6">
            <Card className="border-t-4 border-t-indigo-800 shadow-lg">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-indigo-900">Police Blockchain Admin</CardTitle>
                            <p className="text-sm text-gray-500">Decentralized FIR Management Registry</p>
                        </div>
                        <div className="text-right">
                            <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">Admin Access Granted</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">All FIR Records (On-Chain)</h3>
                            <Button variant="outline" size="sm" onClick={fetchAllFIRs} disabled={isLoading}>
                                🔄 Refresh Chain Data
                            </Button>
                        </div>

                        {isLoading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-800 mx-auto mb-2"></div>
                                <p className="text-gray-500">Syncing with Ethereum blockchain...</p>
                            </div>
                        ) : firs.length === 0 ? (
                            <p className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed">No FIRs recorded onchain yet.</p>
                        ) : (
                            <div className="grid gap-4">
                                {firs.map((fir: any) => (
                                    <div key={fir.id} className="border p-4 rounded-lg bg-white shadow-sm flex flex-col md:flex-row gap-4 justify-between transition-all hover:bg-gray-50">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-mono bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded text-xs font-bold">#{fir.id}</span>
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${fir.status === 'Open' ? 'bg-green-100 text-green-800' :
                                                        fir.status === 'Closed' ? 'bg-red-100 text-red-800' :
                                                            fir.status === 'Review Requested' ? 'bg-orange-100 text-orange-800' :
                                                                'bg-blue-100 text-blue-800'
                                                    }`}>{fir.status}</span>
                                                <span className="text-xs text-gray-500 flex items-center">
                                                    ⏰ {new Date(fir.timestamp).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-gray-900 font-medium whitespace-pre-wrap text-sm">{fir.description}</p>

                                            <div className="flex gap-4 text-xs text-gray-500 font-mono mt-1">
                                                <span>Reporter: {fir.reporter.substring(0, 8)}...</span>
                                            </div>

                                            {fir.resolutionNotes && (
                                                <div className="bg-white p-2 rounded text-xs text-gray-700 border border-gray-200 mt-2">
                                                    <span className="font-bold text-indigo-700">Official Note:</span> {fir.resolutionNotes}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-2 justify-center min-w-[140px]">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="w-full text-indigo-700 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-800"
                                                onClick={() => openActionModal(fir)}
                                            >
                                                Update Status
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
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update FIR Status</DialogTitle>
                        <DialogDescription>
                            This action will record a status update transaction on the blockchain.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-700 max-h-[100px] overflow-y-auto mb-2">
                            <strong>Original Description:</strong><br />
                            {selectedFIR?.description}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Resolution / Update Notes</label>
                            <Textarea
                                value={actionNote}
                                onChange={(e) => setActionNote(e.target.value)}
                                placeholder="Enter investigation details, case numbers, or closure reason..."
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <div className="flex flex-col sm:flex-row justify-between w-full gap-3">
                            <Button variant="outline" onClick={() => setIsActionModalOpen(false)}>Cancel</Button>
                            <div className="flex gap-2">
                                <Button
                                    className="bg-blue-600 hover:bg-blue-700 text-white flex-1 sm:flex-none"
                                    onClick={() => handleAction('Investigating')}
                                    disabled={isProcessing}
                                >
                                    Start Investigation
                                </Button>
                                <Button
                                    className="bg-red-600 hover:bg-red-700 text-white flex-1 sm:flex-none"
                                    onClick={() => handleAction('Closed')}
                                    disabled={isProcessing}
                                >
                                    Close Case
                                </Button>
                            </div>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
