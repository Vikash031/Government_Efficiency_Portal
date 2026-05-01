
"use client";

import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Shield, X, AlertCircle } from 'lucide-react';
import axios from 'axios';

interface MessageCardProps {
    isOpen: boolean;
    onClose: () => void;
    recipient: {
        _id: string;
        name: string;
        role: string;
        email: string;
    };
    departmentId: string;
    onSuccess: () => void;
}

export default function MessageCard({ isOpen, onClose, recipient, departmentId, onSuccess }: MessageCardProps) {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (!user._id) {
                setError('Please login first');
                setLoading(false);
                return;
            }

            await axios.post('/api/grievances', {
                title: `Private: ${title}`,
                description: message,
                department: departmentId,
                raisedBy: user._id,
                addressedTo: recipient._id,
                isAnonymous: isAnonymous
            });

            // Success - reset form and close
            setTitle('');
            setMessage('');
            setIsAnonymous(false);
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            setError(error.response?.data?.message || 'Error sending message');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-300 p-4">
            <div className="w-full max-w-xl animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
                <Card className="overflow-hidden border border-red-900/30 shadow-[0_0_50px_rgba(0,0,0,1)] bg-zinc-950/90 backdrop-blur-2xl rounded-[2.5rem]">
                    <div className="h-1.5 bg-gradient-to-r from-red-600 via-orange-500 to-red-600" />
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-950/30 border border-red-900/30 rounded-2xl text-red-500 shadow-inner">
                                    <Shield className="h-6 w-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-black text-white tracking-tight uppercase">Direct Message</CardTitle>
                                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-0.5">Private Communication</p>
                                </div>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={onClose}
                                className="rounded-full hover:bg-red-950/30 text-zinc-500 hover:text-red-500"
                                disabled={loading}
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-950/30 border border-red-600/50 text-red-500 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wide flex items-center gap-2 animate-in slide-in-from-top-2">
                                    <AlertCircle className="h-4 w-4" />
                                    {error}
                                </div>
                            )}

                            {/* Recipient Info Card */}
                            <div className="p-5 rounded-2xl bg-black/40 border border-red-900/10 flex items-center gap-4 group transition-all hover:bg-black/60 hover:border-red-600/30 shadow-inner">
                                <div className="h-14 w-14 rounded-2xl bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.3)] flex items-center justify-center font-black text-xl text-white transition-all">
                                    {recipient.name.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Recipient</p>
                                    <p className="text-lg font-black text-white leading-none mb-1">{recipient.name}</p>
                                    <p className="text-xs font-black text-red-500 uppercase tracking-wider">{recipient.role}</p>
                                </div>
                            </div>

                            {/* Anonymous Toggle */}
                            <div className="flex items-center justify-between p-5 bg-red-950/10 border border-red-900/20 rounded-2xl">
                                <div>
                                    <label htmlFor="anonymous" className="text-xs font-black text-white uppercase tracking-widest cursor-pointer">
                                        Anonymous Message
                                    </label>
                                    <p className="text-[10px] font-black text-zinc-500 mt-1 uppercase tracking-wider">
                                        Hide sender details from recipient
                                    </p>
                                </div>
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        id="anonymous"
                                        checked={isAnonymous}
                                        onChange={(e) => setIsAnonymous(e.target.checked)}
                                        disabled={loading}
                                        className="sr-only peer"
                                    />
                                    <label
                                        htmlFor="anonymous"
                                        className="block w-14 h-8 bg-black/60 border border-red-900/30 peer-checked:bg-red-600 rounded-full cursor-pointer transition-all duration-300"
                                    >
                                        <span className="block w-6 h-6 bg-white rounded-full shadow-lg transform transition-transform duration-300 translate-x-1 translate-y-1 peer-checked:translate-x-7" />
                                    </label>
                                </div>
                            </div>

                            {/* Title Input */}
                            <div className="space-y-2">
                                <label htmlFor="title" className="text-[10px] font-black text-zinc-300 uppercase tracking-widest ml-1">
                                    Subject <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="title"
                                    placeholder="BRIEF SUBJECT"
                                    value={title}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="bg-black/40 border-red-900/30 text-white placeholder:text-zinc-700 h-14 rounded-xl focus:ring-red-600 font-bold"
                                />
                            </div>

                            {/* Message Textarea */}
                            <div className="space-y-2">
                                <label htmlFor="message" className="text-[10px] font-black text-zinc-300 uppercase tracking-widest ml-1">
                                    Message Content <span className="text-red-500">*</span>
                                </label>
                                <Textarea
                                    id="message"
                                    rows={5}
                                    placeholder="TYPE YOUR MESSAGE..."
                                    value={message}
                                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="bg-black/40 border-red-900/30 text-white placeholder:text-zinc-700 rounded-xl focus:ring-red-600 font-bold resize-none p-4"
                                />
                                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest text-right">
                                    {message.length} CHARS
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 pt-2">
                                <Button
                                     type="button"
                                     variant="outline"
                                     onClick={onClose}
                                     disabled={loading}
                                     className="flex-1 border-red-900/30 text-zinc-400 hover:bg-zinc-900 h-14 rounded-xl font-black text-[10px] uppercase tracking-widest"
                                >
                                     Cancel
                                </Button>
                                <Button
                                     type="submit"
                                     disabled={loading}
                                     className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/30 h-14 rounded-xl font-black text-[10px] uppercase tracking-widest"
                                >
                                     {loading ? (
                                         <span className="flex items-center gap-2">
                                             <RefreshCw className="h-4 w-4 animate-spin" />
                                             SENDING...
                                         </span>
                                     ) : (
                                         <span className="flex items-center gap-2">
                                             SEND MESSAGE
                                         </span>
                                     )}
                                 </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
