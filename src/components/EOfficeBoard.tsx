"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { FileText, Plus, ArrowRight, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';

export default function EOfficeBoard({ departmentId }: { departmentId: string }) {
    const [files, setFiles] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Create File State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newFileTitle, setNewFileTitle] = useState('');
    const [newFileDesc, setNewFileDesc] = useState('');
    const [newFilePriority, setNewFilePriority] = useState('Medium');

    // View/Move File State
    const [selectedFile, setSelectedFile] = useState<any>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [moveNote, setMoveNote] = useState('');

    useEffect(() => {
        if (departmentId) fetchFiles();
    }, [departmentId]);

    const fetchFiles = async () => {
        try {
            setIsLoading(true);
            const { data } = await axios.get(`/api/admin/files?departmentId=${departmentId}`);
            setFiles(data);
        } catch (error) {
            console.error("Failed to fetch files", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateFile = async () => {
        if (!newFileTitle || !newFileDesc) return;
        try {
            await axios.post('/api/admin/files', {
                title: newFileTitle,
                description: newFileDesc,
                priority: newFilePriority,
                departmentId
            });
            setIsCreateOpen(false);
            setNewFileTitle('');
            setNewFileDesc('');
            fetchFiles();
            alert("File created successfully.");
        } catch (error) {
            alert("Failed to create file.");
        }
    };

    const handleMoveFile = async (newStatus: string) => {
        if (!selectedFile) return;
        try {
            await axios.patch('/api/admin/files', {
                id: selectedFile._id,
                status: newStatus,
                notes: moveNote
            });
            setIsViewOpen(false);
            setMoveNote('');
            setSelectedFile(null);
            fetchFiles();
        } catch (error) {
            alert("Failed to update status.");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Draft': return 'bg-gray-100 text-gray-800';
            case 'In Review': return 'bg-blue-100 text-blue-800';
            case 'Pending Approval': return 'bg-orange-100 text-orange-800';
            case 'Approved': return 'bg-green-100 text-green-800';
            case 'Rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'High': return 'text-red-600 bg-red-50 border-red-200';
            case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'Low': return 'text-green-600 bg-green-50 border-green-200';
            default: return 'text-gray-600';
        }
    };

    // Group files by stage for the board view
    const stages = ['Draft', 'In Review', 'Pending Approval', 'Approved'];

    return (
        <div className="space-y-8 animate-in bg-black p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end bg-zinc-950/50 p-6 md:p-8 rounded-[2rem] border border-red-900/20 shadow-2xl backdrop-blur-xl gap-4">
                <div>
                    <h2 className="text-[10px] font-black text-zinc-200 uppercase tracking-[0.3em] mb-1">Department Records</h2>
                    <p className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase leading-none">Digital Documents</p>
                    <p className="text-[10px] font-bold text-red-600 mt-2 uppercase tracking-widest">Document Tracking & Updates</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-[10px] tracking-widest uppercase px-8 h-12 md:h-14 shadow-[0_10px_30px_rgba(239,68,68,0.2)] transition-all active:scale-95">
                    <Plus className="mr-2 h-4 w-4" /> CREATE DOCUMENT
                </Button>
            </div>

            {/* Kanban Board Layout */}
            <div className="flex md:grid md:grid-cols-4 gap-6 pb-4 overflow-x-auto md:overflow-x-visible pb-8 md:pb-0 snap-x">
                {stages.map((stage, idx) => (
                    <div key={stage} className="min-w-[280px] md:min-w-0 bg-zinc-950/30 backdrop-blur-md rounded-[2rem] p-6 border border-red-900/10 flex flex-col h-[600px] md:h-[680px] shadow-sm animate-in snap-center" style={{ animationDelay: `${idx * 0.1}s` }}>
                        <div className="flex justify-between items-center mb-6 px-1">
                            <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-200">{stage}</h3>
                            <span className="h-6 w-6 rounded-lg bg-red-950/30 border border-red-900/30 flex items-center justify-center text-[10px] font-black text-red-500 shadow-sm">{files.filter(f => f.status === stage).length}</span>
                        </div>

                        <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            {files.filter(f => f.status === stage).length === 0 && (
                                <div className="flex flex-col items-center justify-center h-32 text-center opacity-40">
                                    <div className="h-0.5 w-6 bg-red-900 rounded-full mb-3" />
                                    <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">No Documents</p>
                                </div>
                            )}
                            {files.filter(f => f.status === stage).map(file => (
                                <div
                                    key={file._id}
                                    className="group cursor-pointer bg-zinc-950/40 p-5 rounded-2xl border border-red-900/10 shadow-sm transition-all hover:border-red-600/30 hover:bg-red-900/5 hover:-translate-y-1"
                                    onClick={() => { setSelectedFile(file); setIsViewOpen(true); }}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">DOC-ID-{file.referenceNumber.split('-').pop()}</span>
                                            <div className="h-0.5 w-3 bg-red-900/50 mt-1" />
                                        </div>
                                        <span className={cn(
                                            "text-[8px] font-black px-2 py-0.5 rounded-md border uppercase tracking-[0.15em]",
                                            file.priority === 'High' ? "bg-red-600/10 text-red-500 border-red-600/20" :
                                            file.priority === 'Medium' ? "bg-amber-600/10 text-amber-500 border-amber-600/20" :
                                            "bg-emerald-600/10 text-emerald-500 border-emerald-600/20"
                                        )}>
                                            {file.priority}
                                        </span>
                                    </div>
                                    <h4 className="font-black text-sm text-white mb-2 line-clamp-2 leading-tight group-hover:text-red-500 transition-colors uppercase tracking-tight">{file.title}</h4>
                                    <p className="text-[11px] text-zinc-200 line-clamp-2 mb-4 leading-relaxed font-medium italic">"{file.description}"</p>
                                    <div className="flex items-center justify-between border-t border-red-900/5 pt-3">
                                        <div className="flex items-center gap-1.5 text-[9px] font-black text-zinc-200 uppercase tracking-widest">
                                            <Clock className="h-3 w-3" />
                                            {new Date(file.updatedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                        </div>
                                        <div className="h-6 w-6 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-300 group-hover:text-red-500 group-hover:bg-red-900/20 transition-all">
                                            <ArrowRight className="h-3 w-3" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Create File Modal */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="bg-zinc-950 border-red-900/30 text-white rounded-[2rem] overflow-hidden">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase tracking-tight">Create New Document</DialogTitle>
                        <DialogDescription className="text-zinc-300 font-bold text-xs uppercase tracking-widest">Register a digital document to track approvals.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-300 uppercase tracking-widest ml-1">Document Title</label>
                            <Input value={newFileTitle} onChange={(e) => setNewFileTitle(e.target.value)} placeholder="ENTER DOCUMENT TITLE..." className="h-12 bg-black/40 border-red-900/30 text-white placeholder:text-zinc-800 rounded-xl focus:ring-red-600 font-bold uppercase" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-300 uppercase tracking-widest ml-1">Priority Level</label>
                            <Select value={newFilePriority} onValueChange={setNewFilePriority}>
                                <SelectTrigger className="h-12 bg-black/40 border-red-900/30 text-white rounded-xl focus:ring-red-600 font-bold">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-950 border-red-900/30 text-white">
                                    <SelectItem value="High" className="focus:bg-red-900/20">High Priority</SelectItem>
                                    <SelectItem value="Medium" className="focus:bg-red-900/20">Medium Priority</SelectItem>
                                    <SelectItem value="Low" className="focus:bg-red-900/20">Low Priority</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-300 uppercase tracking-widest ml-1">Document Description</label>
                            <Textarea value={newFileDesc} onChange={(e) => setNewFileDesc(e.target.value)} placeholder="PROVIDE DETAILS..." rows={4} className="bg-black/40 border-red-900/30 text-white placeholder:text-zinc-800 rounded-xl focus:ring-red-600 font-medium" />
                        </div>
                    </div>
                    <DialogFooter className="gap-3 pt-4">
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="border-red-900/30 text-zinc-300 hover:bg-zinc-900 font-black text-[10px] tracking-widest uppercase rounded-xl">CANCEL</Button>
                        <Button onClick={handleCreateFile} className="bg-red-600 hover:bg-red-700 text-white font-black text-[10px] tracking-widest uppercase rounded-xl h-12 px-8">CREATE DOCUMENT</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View/Move Modal */}
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="max-w-2xl bg-zinc-950 border-red-900/30 text-white rounded-[2rem] overflow-hidden">
                    <DialogHeader className="bg-red-950/20 p-8 border-b border-red-900/30 -mx-6 -mt-6">
                        <div className="flex justify-between items-start mr-4">
                            <div>
                                <DialogTitle className="text-2xl font-black uppercase tracking-tight">{selectedFile?.title}</DialogTitle>
                                <p className="text-[10px] font-black text-red-500 mt-2 tracking-[0.2em] uppercase">DOC-ID: {selectedFile?.referenceNumber}</p>
                            </div>
                            <span className={cn(
                                "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                selectedFile?.status === 'Approved' ? 'bg-emerald-600/10 text-emerald-500 border-emerald-600/20' :
                                selectedFile?.status === 'Rejected' ? 'bg-red-600/10 text-red-500 border-red-600/20' :
                                'bg-red-950/30 text-red-600 border-red-900/30'
                            )}>
                                {selectedFile?.status}
                            </span>
                        </div>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
                        <div className="space-y-6">
                            <div className="bg-black/60 p-4 rounded-xl border border-red-900/10">
                                <label className="text-[9px] font-black text-zinc-300 uppercase tracking-widest block mb-2">Description</label>
                                <p className="text-sm text-zinc-300 mt-1 whitespace-pre-wrap leading-relaxed italic">"{selectedFile?.description}"</p>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-zinc-300 uppercase tracking-widest ml-1">Add Remark</label>
                                <Textarea
                                    value={moveNote}
                                    onChange={(e) => setMoveNote(e.target.value)}
                                    placeholder="ENTER ACTION REMARK..."
                                    className="min-h-[120px] bg-black/40 border-red-900/30 text-white placeholder:text-zinc-800 rounded-xl focus:ring-red-600"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="border border-red-900/10 bg-black/40 rounded-2xl p-6">
                                <h4 className="text-[10px] font-black text-red-600 mb-4 flex items-center gap-2 uppercase tracking-widest">
                                    <Clock className="h-4 w-4" /> Update History
                                </h4>
                                <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                                    {selectedFile?.history?.slice().reverse().map((h: any, i: number) => (
                                        <div key={i} className="text-xs border-l-2 border-red-900/20 pl-4 relative pb-4 last:pb-0">
                                            <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-red-600 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                                            <p className="font-black text-white uppercase tracking-tight mb-1">{h.stage}</p>
                                            <p className="text-zinc-300 text-[9px] font-bold">{new Date(h.timestamp).toLocaleString()}</p>
                                            {h.notes && <p className="text-zinc-200 italic mt-2 text-[11px] leading-relaxed">"{h.notes}"</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="border-t border-red-900/10 pt-6 gap-3">
                        <div className="flex gap-2 w-full justify-end">
                            {selectedFile?.status === 'Draft' && (
                                <Button onClick={() => handleMoveFile('In Review')} className="bg-red-600 hover:bg-red-700 text-white font-black text-[10px] tracking-widest uppercase rounded-xl h-12 px-8 w-full sm:w-auto shadow-[0_5px_15px_rgba(239,68,68,0.2)]">
                                    FORWARD FOR REVIEW <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            )}
                            {selectedFile?.status === 'In Review' && (
                                <>
                                    <Button onClick={() => handleMoveFile('Draft')} variant="outline" className="border-red-900/30 text-zinc-300 hover:bg-zinc-900 font-black text-[10px] tracking-widest uppercase rounded-xl h-12">
                                        RETURN TO DRAFT
                                    </Button>
                                    <Button onClick={() => handleMoveFile('Pending Approval')} className="bg-red-600 hover:bg-red-700 text-white font-black text-[10px] tracking-widest uppercase rounded-xl h-12 px-8">
                                        REQUEST APPROVAL <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </>
                            )}
                            {selectedFile?.status === 'Pending Approval' && (
                                <>
                                    <Button onClick={() => handleMoveFile('In Review')} variant="outline" className="border-red-900/30 text-zinc-300 hover:bg-zinc-900 font-black text-[10px] tracking-widest uppercase rounded-xl h-12">
                                        SEND BACK
                                    </Button>
                                    <Button onClick={() => handleMoveFile('Approved')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] tracking-widest uppercase rounded-xl h-12 px-8">
                                        <CheckCircle2 className="mr-2 h-4 w-4" /> APPROVE
                                    </Button>
                                    <Button onClick={() => handleMoveFile('Rejected')} variant="destructive" className="bg-red-900 hover:bg-red-950 text-white font-black text-[10px] tracking-widest uppercase rounded-xl h-12 px-8">
                                        REJECT
                                    </Button>
                                </>
                            )}
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
