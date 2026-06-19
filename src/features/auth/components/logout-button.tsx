import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "../actions";

export function LogoutButton({ className }: { className?: string } = {}) {
  return (
    <form action={signOut}>
      <Button type="submit" variant="secondary" className={className}>
        <LogOut className="h-4 w-4" />
        Sair
      </Button>
    </form>
  );
}
