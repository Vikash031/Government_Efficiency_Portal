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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">e-Office File System</h2>
                    <p className="text-gray-500 text-sm">Digital File Movement & Tracking</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="mr-2 h-4 w-4" /> Create New File
                </Button>
            </div>

            {/* Kanban Board Layout */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto pb-4">
                {stages.map(stage => (
                    <div key={stage} className="bg-gray-50 rounded-lg p-4 min-w-[250px] border border-gray-200 flex flex-col h-[600px]">
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
                            <h3 className="font-semibold text-gray-700">{stage}</h3>
                            <Badge variant="secondary" className="bg-white">{files.filter(f => f.status === stage).length}</Badge>
                        </div>

                        <div className="space-y-3 flex-1 overflow-y-auto">
                            {files.filter(f => f.status === stage).length === 0 && (
                                <p className="text-xs text-gray-400 text-center italic mt-10">No files</p>
                            )}
                            {files.filter(f => f.status === stage).map(file => (
                                <Card
                                    key={file._id}
                                    className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-indigo-500"
                                    onClick={() => { setSelectedFile(file); setIsViewOpen(true); }}
                                >
                                    <CardContent className="p-3">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] font-mono text-gray-500">{file.referenceNumber}</span>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getPriorityColor(file.priority)}`}>
                                                {file.priority}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-sm text-gray-800 mb-1 line-clamp-2 leading-tight">{file.title}</h4>
                                        <p className="text-xs text-gray-500 line-clamp-2 mb-2">{file.description}</p>
                                        <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                            <Clock className="h-3 w-3" />
                                            {new Date(file.updatedAt).toLocaleDateString()}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Create File Modal */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Initiate New Government File</DialogTitle>
                        <DialogDescription>Create a digital file to track movement and approvals.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Subject / Title</label>
                            <Input value={newFileTitle} onChange={(e) => setNewFileTitle(e.target.value)} placeholder="e.g. Budget Approval for Q3" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Priority</label>
                            <Select value={newFilePriority} onValueChange={setNewFilePriority}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="High">High Priority</SelectItem>
                                    <SelectItem value="Medium">Medium Priority</SelectItem>
                                    <SelectItem value="Low">Low Priority</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description / Minute</label>
                            <Textarea value={newFileDesc} onChange={(e) => setNewFileDesc(e.target.value)} placeholder="File details..." rows={4} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateFile} className="bg-indigo-600 hover:bg-indigo-700">Create File</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View/Move Modal */}
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <div className="flex justify-between items-start mr-4">
                            <div>
                                <DialogTitle className="text-xl">{selectedFile?.title}</DialogTitle>
                                <p className="text-sm text-gray-500 mt-1 font-mono">{selectedFile?.referenceNumber}</p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(selectedFile?.status || '')}`}>
                                {selectedFile?.status}
                            </span>
                        </div>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-3 rounded border">
                                <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                                <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{selectedFile?.description}</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Add Minute / Note</label>
                                <Textarea
                                    value={moveNote}
                                    onChange={(e) => setMoveNote(e.target.value)}
                                    placeholder="Add reasoning for movement..."
                                    className="min-h-[100px]"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="border rounded-lg p-3">
                                <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                    <Clock className="h-4 w-4" /> Movement History
                                </h4>
                                <div className="space-y-3 max-h-[200px] overflow-y-auto">
                                    {selectedFile?.history?.slice().reverse().map((h: any, i: number) => (
                                        <div key={i} className="text-xs border-l-2 border-gray-200 pl-3 relative">
                                            <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-gray-400"></div>
                                            <p className="font-semibold text-gray-800">{h.stage}</p>
                                            <p className="text-gray-500">{new Date(h.timestamp).toLocaleString()}</p>
                                            {h.notes && <p className="text-gray-600 italic mt-1">"{h.notes}"</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <div className="flex gap-2 w-full justify-end">
                            {selectedFile?.status === 'Draft' && (
                                <Button onClick={() => handleMoveFile('In Review')} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                                    Send for Review <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            )}
                            {selectedFile?.status === 'In Review' && (
                                <>
                                    <Button onClick={() => handleMoveFile('Draft')} variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                                        Return to Draft
                                    </Button>
                                    <Button onClick={() => handleMoveFile('Pending Approval')} className="bg-orange-600 hover:bg-orange-700">
                                        Request Approval <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </>
                            )}
                            {selectedFile?.status === 'Pending Approval' && (
                                <>
                                    <Button onClick={() => handleMoveFile('In Review')} variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50">
                                        Send Back
                                    </Button>
                                    <Button onClick={() => handleMoveFile('Approved')} className="bg-green-600 hover:bg-green-700">
                                        <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
                                    </Button>
                                    <Button onClick={() => handleMoveFile('Rejected')} variant="destructive">
                                        Reject
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
