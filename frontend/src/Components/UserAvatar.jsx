import { Button } from "./../Components/ui/button";
import { LogOut } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "./../Components/ui/dropdown-menu";
import { useAuth } from "./../../contexts/AuthContext";

export const UserAvatar = () => {
  const { user, signOut } = useAuth();

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
          className="w-12 h-12 rounded-full bg-linear-to-br from-cyan-400 to-cyan-500 flex items-center justify-center shadow-md text-white font-bold text-2xl cursor-pointer"
        >
          {initials}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="mt-4">
        <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()} className="text-red-600 hover:bg-red-100">
          <LogOut className="mr-2 h-6 w-6 cursor-pointer" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
