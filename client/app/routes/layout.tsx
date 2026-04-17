import { Sidebar } from "@/components/layout/Sidebar";

export default function RoutesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0 h-full">{children}</div>
    </div>
  );
}
