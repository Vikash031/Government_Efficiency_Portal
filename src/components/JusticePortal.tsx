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
        doc.text("DECENTRALIZED JUSTICE PORTAL", 105, 30, { align: "center" });
        doc.line(20, 35, 190, 35);

        // Official Report Title
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("FIRST INFORMATION REPORT (FIR)", 105, 50, { align: "center" });

        // Reference Info
        doc.setFontSize(10);
        doc.setFont("courier", "normal");
        doc.text(`TRACKING ID: ${uniqueId}`, 20, 65);
        doc.text(`DATE FILED: ${new Date().toLocaleString()}`, 20, 70);
        doc.text(`BLOCKCHAIN STATUS: PENDING INSERTION`, 20, 75);

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

        addLine("REPORTER NAME", user.name || "N/A");
        addLine("REPORTER EMAIL", user.email || "N/A");
        y += 5;
        addLine("CRIME TYPE", crimeType);
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
        doc.text("System Generated Report via Blockchain Relay Service.", 105, 280, { align: "center" });
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
            if (confirm("Would you like to download an official PDF copy of your FIR now?")) {
                generatePDF({ description, crimeType, state, city, incidentDate }, uniqueId);
            }

            // Construct a structured report for the blockchain
            const structuredReport = `
**OFFICIAL FIR REPORT**
-----------------------
ID: ${uniqueId}
Type: ${crimeType}
Location: ${city}, ${state}
Date of Incident: ${incidentDate}
Reporter: ${user.name || 'Citizen'} (${user.email || 'N/A'})

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

            alert(`FIR Filed Successfully! Tracking ID: ${uniqueId}`);
            fetchFIRs();
        } catch (error) {
            console.error(error);
            alert("Error filing FIR. Please check connection.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header / Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-l-4 border-indigo-500 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">System Status</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="text-xl font-bold text-gray-900">Online</span>
                                </div>
                            </div>
                            <Shield className="h-8 w-8 text-indigo-500 opacity-20" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-indigo-500 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Records</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{firs.length}</p>
                            </div>
                            <FileText className="h-8 w-8 text-indigo-500 opacity-20" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-indigo-500 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Standard Time (IST)</p>
                                <p className="text-xl font-bold text-gray-900 mt-1 font-mono">{currentTime || "--:--:--"}</p>
                            </div>
                            <Clock className="h-8 w-8 text-indigo-500 opacity-20" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Filing Form */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="shadow-md border-t-4 border-t-red-600">
                        <CardHeader className="border-b bg-gray-50/50 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <Scale className="h-6 w-6 text-red-700" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl text-gray-800">File New Report</CardTitle>
                                    <CardDescription>Use this secure form to lodge an immutable First Information Report.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-gray-700">Category of Issue</Label>
                                    <Select onValueChange={setCrimeType} value={crimeType}>
                                        <SelectTrigger className="bg-white">
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent>
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
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-gray-700">Date of Incident</Label>
                                    <div className="relative">
                                        <Input
                                            type="date"
                                            className="bg-white pl-10"
                                            value={incidentDate}
                                            onChange={(e) => setIncidentDate(e.target.value)}
                                        />
                                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-gray-700">State</Label>
                                    <Select onValueChange={setState} value={state}>
                                        <SelectTrigger className="bg-white">
                                            <SelectValue placeholder="Select State" />
                                        </SelectTrigger>
                                        <SelectContent>
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
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-gray-700">City / District</Label>
                                    <div className="relative">
                                        <Input
                                            placeholder="e.g. South Delhi"
                                            className="bg-white pl-10"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                        />
                                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700">Incident Details</Label>
                                <Textarea
                                    placeholder="Provide a comprehensive description of the event..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="bg-white min-h-[150px] resize-y"
                                />
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 text-amber-800">
                                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                                <div className="text-xs leading-relaxed">
                                    <strong>Legal Disclaimer:</strong> Information submitted here is permanently recorded on the blockchain.
                                    False reporting is a punishable offense. Ensure all details are accurate before submission.
                                </div>
                            </div>

                            <Button
                                onClick={fileFIR}
                                disabled={isSubmitting}
                                className="w-full bg-red-700 hover:bg-red-800 text-white font-semibold h-12 text-base shadow-sm"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2">
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                        Processing securely...
                                    </span>
                                ) : "Submit Official Report"}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: History */}
                <div className="lg:col-span-1">
                    <Card className="shadow-md h-full border-t-4 border-t-gray-600 flex flex-col">
                        <CardHeader className="border-b bg-gray-50/50 pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg text-gray-800">Recent Activity</CardTitle>
                                <Button variant="ghost" size="icon" onClick={fetchFIRs} disabled={isLoading} className="h-8 w-8 text-gray-500">
                                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0 flex-1 overflow-hidden flex flex-col p-0">
                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 text-sm border-b border-red-100 flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4" /> {error}
                                </div>
                            )}

                            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[600px]">
                                {firs.length === 0 && !isLoading ? (
                                    <div className="text-center py-10 text-gray-400">
                                        <FileText className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                        <p className="text-sm">No records found</p>
                                    </div>
                                ) : (
                                    firs.map((fir: any) => (
                                        <div key={fir.id} className="bg-white border rounded-lg p-3 hover:border-indigo-300 transition-colors shadow-sm">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[10px] font-mono font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                                    #{fir.id}
                                                </span>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${fir.status === 'Open' ? 'bg-green-100 text-green-700' :
                                                        fir.status === 'Closed' ? 'bg-gray-100 text-gray-700' :
                                                            'bg-amber-100 text-amber-700'
                                                    }`}>
                                                    {fir.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-800 font-medium line-clamp-2 mb-2 leading-relaxed">
                                                {fir.description.split('\n')[0] || fir.description}
                                            </p>
                                            <div className="flex items-center justify-between text-[10px] text-gray-400">
                                                <span>{new Date(fir.timestamp).toLocaleDateString()}</span>
                                                {fir.resolutionNotes && (
                                                    <div className="flex items-center gap-1 text-indigo-600">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        <span>Updated</span>
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
