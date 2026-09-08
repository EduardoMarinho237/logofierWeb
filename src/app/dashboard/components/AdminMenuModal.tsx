"use client";

import { useRouter } from "next/navigation";
import { Users, Database, type LucideIcon } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

interface AdminMenuModalProps {
  open: boolean;
  onClose: () => void;
}

interface MenuItem {
  label: string;
  description: string;
  icon: LucideIcon;
  href: string;
}

const MENU_ITEMS: MenuItem[] = [
  {
    label: "Administrar usuários",
    description: "Criar, editar, restringir e excluir contas",
    icon: Users,
    href: "/admin/users",
  },
  {
    label: "Verificar metadados",
    description: "Processamentos e uso de armazenamento",
    icon: Database,
    href: "/admin/metadata",
  },
];

export function AdminMenuModal({ open, onClose }: AdminMenuModalProps) {
  const router = useRouter();

  return (
    <Modal open={open} onClose={onClose} title="Administração" maxWidth="max-w-md">
      <div className="flex flex-col gap-3">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.href}
              onClick={() => {
                onClose();
                router.push(item.href);
              }}
              className="flex items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-md shadow-[#0e525b]/5 transition-all duration-150 hover:bg-[#f7f7fa] hover:shadow-lg hover:shadow-[#0e525b]/10 active:scale-[0.98]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2b9aa8]/10">
                <Icon className="h-5 w-5 text-[#2b9aa8]" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-[#0e525b]">{item.label}</span>
                <span className="block text-xs text-[#0e525b]/50">{item.description}</span>
              </span>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}