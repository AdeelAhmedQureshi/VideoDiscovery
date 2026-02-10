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
          className="w-13 h-13 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-500 flex items-center justify-center shadow-md text-white font-bold text-2xl cursor-pointer"
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
          className="hover:bg-cyan-100 flex items-center gap-2 cursor-pointer"
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
      <div className="fixed top-6 left-1/2 z-50 w-[min(92vw,540px)] -translate-x-1/2">
        <div className="overflow-hidden rounded-3xl border border-red-200 bg-white/95 shadow-2xl">
          <div className="px-6 py-4 bg-gradient-to-r from-red-600 to-rose-600">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <LogOut className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm uppercase tracking-widest text-white/85">Confirmation</p>
                <h3 className="text-lg font-bold text-white">Confirm Sign Out</h3>
              </div>
            </div>
          </div>

          <div className="px-6 py-5 bg-white/90">
            <p className="text-slate-700 font-medium mb-4">Are you sure you want to sign out?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSignOutModal(false)}
                className="px-5 py-2.5 bg-gray-100 text-gray-900 font-bold rounded-2xl hover:bg-gray-200 transition-all border border-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowSignOutModal(false); signOut(); }}
                className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold rounded-2xl hover:from-red-700 hover:to-rose-700 transition-all shadow-lg"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};
