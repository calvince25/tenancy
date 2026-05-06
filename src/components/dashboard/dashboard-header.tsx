import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function DashboardHeader({ title, description, children }: { title: string, description: string, children?: React.ReactNode }) {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-serif text-primary font-bold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <div className="flex gap-2">
        {children}
      </div>
    </header>
  );
}
