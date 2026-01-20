import { Button } from "@/Components/ui/button";
import { Video, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { UploadSection } from "@/Components/UploadSection";
import AnalyticsPanel from "@/Components/Analysis";
import { RecommendationsSection } from "@/Components/RecommendationsSection";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuItem,
} from "@/Components/ui/dropdown-menu";

export const Dashboard = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    return (
        <>   
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-cyan-400 to-cyan-500 flex items-center justify-center shadow-md">
                            <Video className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-xl text-gray-900">VideoDiscovery</span>
                    </div>

                    {/* Navigation */}

                    {/* User Avatar */}
                    <div className="flex items-center gap-3">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-11 h-11 rounded-full bg-linear-to-br from-cyan-400 to-cyan-500 flex items-center justify-center shadow-md"
                                >
                                    <User className="h-5 w-5 text-white" />
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => navigate('/profile')}>
                                    Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => signOut()}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sign Out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
            
        </header>
        <main className="mt-20">
            <AnalyticsPanel />
            <UploadSection />
            <RecommendationsSection />
        </main>
        </>
        
    );
};
