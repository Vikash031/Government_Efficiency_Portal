"use client";

import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Settings as SettingsIcon } from 'lucide-react';
import { updatePassword, updateProfile } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function Settings() {
    // Safely get user/employee from localStorage in useEffect to avoid hydration mismatch
    // But for simplicity in this migration, we'll try to get it, or handle it in useEffect.
    // Better to use state initialized in useEffect for localStorage.

    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<any>({});
    const [employee, setEmployee] = useState<any>({});

    useState(() => {
        if (typeof window !== 'undefined') {
            setUser(JSON.parse(localStorage.getItem('user') || '{}'));
            setEmployee(JSON.parse(localStorage.getItem('employee') || '{}'));
            setMounted(true);
        }
    });

    // User ID to use for API calls
    const targetId = user._id || employee._id;
    const isEmployee = !!employee._id;

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [occupation, setOccupation] = useState('');
    const [phone, setPhone] = useState('');

    // Census States
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [annualIncome, setAnnualIncome] = useState('');
    const [employmentStatus, setEmploymentStatus] = useState('');
    const [educationLevel, setEducationLevel] = useState('');
    const [maritalStatus, setMaritalStatus] = useState('');
    const [housingType, setHousingType] = useState('');
    const [dependents, setDependents] = useState('');
    const [disabilityStatus, setDisabilityStatus] = useState('');

    // Initialize state from user object once mounted
    useState(() => {
        if (user._id) {
            setAddress(user.address || '');
            setCity(user.city || '');
            setState(user.state || '');
            setOccupation(user.occupation || '');
            setPhone(user.phone || '');
            setAge(user.age || '');
            setGender(user.gender || '');
            setAnnualIncome(user.annualIncome || '');
            setEmploymentStatus(user.employmentStatus || '');
            setEducationLevel(user.educationLevel || '');
            setMaritalStatus(user.maritalStatus || '');
            setHousingType(user.housingType || '');
            setDependents(user.dependents || '');
            setDisabilityStatus(user.disabilityStatus || '');
        }
    });

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert("New passwords don't match!");
            return;
        }

        try {
            await updatePassword({
                userId: targetId,
                currentPassword,
                newPassword
            });
            alert('Password updated successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.message || 'Error updating password');
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await updateProfile({
                userId: user._id,
                type: user.role === 'employee' ? 'Employee' : 'User',
                address,
                city,
                state,
                occupation,
                phone,
                age,
                gender,
                annualIncome,
                employmentStatus,
                educationLevel,
                maritalStatus,
                housingType,
                dependents,
                disabilityStatus
            });
            const newUser = { ...user, ...res.data };
            localStorage.setItem('user', JSON.stringify(newUser));
            setUser(newUser);
            alert('Profile updated successfully!');
        } catch (error: any) {
            console.error(error);
            alert('Error updating profile');
        }
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen dashboard-container">
            {/* Top Bar */}
            <div className="sticky top-0 z-20 bg-black/60 backdrop-blur-xl border-b border-red-900/20 px-8 py-4 flex justify-between items-center">
                <div>
                    <h2 className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] text-red-glow">My Settings</h2>
                    <p className="text-xl font-black text-white">Security & Profile</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-2xl bg-red-500 flex items-center justify-center text-white font-black shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                        <SettingsIcon className="h-5 w-5" />
                    </div>
                </div>
            </div>

            <div className="p-8 max-w-6xl mx-auto space-y-8 bg-grid-red">
                <div className="grid gap-8 lg:grid-cols-12">
                    {/* Left Column: Profile Details */}
                    {!isEmployee && (
                        <div className="lg:col-span-7 space-y-8 animate-in">
                            <Card className="border border-red-900/20 bg-zinc-950/50 backdrop-blur-md shadow-2xl shadow-black overflow-hidden rounded-[2.5rem]">
                                <div className="h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-900" />
                                <CardHeader className="px-8 pt-8">
                                    <CardTitle className="text-2xl font-black text-white tracking-tight">Profile Details</CardTitle>
                                    <CardDescription className="text-[10px] font-black text-zinc-300 uppercase tracking-widest mt-1">Update your home and contact information</CardDescription>
                                </CardHeader>
                                <CardContent className="px-8 pb-10">
                                    <form onSubmit={handleProfileUpdate} className="space-y-8">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-zinc-300 uppercase tracking-widest ml-1">Occupation</label>
                                                <Input 
                                                    value={occupation} 
                                                    onChange={(e) => setOccupation(e.target.value)} 
                                                    placeholder="e.g. Student, Officer, etc." 
                                                    className="bg-black/40 border-red-900/30 text-white placeholder:text-zinc-200 h-14 rounded-2xl focus:ring-red-600 transition-all px-6 font-bold"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-zinc-300 uppercase tracking-widest ml-1">Phone Number</label>
                                                <Input 
                                                    value={phone} 
                                                    onChange={(e) => setPhone(e.target.value)} 
                                                    placeholder="+91 XXXXX XXXXX" 
                                                    className="bg-black/40 border-red-900/30 text-white placeholder:text-zinc-200 h-14 rounded-2xl focus:ring-red-600 transition-all px-6 font-bold"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-300 uppercase tracking-widest ml-1">Home Address</label>
                                            <Input 
                                                value={address} 
                                                onChange={(e) => setAddress(e.target.value)} 
                                                placeholder="Street address as per official ID" 
                                                className="bg-black/40 border-red-900/30 text-white placeholder:text-zinc-200 h-14 rounded-2xl focus:ring-red-600 transition-all px-6 font-bold"
                                            />
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-zinc-300 uppercase tracking-widest ml-1">City</label>
                                                <Input 
                                                    value={city} 
                                                    onChange={(e) => setCity(e.target.value)} 
                                                    placeholder="e.g. New Delhi" 
                                                    className="bg-black/40 border-red-900/30 text-white placeholder:text-zinc-200 h-14 rounded-2xl focus:ring-red-600 transition-all px-6 font-bold"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-zinc-300 uppercase tracking-widest ml-1">State</label>
                                                <Input 
                                                    value={state} 
                                                    onChange={(e) => setState(e.target.value)} 
                                                    placeholder="e.g. Delhi" 
                                                    className="bg-black/40 border-red-900/30 text-white placeholder:text-zinc-200 h-14 rounded-2xl focus:ring-red-600 transition-all px-6 font-bold"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-8 border-t border-red-900/10">
                                            <h3 className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-6">Additional Info</h3>
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-zinc-300 uppercase tracking-widest ml-1">Age</label>
                                                    <Input 
                                                        type="number" 
                                                        value={age} 
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (val.length <= 3) setAge(val);
                                                        }} 
                                                        className="bg-black/40 border-red-900/30 text-white placeholder:text-zinc-200 h-14 rounded-2xl focus:ring-red-600 transition-all px-6 font-bold"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-zinc-300 uppercase tracking-widest ml-1">Annual Income (₹)</label>
                                                    <Input 
                                                        type="number" 
                                                        value={annualIncome} 
                                                        onChange={(e) => setAnnualIncome(e.target.value)} 
                                                        className="bg-black/40 border-red-900/30 text-white placeholder:text-zinc-200 h-14 rounded-2xl focus:ring-red-600 transition-all px-6 font-bold"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-zinc-300 uppercase tracking-widest ml-1">Gender</label>
                                                    <select 
                                                        className="flex h-14 w-full rounded-2xl border border-red-900/30 bg-black/40 px-6 font-bold text-white focus:bg-black transition-all appearance-none outline-none focus:ring-2 focus:ring-red-600" 
                                                        value={gender} 
                                                        onChange={(e) => setGender(e.target.value)}
                                                    >
                                                        <option value="" className="bg-zinc-950">Select Gender</option>
                                                        <option value="Male" className="bg-zinc-950">Male</option>
                                                        <option value="Female" className="bg-zinc-950">Female</option>
                                                        <option value="Other" className="bg-zinc-950">Other</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-zinc-300 uppercase tracking-widest ml-1">Employment Status</label>
                                                    <select 
                                                        className="flex h-14 w-full rounded-2xl border border-red-900/30 bg-black/40 px-6 font-bold text-white focus:bg-black transition-all appearance-none outline-none focus:ring-2 focus:ring-red-600" 
                                                        value={employmentStatus} 
                                                        onChange={(e) => setEmploymentStatus(e.target.value)}
                                                    >
                                                        <option value="" className="bg-zinc-950">Select Status</option>
                                                        <option value="Employed" className="bg-zinc-950">Employed</option>
                                                        <option value="Unemployed" className="bg-zinc-950">Unemployed</option>
                                                        <option value="Student" className="bg-zinc-950">Student</option>
                                                        <option value="Retired" className="bg-zinc-950">Retired</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-zinc-300 uppercase tracking-widest ml-1">Education Level</label>
                                                    <select 
                                                        className="flex h-14 w-full rounded-2xl border border-red-900/30 bg-black/40 px-6 font-bold text-white focus:bg-black transition-all appearance-none outline-none focus:ring-2 focus:ring-red-600" 
                                                        value={educationLevel} 
                                                        onChange={(e) => setEducationLevel(e.target.value)}
                                                    >
                                                        <option value="" className="bg-zinc-950">Select Education</option>
                                                        <option value="None" className="bg-zinc-950">None</option>
                                                        <option value="High School" className="bg-zinc-950">High School</option>
                                                        <option value="Bachelor's" className="bg-zinc-950">Bachelor's</option>
                                                        <option value="Master's" className="bg-zinc-950">Master's</option>
                                                        <option value="Doctorate" className="bg-zinc-950">Doctorate</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-zinc-300 uppercase tracking-widest ml-1">Marital Status</label>
                                                    <select 
                                                        className="flex h-14 w-full rounded-2xl border border-red-900/30 bg-black/40 px-6 font-bold text-white focus:bg-black transition-all appearance-none outline-none focus:ring-2 focus:ring-red-600" 
                                                        value={maritalStatus} 
                                                        onChange={(e) => setMaritalStatus(e.target.value)}
                                                    >
                                                        <option value="" className="bg-zinc-950">Select Status</option>
                                                        <option value="Single" className="bg-zinc-950">Single</option>
                                                        <option value="Married" className="bg-zinc-950">Married</option>
                                                        <option value="Divorced" className="bg-zinc-950">Divorced</option>
                                                        <option value="Widowed" className="bg-zinc-950">Widowed</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-zinc-300 uppercase tracking-widest ml-1">Housing Type</label>
                                                    <select 
                                                        className="flex h-14 w-full rounded-2xl border border-red-900/30 bg-black/40 px-6 font-bold text-white focus:bg-black transition-all appearance-none outline-none focus:ring-2 focus:ring-red-600" 
                                                        value={housingType} 
                                                        onChange={(e) => setHousingType(e.target.value)}
                                                    >
                                                        <option value="" className="bg-zinc-950">Select Type</option>
                                                        <option value="Owned" className="bg-zinc-950">Owned</option>
                                                        <option value="Rented" className="bg-zinc-950">Rented</option>
                                                        <option value="Government Provided" className="bg-zinc-950">Government Provided</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-zinc-300 uppercase tracking-widest ml-1">Number of Dependents</label>
                                                    <Input 
                                                        type="number" 
                                                        value={dependents} 
                                                        onChange={(e) => setDependents(e.target.value)} 
                                                        className="bg-black/40 border-red-900/30 text-white placeholder:text-zinc-200 h-14 rounded-2xl focus:ring-red-600 transition-all px-6 font-bold"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-zinc-300 uppercase tracking-widest ml-1">Disability Status</label>
                                                    <select 
                                                        className="flex h-14 w-full rounded-2xl border border-red-900/30 bg-black/40 px-6 font-bold text-white focus:bg-black transition-all appearance-none outline-none focus:ring-2 focus:ring-red-600" 
                                                        value={disabilityStatus} 
                                                        onChange={(e) => setDisabilityStatus(e.target.value)}
                                                    >
                                                        <option value="" className="bg-zinc-950">Select Status</option>
                                                        <option value="None" className="bg-zinc-950">None</option>
                                                        <option value="Physical" className="bg-zinc-950">Physical</option>
                                                        <option value="Visual" className="bg-zinc-950">Visual</option>
                                                        <option value="Hearing" className="bg-zinc-950">Hearing</option>
                                                        <option value="Other" className="bg-zinc-950">Other</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <Button 
                                            type="submit" 
                                            className="w-full h-16 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(255,0,0,0.2)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            Save Profile
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Right Column: Security */}
                    <div className={cn("space-y-8 animate-in", isEmployee ? "lg:col-span-12 max-w-2xl mx-auto" : "lg:col-span-5")}>
                        <Card className="border border-red-900/20 bg-zinc-950/50 backdrop-blur-md shadow-2xl shadow-black overflow-hidden rounded-[2.5rem]">
                            <div className="h-1 bg-gradient-to-r from-red-600 to-red-900" />
                            <CardHeader className="px-8 pt-8">
                                <CardTitle className="text-2xl font-black text-white tracking-tight">Password & Security</CardTitle>
                                <CardDescription className="text-[10px] font-black text-zinc-300 uppercase tracking-widest mt-1">Update your login details</CardDescription>
                            </CardHeader>
                            <CardContent className="px-8 pb-10">
                                <form onSubmit={handlePasswordChange} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-300 uppercase tracking-widest ml-1">Current Password</label>
                                        <div className="relative group">
                                            <Input
                                                type={showCurrent ? "text" : "password"}
                                                value={currentPassword}
                                                onChange={(e: ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
                                                required
                                                className="bg-black/40 border-red-900/30 text-white placeholder:text-zinc-200 h-14 rounded-2xl focus:ring-red-600 transition-all px-6 pr-14 font-bold"
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => setShowCurrent(!showCurrent)} 
                                                className="absolute right-5 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-400 transition-colors"
                                            >
                                                {showCurrent ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-300 uppercase tracking-widest ml-1">New Password</label>
                                        <div className="relative group">
                                            <Input
                                                type={showNew ? "text" : "password"}
                                                value={newPassword}
                                                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                                                required
                                                className="bg-black/40 border-red-900/30 text-white placeholder:text-zinc-200 h-14 rounded-2xl focus:ring-red-600 transition-all px-6 pr-14 font-bold"
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => setShowNew(!showNew)} 
                                                className="absolute right-5 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-400 transition-colors"
                                            >
                                                {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-300 uppercase tracking-widest ml-1">Re-type Password</label>
                                        <div className="relative group">
                                            <Input
                                                type={showConfirm ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                                                required
                                                className="bg-black/40 border-red-900/30 text-white placeholder:text-zinc-200 h-14 rounded-2xl focus:ring-red-600 transition-all px-6 pr-14 font-bold"
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => setShowConfirm(!showConfirm)} 
                                                className="absolute right-5 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-400 transition-colors"
                                            >
                                                {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </div>
                                    <Button 
                                        type="submit" 
                                        className="w-full h-16 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(255,0,0,0.2)] transition-all"
                                    >
                                        Change Password
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <div className="p-8 rounded-[2.5rem] bg-zinc-950/30 border border-red-900/20 relative overflow-hidden group">
                            <div className="absolute -top-4 -right-4 h-24 w-24 bg-red-500/10 rounded-full blur-2xl transition-all duration-700" />
                            <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-4">Security Advice</p>
                            <p className="text-xs font-bold text-zinc-200 leading-relaxed">Ensure your password contains mixed characters to keep your account safe.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
