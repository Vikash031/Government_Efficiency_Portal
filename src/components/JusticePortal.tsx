"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Shield, Clock, FileText, AlertTriangle, CheckCircle2, RefreshCw, MapPin, Calendar, Scale } from 'lucide-react';
import axios from 'axios';
import jsPDF from 'jspdf';

export default function JusticePortal({ user }: { user: any }) {
    const [firs, setFirs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [crimeType, setCrimeType] = useState('');
    const [state, setState] = useState('');
    const [city, setCity] = useState('');
    const [incidentDate, setIncidentDate] = useState('');
    const [description, setDescription] = useState('');

    // Real-time Clock (IST)
    const [currentTime, setCurrentTime] = useState('');

    useEffect(() => {
        fetchFIRs();
        const timer = setInterval(() => {
            const now = new Date();
            // Format to IST
            const options: Intl.DateTimeFormatOptions = {
                timeZone: 'Asia/Kolkata',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            };
            setCurrentTime(now.toLocaleTimeString('en-IN', options) + ' IST');
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchFIRs = async () => {
        try {
            setIsLoading(true);
            const { data } = await axios.get('/api/justice/firs');
            setFirs(data.reverse()); // Show newest first
            setError(null);
        } catch (error) {
            console.error("Error fetching FIRs:", error);
            setError("Failed to load blockchain records.");
        } finally {
            setIsLoading(false);
        }
    };

    const generateUniqueID = () => {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `FIR-${new Date().getFullYear()}-${timestamp}-${random}`;
    };

    const generatePDF = (firData: any, uniqueId: string) => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(220, 38, 38); // Red color
        doc.text("GOVERNMENT OF INDIA", 105, 20, { align: "center" });
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        // Header
        doc.setFontSize(22);
        doc.setTextColor(220, 38, 38); // Red color
        doc.text("GOVERNMENT OF INDIA", 105, 20, { align: "center" });
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text("INCIDENT REPORTING PORTAL", 105, 30, { align: "center" });
        doc.line(20, 35, 190, 35);

        // Official Report Title
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("Official Incident Report", 105, 50, { align: "center" });

        // Reference Info
        doc.setFontSize(10);
        doc.setFont("courier", "normal");
        doc.text(`TRACKING ID: ${uniqueId}`, 20, 65);
        doc.text(`DATE FILED: ${new Date().toLocaleString()}`, 20, 70);
        doc.text(`STATUS: PENDING REVIEW`, 20, 75);

        // Content Box
        doc.setDrawColor(0);
        doc.setFillColor(245, 245, 245);
        doc.rect(20, 85, 170, 180, 'F');

        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);

        let y = 100;
        const addLine = (label: string, value: string) => {
            doc.setFont("helvetica", "bold");
            doc.text(`${label}:`, 25, y);
            doc.setFont("helvetica", "normal");
            doc.text(value, 80, y);
            y += 10;
        };

        addLine("CITIZEN NAME", user.name || "N/A");
        addLine("EMAIL ADDRESS", user.email || "N/A");
        y += 5;
        addLine("REPORT TYPE", crimeType);
        addLine("INCIDENT DATE", incidentDate);
        addLine("LOCATION", `${city}, ${state}`);

        y += 10;
        doc.setFont("helvetica", "bold");
        doc.text("INCIDENT DETAILS:", 25, y);
        y += 10;

        doc.setFont("helvetica", "normal");
        const splitDescription = doc.splitTextToSize(description, 160);
        doc.text(splitDescription, 25, y);

        // Footer
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("System Generated Report via Official Portal.", 105, 280, { align: "center" });
        doc.text("Verify authenticity using the provided Tracking ID on the portal.", 105, 285, { align: "center" });

        doc.save(`${uniqueId}_Report.pdf`);
    };

    const fileFIR = async () => {
        if (!description || !crimeType || !state || !city || !incidentDate) {
            alert("Please fill in all required fields.");
            return;
        }

        try {
            setIsSubmitting(true);
            const uniqueId = generateUniqueID();

            // Generate PDF immediately for the user
            if (confirm("Would you like to download a PDF copy of your report now?")) {
                generatePDF({ description, crimeType, state, city, incidentDate }, uniqueId);
            }

            // Construct a structured report for the system
            const structuredReport = `
**OFFICIAL INCIDENT REPORT**
-----------------------
ID: ${uniqueId}
Type: ${crimeType}
Location: ${city}, ${state}
Date of Incident: ${incidentDate}
Citizen: ${user.name || 'Citizen'} (${user.email || 'N/A'})

**DETAILS**
${description}
            `.trim();

            await axios.post('/api/justice/firs', { description: structuredReport });

            // Reset Form via individual setters
            setDescription('');
            setCrimeType('');
            setState('');
            setCity('');
            setIncidentDate('');

            alert(`Report Filed Successfully! Tracking ID: ${uniqueId}`);
            fetchFIRs();
        } catch (error) {
            console.error(error);
            alert("Error filing report. Please check connection.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 animate-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="p-4 md:p-6 rounded-2xl bg-zinc-950/50 border border-red-900/20 backdrop-blur-md shadow-2xl transition-all hover:border-red-500/30 group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-black text-zinc-200 uppercase tracking-widest">Portal Status</p>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                <span className="text-white font-black uppercase tracking-tight">Active</span>
                            </div>
                        </div>
                        <div className="p-3 bg-red-950/30 border border-red-900/30 rounded-xl text-red-500 group-hover:scale-110 transition-all duration-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                            <Shield className="h-6 w-6" />
                        </div>
                    </div>
                </div>

                <div className="p-4 md:p-6 rounded-2xl bg-zinc-950/50 border border-red-900/20 backdrop-blur-md shadow-2xl transition-all hover:border-red-500/30 group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-black text-zinc-200 uppercase tracking-widest">Total Reports</p>
                            <p className="text-2xl md:text-3xl font-black text-white mt-1 tracking-tighter">{firs.length}</p>
                        </div>
                        <div className="p-3 bg-red-950/30 border border-red-900/30 rounded-xl text-red-500 group-hover:scale-110 transition-all duration-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                            <FileText className="h-6 w-6" />
                        </div>
                    </div>
                </div>

                <div className="p-4 md:p-6 rounded-2xl bg-zinc-950/50 border border-red-900/20 backdrop-blur-md shadow-2xl transition-all hover:border-red-500/30 group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-black text-zinc-200 uppercase tracking-widest">Current Time</p>
                            <p className="text-lg md:text-xl font-black text-white mt-1 font-mono tracking-tighter">{currentTime || "--:--:--"}</p>
                        </div>
                        <div className="p-3 bg-red-950/30 border border-red-900/30 rounded-xl text-red-500 group-hover:scale-110 transition-all duration-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                            <Clock className="h-6 w-6" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Filing Form */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="overflow-hidden bg-zinc-950/50 border border-red-900/20 backdrop-blur-md shadow-2xl rounded-[2rem]">
                        <div className="h-1.5 bg-red-500" />
                        <CardHeader className="p-6 md:p-8 md:pb-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-950/30 border border-red-900/30 rounded-2xl text-red-500 shrink-0">
                                    <Scale className="h-5 w-5 md:h-6 md:w-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl md:text-2xl font-black text-white tracking-tight uppercase">Report an Incident</CardTitle>
                                    <CardDescription className="text-zinc-300 font-bold text-xs">Securely report an incident to the authorities for review.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 md:p-8 md:pt-6 space-y-6 md:space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-zinc-200 uppercase tracking-[0.2em] ml-1">Category of Issue</Label>
                                    <Select onValueChange={setCrimeType} value={crimeType}>
                                        <SelectTrigger className="bg-black/40 border-red-900/30 text-white h-12 md:h-14 rounded-2xl focus:ring-red-600 font-bold px-4 md:px-6">
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-950 border-red-900/30 text-white rounded-xl">
                                            <SelectItem value="Theft">Theft / Burglary</SelectItem>
                                            <SelectItem value="Assault">Assault / Battery</SelectItem>
                                            <SelectItem value="Fraud">Fraud / Cybercrime</SelectItem>
                                            <SelectItem value="Harassment">Harassment</SelectItem>
                                            <SelectItem value="Vandalism">Property Damage</SelectItem>
                                            <SelectItem value="Missing Person">Missing Person</SelectItem>
                                            <SelectItem value="Traffic">Traffic Violation</SelectItem>
                                            <SelectItem value="Other">Other Category</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-zinc-200 uppercase tracking-[0.2em] ml-1">Date of Incident</Label>
                                    <div className="relative group">
                                        <Input
                                            type="date"
                                            className="bg-black/40 border-red-900/30 text-white h-12 md:h-14 rounded-2xl focus:ring-red-600 pl-12 font-bold transition-all group-hover:border-red-900/50"
                                            value={incidentDate}
                                            onChange={(e) => setIncidentDate(e.target.value)}
                                        />
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-300 pointer-events-none group-hover:text-red-500 transition-colors" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-zinc-200 uppercase tracking-[0.2em] ml-1">State</Label>
                                    <Select onValueChange={setState} value={state}>
                                        <SelectTrigger className="bg-black/40 border-red-900/30 text-white h-12 md:h-14 rounded-2xl focus:ring-red-600 font-bold px-4 md:px-6">
                                            <SelectValue placeholder="Select State" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-950 border-red-900/30 text-white rounded-xl">
                                            <SelectItem value="Delhi">Delhi</SelectItem>
                                            <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                                            <SelectItem value="Karnataka">Karnataka</SelectItem>
                                            <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
                                            <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                                            <SelectItem value="West Bengal">West Bengal</SelectItem>
                                            <SelectItem value="Gujarat">Gujarat</SelectItem>
                                            <SelectItem value="Telangana">Telangana</SelectItem>
                                            <SelectItem value="Other">Other State</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-zinc-200 uppercase tracking-[0.2em] ml-1">City / District</Label>
                                    <div className="relative group">
                                        <Input
                                            placeholder="e.g. South Delhi"
                                            className="bg-black/40 border-red-900/30 text-white h-12 md:h-14 rounded-2xl focus:ring-red-600 pl-12 font-bold transition-all group-hover:border-red-900/50"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                        />
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-300 pointer-events-none group-hover:text-red-500 transition-colors" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-zinc-200 uppercase tracking-[0.2em] ml-1">Incident Details</Label>
                                <Textarea
                                    placeholder="Provide a comprehensive description of the event..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="bg-black/40 border-red-900/30 text-white min-h-[180px] rounded-[1.5rem] focus:ring-red-600 p-6 font-bold leading-relaxed resize-none transition-all shadow-inner"
                                />
                            </div>

                            <div className="bg-red-950/20 border border-red-900/30 rounded-2xl p-6 flex gap-4 text-red-500 items-start">
                                <AlertTriangle className="h-6 w-6 shrink-0 text-red-600" />
                                <div className="text-xs font-bold leading-relaxed">
                                    <strong className="text-red-600 uppercase tracking-widest block mb-1">Attention:</strong> False reporting is a punishable offense. 
                                    Ensure all details are accurate before submitting this report to the authorities.
                                </div>
                            </div>

                            <Button
                                onClick={fileFIR}
                                disabled={isSubmitting}
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-black h-16 text-xs uppercase tracking-[0.3em] rounded-2xl shadow-[0_10px_30px_rgba(255,0,0,0.2)] transition-all hover:scale-[1.01] active:scale-[0.98]"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-3">
                                        <RefreshCw className="h-5 w-5 animate-spin" />
                                        Processing...
                                    </span>
                                ) : "Submit Report Now"}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: History */}
                <div className="lg:col-span-1">
                    <Card className="overflow-hidden bg-zinc-950/50 border border-red-900/20 backdrop-blur-md shadow-2xl flex flex-col h-full rounded-[2rem]">
                        <CardHeader className="p-8 pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl font-black text-white tracking-tight uppercase">Recent Reports</CardTitle>
                                <Button variant="ghost" size="icon" onClick={fetchFIRs} disabled={isLoading} className="h-10 w-10 text-zinc-200 hover:text-red-500 hover:bg-red-950/30 rounded-xl transition-all">
                                    <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0 flex-1 overflow-hidden flex flex-col p-0 px-6 pb-6">
                            {error && (
                                <div className="mx-2 mb-4 p-4 bg-red-950/20 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl border border-red-900/30 flex items-center gap-3">
                                    <AlertTriangle className="h-4 w-4" /> {error}
                                </div>
                            )}

                            <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[700px] scrollbar-thin scrollbar-thumb-red-900/30">
                                {firs.length === 0 && !isLoading ? (
                                    <div className="text-center py-20 text-zinc-300">
                                        <div className="h-16 w-16 bg-black/40 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-red-900/10">
                                            <FileText className="h-8 w-8 opacity-20" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest">No records found</p>
                                    </div>
                                ) : (
                                    firs.map((fir: any, idx: number) => (
                                        <div 
                                            key={fir.id} 
                                            className="bg-black/60 border border-red-900/10 hover:border-red-500/40 transition-all group p-5 rounded-[1.5rem] relative overflow-hidden animate-in"
                                            style={{ animationDelay: `${idx * 0.05}s` }}
                                        >
                                            <div className="absolute top-0 left-0 w-1 h-full bg-red-900/30 group-hover:bg-red-500 transition-colors" />
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="text-[10px] font-black text-red-500/50 bg-red-950/20 px-2 py-0.5 rounded border border-red-900/30">
                                                    ID-{fir.id}
                                                </span>
                                                <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase border ${
                                                    fir.status === 'Open' ? 'border-emerald-900/30 text-emerald-500 bg-emerald-950/10' :
                                                    fir.status === 'Closed' ? 'border-zinc-800 text-zinc-300 bg-zinc-900/20' :
                                                    'border-amber-900/30 text-amber-500 bg-amber-950/10'
                                                }`}>
                                                    {fir.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-zinc-200 font-bold line-clamp-2 mb-4 leading-relaxed group-hover:text-white transition-colors">
                                                {fir.description.split('\n')[0] || fir.description}
                                            </p>
                                            <div className="flex items-center justify-between text-[10px] text-zinc-300 font-black uppercase tracking-widest border-t border-red-900/5 pt-3">
                                                <span>{new Date(fir.timestamp).toLocaleDateString()}</span>
                                                {fir.resolutionNotes && (
                                                    <div className="flex items-center gap-1.5 text-red-500">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        <span>Official Response</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
