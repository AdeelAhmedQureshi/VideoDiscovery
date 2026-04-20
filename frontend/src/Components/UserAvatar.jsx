import { Button } from "./../Components/ui/button";
import { LogOut, User } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem
} from "./../Components/ui/dropdown-menu";
import { useAuth } from "./../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export const UserAvatar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  // Get first two initials
  const initials = user?.name
    ? user.name
        .split(" ")
        .map(n => n.charAt(0))
        .slice(0, 2)
        .join("")
    : "?";

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="w-13 h-13 rounded-full bg-gradient-to-br from-teal-600 to-cyan-600 flex items-center justify-center shadow-md hover:shadow-lg text-white font-bold text-2xl cursor-pointer transition-shadow"
        >
          {initials}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="mt-4 ">
        <DropdownMenuLabel className={"text-lg"}>{user?.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Account Option */}
        <DropdownMenuItem
          onClick={() => navigate("/account")}
          className="hover:bg-teal-100 flex items-center gap-2 cursor-pointer"
        >
          <User className="h-5 w-5" />
          Account
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setShowSignOutModal(true)}
          className="text-red-600 hover:bg-red-100 flex items-center gap-2 cursor-pointer"
        >
          <LogOut className="h-6 w-6" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    {showSignOutModal && (
      <div className="fixed top-6 left-1/2 z-50 w-[min(85vw,380px)] -translate-x-1/2">
        <div className="relative overflow-hidden rounded-3xl border border-red-200/70 bg-white/95 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.45)] animate-[fadeIn_220ms_ease-out]">
          <div className="relative px-6 py-5 bg-gradient-to-r from-red-600 via-rose-600 to-pink-600">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_55%)]" />
            <div className="relative flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/30">
                <LogOut className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-[0.22em] text-white/85">Confirmation</p>
                <h3 className="text-lg font-bold text-white">Sign out from account?</h3>
              </div>
            </div>
          </div>

          <div className="px-6 py-5 bg-white/90">
            <p className="text-slate-700 font-medium leading-relaxed mb-5">You will need to sign in again to continue using your dashboard.</p>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                onClick={() => setShowSignOutModal(false)}
                className="px-5 py-2.5 bg-white text-slate-800 font-semibold rounded-2xl hover:bg-slate-50 transition-all border border-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowSignOutModal(false); signOut(); }}
                className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold rounded-2xl hover:from-red-700 hover:to-rose-700 transition-all shadow-lg shadow-rose-500/25"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
        <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}`}</style>
      </div>
    )}
    </>
  );
};
