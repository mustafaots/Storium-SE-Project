import { AlertModel } from '../models/alerts.model.js';

// 1. GET ALL ALERTS
export const getAlerts = async (req, res, next) => {
  try {
    const alerts = await AlertModel.findAll();
    res.json(alerts);
  } catch (error) {
    console.error("❌ REAL DB ERROR (Get Alerts):", error);
    // BYPASS BROKEN HANDLER: Send JSON directly
    res.status(500).json({ message: error.message });
  }
};

// 2. MARK AS READ
export const markRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Handle both body formats (just in case)
    const isRead = req.body.is_read !== undefined ? req.body.is_read : 1;
    await AlertModel.toggleRead(id, isRead);
    res.json({ message: 'Marked as read' });
  } catch (error) {
    console.error("❌ REAL DB ERROR (Mark Read):", error);
    res.status(500).json({ message: error.message });
  }
};

// 3. MARK ALL AS READ
export const markAllAsRead = async (req, res, next) => {
  try {
    await AlertModel.markAllRead();
    res.json({ message: 'All marked as read' });
  } catch (error) {
    console.error("❌ REAL DB ERROR (Mark All):", error);
    res.status(500).json({ message: error.message });
  }
};

// 4. DELETE ALERT
export const deleteAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    await AlertModel.delete(id);
    res.json({ message: 'Deleted' });
  } catch (error) {
    console.error("❌ REAL DB ERROR (Delete):", error);
    res.status(500).json({ message: error.message });
  }
};

// 5. MANUAL CREATE (Fixes the Import Error you had)
export const createAlert = async (req, res, next) => {
  try {
    console.log("📥 Received Body:", req.body); // <--- DEBUG LOG

    // Safety Check: Is body empty?
    if (!req.body) {
      return res.status(400).json({ message: "Request body is missing!" });
    }

    // Safety Check: Is alert_type missing?
    if (!req.body.alert_type) {
      return res.status(400).json({ message: "Missing 'alert_type' in JSON body" });
    }

    if (AlertModel.create) {
        await AlertModel.create(req.body);
        res.status(201).json({ message: 'Alert created' });
    } else {
        res.status(501).json({ message: 'Create Not Implemented' });
    }
  } catch (error) {
    console.error("❌ REAL DB ERROR (Create):", error);
    res.status(500).json({ message: error.message });
  }
};