import { flows, type Flow, type InsertFlow } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getFlow(id: number): Promise<Flow | undefined>;
  getLatestFlow(): Promise<Flow | undefined>;
  createFlow(flow: InsertFlow): Promise<Flow>;
  updateFlow(id: number, flow: Partial<InsertFlow>): Promise<Flow | undefined>;
  getAllFlows(): Promise<Flow[]>;
}

export class DatabaseStorage implements IStorage {
  async getFlow(id: number): Promise<Flow | undefined> {
    const [flow] = await db.select().from(flows).where(eq(flows.id, id));
    return flow || undefined;
  }

  async getLatestFlow(): Promise<Flow | undefined> {
    const [flow] = await db.select().from(flows).orderBy(desc(flows.id)).limit(1);
    return flow || undefined;
  }

  async createFlow(insertFlow: InsertFlow): Promise<Flow> {
    const [flow] = await db
      .insert(flows)
      .values({
        name: insertFlow.name || "Untitled Flow",
        flowData: insertFlow.flowData
      })
      .returning();
    return flow;
  }

  async updateFlow(id: number, flowUpdate: Partial<InsertFlow>): Promise<Flow | undefined> {
    const [flow] = await db
      .update(flows)
      .set(flowUpdate)
      .where(eq(flows.id, id))
      .returning();
    return flow || undefined;
  }

  async getAllFlows(): Promise<Flow[]> {
    return await db.select().from(flows).orderBy(desc(flows.id));
  }
}

export const storage = new DatabaseStorage();
