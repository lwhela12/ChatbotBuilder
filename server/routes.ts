import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFlowSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get latest flow or return empty flow structure
  app.get("/api/flow", async (req, res) => {
    try {
      const flow = await storage.getLatestFlow();
      
      if (!flow) {
        // Return empty flow with just a start node
        const emptyFlow = {
          nodes: [
            {
              id: "start-node-1",
              type: "start",
              position: { x: 100, y: 50 },
              data: {}
            }
          ],
          edges: []
        };
        return res.json(emptyFlow);
      }
      
      res.json(flow.flowData);
    } catch (error) {
      console.error("Error getting flow:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Save flow
  app.post("/api/flow", async (req, res) => {
    try {
      const flowData = req.body;
      
      // Validate that we have nodes and edges
      if (!flowData.nodes || !flowData.edges) {
        return res.status(400).json({ message: "Invalid flow data: nodes and edges required" });
      }

      // Check if we have an existing flow to update, or create new one
      const existingFlow = await storage.getLatestFlow();
      
      if (existingFlow) {
        const updatedFlow = await storage.updateFlow(existingFlow.id, {
          flowData,
          name: existingFlow.name
        });
        res.json({ success: true, flow: updatedFlow });
      } else {
        const newFlow = await storage.createFlow({
          name: "Untitled Flow",
          flowData
        });
        res.json({ success: true, flow: newFlow });
      }
    } catch (error) {
      console.error("Error saving flow:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all flows
  app.get("/api/flows", async (req, res) => {
    try {
      const flows = await storage.getAllFlows();
      res.json(flows);
    } catch (error) {
      console.error("Error getting flows:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get specific flow by ID
  app.get("/api/flow/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const flow = await storage.getFlow(id);
      
      if (!flow) {
        return res.status(404).json({ message: "Flow not found" });
      }
      
      res.json(flow.flowData);
    } catch (error) {
      console.error("Error getting flow:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
