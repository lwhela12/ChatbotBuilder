import { flows, type Flow, type InsertFlow } from "@shared/schema";

export interface IStorage {
  getFlow(id: number): Promise<Flow | undefined>;
  getLatestFlow(): Promise<Flow | undefined>;
  createFlow(flow: InsertFlow): Promise<Flow>;
  updateFlow(id: number, flow: Partial<InsertFlow>): Promise<Flow | undefined>;
  getAllFlows(): Promise<Flow[]>;
}

export class MemStorage implements IStorage {
  private flows: Map<number, Flow>;
  currentId: number;

  constructor() {
    this.flows = new Map();
    this.currentId = 1;
  }

  async getFlow(id: number): Promise<Flow | undefined> {
    return this.flows.get(id);
  }

  async getLatestFlow(): Promise<Flow | undefined> {
    const allFlows = Array.from(this.flows.values());
    return allFlows.length > 0 ? allFlows[allFlows.length - 1] : undefined;
  }

  async createFlow(insertFlow: InsertFlow): Promise<Flow> {
    const id = this.currentId++;
    const flow: Flow = { ...insertFlow, id };
    this.flows.set(id, flow);
    return flow;
  }

  async updateFlow(id: number, flowUpdate: Partial<InsertFlow>): Promise<Flow | undefined> {
    const existingFlow = this.flows.get(id);
    if (!existingFlow) return undefined;
    
    const updatedFlow: Flow = { ...existingFlow, ...flowUpdate };
    this.flows.set(id, updatedFlow);
    return updatedFlow;
  }

  async getAllFlows(): Promise<Flow[]> {
    return Array.from(this.flows.values());
  }
}

export const storage = new MemStorage();
