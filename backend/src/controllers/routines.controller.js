import { RoutineModel } from '../models/routines.model.js';

// Get All Routines
export const getAllRoutines = async (req, res, next) => {
  try {
    const routines = await RoutineModel.findAll();
    res.json(routines);
  } catch (error) {
    next(error);
  }
};

/*
// Create New Routine
export const createRoutine = async (req, res, next) => {
  try {
    // Basic validation
    if (!req.body.name || !req.body.promise) {
      return res.status(400).json({ message: 'Name and Promise are required' });
    }

    const newId = await RoutineModel.create(req.body);
    res.status(201).json({ 
      message: 'Routine created', 
      routineId: newId 
    });
  } catch (error) {
    //next(error); => DELETED 
  }
};

*/

// POST /api/routines
export const createRoutine = async (req, res, next) => {
  try {
    // 1. Validation
    if (!req.body.name || !req.body.promise) {
      return res.status(400).json({ message: 'Name and Promise are required' });
    }

    // 1b. Normalize/validate frequency (DB enum + scheduler expectations)
    const rawFrequency = (req.body.frequency ?? 'daily').toString().trim().toLowerCase();
    const normalizedFrequency = rawFrequency === 'real-time' ? 'always' : rawFrequency;
    const allowedFrequencies = new Set(['daily', 'weekly', 'monthly', 'on_event', 'always']);
    if (!allowedFrequencies.has(normalizedFrequency)) {
      return res.status(400).json({
        message: 'Invalid frequency',
        allowed: Array.from(allowedFrequencies)
      });
    }

    req.body.frequency = normalizedFrequency;

    // 2. Create in DB
    const newId = await RoutineModel.create(req.body);
    
    // 3. Success Response
    res.status(201).json({ 
      message: 'Routine created', 
      routineId: newId 
    });

  } catch (error) {
    // ✅ BYPASS THE BROKEN ERROR HANDLER
    console.error("❌ REAL DB ERROR (Create Routine):", error);
    
    // Send the error to the frontend directly
    if (!res.headersSent) {
        res.status(500).json({ 
            success: false, 
            message: "Database Error", 
            error: error.message 
        });
    }
  }
};

// Toggle Status
export const toggleRoutineStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    
    await RoutineModel.toggleStatus(id, is_active);
    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    next(error);
  }
};

// Delete Routine
export const deleteRoutine = async (req, res, next) => {
  try {
    const { id } = req.params;
    await RoutineModel.deleteById(id);
    res.json({ message: 'Routine deleted successfully' });
  } catch (error) {
    next(error);
  }
};


// ... existing imports ...

// =========================================================
// NEW: THE FORMAT PRODUCER (Step 2 & 3)
// =========================================================
// ... imports ...

export const executeRoutine = async (req, res, next) => {
  const { id } = req.params;

  try {
    const routine = await RoutineModel.findById(id);
    if (!routine) return res.status(404).json({ message: 'Routine not found' });

    // 1. DEFINE THE PACKET
    const formatProducer = {
      meta: { producer: "system_routines", timestamp: new Date().toISOString() },
      action: { type: "CREATE_TRANSACTION", trigger: "AUTOMATED_ROUTINE" },
      payload: {
        routine_id: routine.routine_id,
        routine_name: routine.name,
        notes: `Executed via routine: ${routine.name}`
      }
    };

    // 2. SAVE TO HISTORY TABLE (So Frontend knows it happened) <--- NEW PART
    // We assume you use the dbPool import like in the model
    // You might need to import 'db' at the top of this file if you haven't: 
    // import db from '../config/dbPool.js'; 
    // OR just use RoutineModel if you add a 'logHistory' function there.
    
    // Quickest way: direct query if you have access, or add to Model.
    // Let's assume we add a helper to RoutineModel for cleaner code:
    await RoutineModel.logHistory(id, `Automated Execution: ${routine.name}`);

    // 3. Send Response
    res.status(200).json({
      message: "Routine executed.",
      produced_packet: formatProducer
    });

  } catch (error) {
    console.error("EXECUTION ERROR:", error);
    // Don't crash the scheduler
    if(res.headersSent) return; 
    res.status(500).json({ error: error.message });
  }
};

// ... existing code ...

// =========================================================
// NEW: GET STATS (Step 1 of Roadmap)
// =========================================================
export const getStats = async (req, res, next) => {
  try {
    const stats = await RoutineModel.getDashboardStats();
    res.json(stats);
  } catch (error) {
    // DO NOT USE next(error) - The middleware is broken
    console.error("STATS ERROR:", error); 
    res.status(500).json({ 
        message: "Database Error", 
        detail: error.message 
    });
  }
};


// =========================================================
// NEW: GET PRODUCTS FOR DROPDOWN
// =========================================================
export const getProductOptions = async (req, res, next) => {
  try {
    const products = await RoutineModel.getAllProducts();
    res.json(products);
  } catch (error) {
    // Manually handle error if middleware is broken
    console.error("PRODUCT FETCH ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};