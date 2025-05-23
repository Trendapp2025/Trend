import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertOpinionSchema, type User, insertUserBadgeSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Get all assets
  app.get("/api/assets", async (req, res) => {
    try {
      const assets = await storage.getAllAssets();
      res.json(assets);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get asset by symbol
  app.get("/api/assets/:symbol", async (req, res) => {
    try {
      const asset = await storage.getAssetBySymbol(req.params.symbol);
      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }
      res.json(asset);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get user verification progress
  app.get("/api/verification-progress", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const progress = await storage.getVerificationProgress(req.user!.id);
      res.json(progress);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get opinions for an asset
  app.get("/api/assets/:symbol/opinions", async (req, res) => {
    try {
      const asset = await storage.getAssetBySymbol(req.params.symbol);
      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }
      
      const opinions = await storage.getOpinionsByAssetId(asset.id);
      res.json(opinions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Add an opinion
  app.post("/api/assets/:symbol/opinions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const asset = await storage.getAssetBySymbol(req.params.symbol);
      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }
      
      const schema = insertOpinionSchema.extend({
        sentiment: z.enum(["positive", "neutral", "negative"]),
        prediction: z.number().min(-100).max(1000),
        comment: z.string().max(500).optional(),
      });
      
      const validationResult = schema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid input data", errors: validationResult.error.errors });
      }
      
      const opinion = await storage.createOpinion({
        ...validationResult.data,
        assetId: asset.id,
        userId: req.user!.id,
        username: req.user!.username,
      });
      
      // Update asset sentiment and prediction based on all opinions
      await storage.updateAssetSentiment(asset.id);
      
      // Check and update user's verification status
      await storage.checkAndUpdateVerificationStatus(req.user!.id);
      
      res.status(201).json(opinion);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Email verification endpoints sono già implementati in auth.ts
  
  // Get user's current badge
  app.get("/api/users/:userId/badge", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user.currentBadge);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get user's badge history
  app.get("/api/users/:userId/badges", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const badges = await storage.getUserBadges(userId);
      res.json(badges);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Admin endpoint to assign badges manually (for a specific month)
  app.post("/api/admin/assign-badges", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    // Check if user is admin
    if (req.user!.id !== 2 && req.user!.username !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    try {
      const { monthYear } = req.body;
      
      // Validate month format (YYYY-MM)
      const monthPattern = /^\d{4}-\d{2}$/;
      if (!monthPattern.test(monthYear)) {
        return res.status(400).json({ message: "Invalid month format. Use YYYY-MM" });
      }
      
      await storage.assignMonthlyBadges(monthYear);
      res.json({ message: `Badges assigned for ${monthYear}` });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get top predictors for a specific month
  app.get("/api/top-predictors/:monthYear", async (req, res) => {
    try {
      const { monthYear } = req.params;
      
      // Validate month format (YYYY-MM)
      const monthPattern = /^\d{4}-\d{2}$/;
      if (!monthPattern.test(monthYear)) {
        return res.status(400).json({ message: "Invalid month format. Use YYYY-MM" });
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const topPredictors = await storage.getMonthlyTopPredictors(monthYear, limit);
      
      // Remove sensitive data
      const safePredictors = topPredictors.map(user => ({
        id: user.id,
        username: user.username,
        accuracyPercentage: user.accuracyPercentage,
        totalPredictions: user.totalPredictions,
        currentBadge: user.currentBadge,
        isVerifiedAdvisor: user.isVerifiedAdvisor
      }));
      
      res.json(safePredictors);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Admin endpoint per recuperare tutti gli utenti
  app.get("/api/admin/users", async (req, res) => {
    if (!req.isAuthenticated()) {
      console.log("Accesso non autenticato all'endpoint /api/admin/users");
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    // Controlla se l'utente è admin (username = admin)
    if (req.user!.username !== "admin") {
      console.log(`Utente ${req.user!.username} (id: ${req.user!.id}) ha tentato di accedere all'endpoint admin senza privilegi`);
      return res.status(403).json({ message: "Not authorized" });
    }
    
    try {
      console.log(`Admin ${req.user!.username} (id: ${req.user!.id}) accede all'elenco utenti`);
      const users = await storage.getAllUsers();
      console.log(`Trovati ${users.length} utenti nel database`);
      
      // Rendi sicure le password per la risposta
      const safeUsers = users.map((user: User) => ({
        ...user,
        password: "********"
      }));
      
      res.json(safeUsers);
    } catch (error: any) {
      console.error("Errore nel recuperare gli utenti:", error);
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
