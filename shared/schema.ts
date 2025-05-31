import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const flows = pgTable("flows", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default("Untitled Flow"),
  flowData: jsonb("flow_data").notNull(),
});

export const insertFlowSchema = createInsertSchema(flows).omit({
  id: true,
});

export type InsertFlow = z.infer<typeof insertFlowSchema>;
export type Flow = typeof flows.$inferSelect;

// Flow data types for the chatbot
export interface FlowNode {
  id: string;
  type: "start" | "message" | "question";
  position: { x: number; y: number };
  data: {
    text?: string;
    inputType?: string;
    required?: boolean;
    storeResponse?: boolean;
  };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface FlowData {
  nodes: FlowNode[];
  edges: FlowEdge[];
}
