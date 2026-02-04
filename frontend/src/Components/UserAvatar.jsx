import { Button } from "./../Components/ui/button";
import { LogOut, User } from "lucide-react";
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

  // Get first two initials
  const initials = user?.name
    ? user.name
        .split(" ")
        .map(n => n.charAt(0))
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
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

      <DropdownMenuContent align="end" className="mt-4">
        <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
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
          onClick={() => signOut()}
          className="text-red-600 hover:bg-red-100 flex items-center gap-2 cursor-pointer"
        >
          <LogOut className="h-6 w-6" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
