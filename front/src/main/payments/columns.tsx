"use client";

import { ColumnDef } from "@tanstack/react-table";

// Você pode usar um esquema Zod aqui se quiser.
export const columns = [
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
];
