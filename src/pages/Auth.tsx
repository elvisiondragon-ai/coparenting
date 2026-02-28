import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, Eye, EyeOff, Sparkles, Zap, User as UserIcon, MessageCircle, Baby, Info } from "lucide-react";
import { iOSCacheCleaner } from "@/utils/iOSCacheCleaner";
import { useTranslation } from "react-i18next";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function Auth() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { toast } = useToast();

    const redirectPath = new URLSearchParams(window.location.search).get('redirect') || '/';

    // Login form state
    const [loginData, setLoginData] = useState({
        email: '',
        password: ''
    });

    // Signup form state
    const [signupData, setSignupData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        displayName: ''
    });

    // Forgot password form state
    const [forgotPasswordData, setForgotPasswordData] = useState({
        email: ''
    });

    // Track current view
    const [currentView, setCurrentView] = useState<'auth' | 'forgot-password' | 'reset-sent' | 'signup-success'>('auth');

    // Track active tab
    const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
    const [isTabClicked, setIsTabClicked] = useState(false);

    // Check if user is already logged in
    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                navigate(redirectPath);
            }
        };
        checkUser();
    }, [navigate, redirectPath]);

    const handleGoogleAuth = async () => {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}${redirectPath}`,
                }
            });
            if (error) throw error;
        } catch (error: any) {
            console.error('Google auth error:', error);
            toast({
                title: "Google Authentication Failed",
                description: error.message || "An error occurred during Google authentication.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(
                forgotPasswordData.email.trim().toLowerCase(),
                {
                    redirectTo: `${window.location.origin}/reset-password`
                }
            );
            if (error) throw error;
            toast({
                title: "Reset Email Sent!",
                description: "Check your email for password reset instructions.",
            });
            setCurrentView('reset-sent');
        } catch (error: any) {
            toast({
                title: "Reset Failed",
                description: error.message || "An error occurred while sending reset email.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: loginData.email.trim().toLowerCase(),
                password: loginData.password,
            });

            if (error) throw error;

            if (data.user) {
                // Check if coparenting_profiles exists
                const { data: profileData } = await supabase
                    .from('coparenting_profiles')
                    .select('id')
                    .eq('user_id', data.user.id)
                    .single();

                if (!profileData) {
                    await supabase
                        .from('coparenting_profiles')
                        .insert([
                            { 
                                user_id: data.user.id, 
                                display_name: data.user.user_metadata?.display_name || data.user.email,
                                email: data.user.email
                            }
                        ]);
                }

                navigate(redirectPath);
            }
        } catch (error: any) {
            toast({
                title: "Login Gagal",
                description: error.message || "Terjadi kesalahan saat login.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (signupData.password !== signupData.confirmPassword) {
            toast({ title: "Password Not match", description: "Passwords must be identical.", variant: "destructive" });
            return;
        }
        setIsLoading(true);
        try {
            const email = signupData.email.trim().toLowerCase();
            const { data, error } = await supabase.auth.signUp({
                email,
                password: signupData.password,
                options: {
                    data: { display_name: signupData.displayName }
                }
            });

            if (error) throw error;

            if (data.user) {
                // Insert into coparenting_profiles
                const { error: profileError } = await supabase
                    .from('coparenting_profiles')
                    .insert([
                        { 
                            user_id: data.user.id, 
                            display_name: signupData.displayName,
                            email: email
                        }
                    ]);
                
                if (profileError) {
                    console.error('Error creating coparenting profile:', profileError);
                }

                toast({ title: "Signup Successful!", description: "Welcome! You are now being logged in." });
                navigate(redirectPath);
            }
        } catch (error: any) {
            toast({
                title: "Signup Error",
                description: error.message || "Try another email.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (currentView === 'forgot-password') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-background">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center mb-4">
                            <img src="/coparenting_icon.png" alt="Logo" className="w-20 h-20 object-contain" />
                        </div>
                        <h1 className="text-2xl font-bold">Co Parenting eL Vision</h1>
                        <p className="text-muted-foreground mt-2">Manage your family schedule</p>
                    </div>
                    <Card className="p-6">
                        <form onSubmit={handleForgotPassword} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="forgot-email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="forgot-email"
                                        type="email"
                                        placeholder="your@email.com"
                                        value={forgotPasswordData.email}
                                        onChange={(e) => setForgotPasswordData(prev => ({ ...prev, email: e.target.value }))}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full h-11" disabled={isLoading}>
                                {isLoading ? "Sending..." : "Send Reset Email"}
                            </Button>
                        </form>
                        <div className="mt-4 text-center">
                            <Button onClick={() => setCurrentView('auth')} variant="ghost" className="text-muted-foreground">Kembali ke Login</Button>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    if (currentView === 'reset-sent') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-background">
                <div className="w-full max-w-md text-center">
                    <img src="/coparenting_icon.png" alt="Logo" className="h-20 w-20 mx-auto object-contain mb-4" />
                    <h1 className="text-2xl font-bold mb-8">Co Parenting eL Vision</h1>
                    <Card className="p-6">
                        <Mail className="h-12 w-12 mx-auto text-primary mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Check Email</h3>
                        <p className="text-muted-foreground mb-6">Reset Password link sent. Check Your Email</p>
                        <Button onClick={() => setCurrentView('auth')} className="w-full h-11">Back ke Login</Button>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <img src="/coparenting_icon.png" alt="Logo" className="w-20 h-20 object-contain" />
                    </div>
                    <h1 className="text-2xl font-bold">Co Parenting eL Vision</h1>
                    <p className="text-muted-foreground mt-2">Manage your family schedule together</p>
                </div>
                <Card className="p-6">
                    <Alert className="bg-blue-50 border-blue-200 text-blue-800 mb-6 shadow-sm">
                        <Info className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-xs font-medium leading-relaxed">
                            {t('dashboard.shared_account_notice')}
                        </AlertDescription>
                    </Alert>
                    
                    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'signup')} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="login" onClick={() => { setIsTabClicked(true); setTimeout(() => setIsTabClicked(false), 150); }}>
                                Login
                            </TabsTrigger>
                            <TabsTrigger value="signup" onClick={() => { setIsTabClicked(true); setTimeout(() => setIsTabClicked(false), 150); }}>
                                Daftar
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="login" className="space-y-4">
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="login-email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input id="login-email" type="email" placeholder="email@example.com" value={loginData.email} onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))} className="pl-10" required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="login-password">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input id="login-password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={loginData.password} onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))} className="pl-10 pr-10" required />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-muted-foreground">
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                                <Button type="submit" className="w-full h-11" disabled={isLoading}>
                                    {isLoading ? "Login..." : "Login"} <Zap className="ml-2 h-4 w-4" />
                                </Button>
                            </form>
                            <div className="text-center">
                                <button onClick={() => setCurrentView('forgot-password')} className="text-sm text-primary font-medium">Forgot Password?</button>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                                <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or Login With</span></div>
                            </div>
                            <Button onClick={handleGoogleAuth} variant="outline" className="w-full h-11" disabled={isLoading}>
                                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                                Google
                            </Button>
                        </TabsContent>

                        <TabsContent value="signup" className="space-y-4">
                            <form onSubmit={handleSignup} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="signup-displayname">Display Name</Label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input id="signup-displayname" type="text" placeholder="Enter your display name" value={signupData.displayName} onChange={(e) => setSignupData(prev => ({ ...prev, displayName: e.target.value }))} className="pl-10" required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signup-email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input id="signup-email" type="email" placeholder="email@example.com" value={signupData.email} onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))} className="pl-10" required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signup-password">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input id="signup-password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={signupData.password} onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))} className="pl-10 pr-10" required />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-muted-foreground">
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signup-confirm-password">Konfirmasi Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input id="signup-confirm-password" type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" value={signupData.confirmPassword} onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))} className="pl-10 pr-10" required />
                                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 text-muted-foreground">
                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                                <Button type="submit" className="w-full h-11" disabled={isLoading}>
                                    {isLoading ? "Creating account..." : "Sign Up"} <Sparkles className="ml-2 h-4 w-4" />
                                </Button>
                            </form>
                            <Button onClick={handleGoogleAuth} variant="outline" className="w-full h-11" disabled={isLoading}>
                                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                                Google
                            </Button>
                        </TabsContent>
                    </Tabs>
                </Card>

                <div className="text-center mt-6 space-y-4">
                    <Button variant="outline" onClick={() => { const message = encodeURIComponent("Hi about CoParenting Tracker.."); window.open(`https://wa.me/62895325633487?text=${message}`, '_blank'); }} className="w-full">
                        <MessageCircle className="w-4 h-4 mr-2" /> Contact Support
                    </Button>

                    <Button 
                        onClick={async () => { 
                            toast({ title: "Clearing Cache...", description: "Please wait a moment" }); 
                            await iOSCacheCleaner.forceCleanReload(); 
                        }} 
                        className="w-full text-sm bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-none shadow-md"
                    >
                        🧹 Clear Cache & Nuclear Reload
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default Auth;
