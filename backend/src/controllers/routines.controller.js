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
    next(error);
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
export const executeRoutine = async (req, res, next) => {
  const { id } = req.params;

  try {
    // 1. Get the Routine data from the Database
    const routine = await RoutineModel.findById(id);

    if (!routine) {
      return res.status(404).json({ message: 'Routine not found' });
    }

    // 2. DEFINE THE FORMAT (The "Packet")
    // This is the JSON structure your leader will use later
    const formatProducer = {
      meta: {
        producer: "system_routines_service",
        timestamp: new Date().toISOString(),
        version: "1.0"
      },
      action: {
        type: "CREATE_TRANSACTION", // Telling the engine what to do
        trigger: "AUTOMATED_ROUTINE"
      },
      payload: {
        routine_id: routine.routine_id,
        routine_name: routine.name,
        // In a real scenario, these values come from parsing the 'resolve' column
        // For now, we default them or take them from the request
        transaction_type: "outflow", 
        target_product_id: req.body.product_id || null, 
        quantity: req.body.quantity || 10,
        notes: `Executed via routine: ${routine.name}`
      }
    };

    // 3. "Send" the packet
    // Since the Transaction Service is not ready, we simulate sending it
    // by returning it to the client.
    console.log(">> FORMAT PRODUCED:", JSON.stringify(formatProducer, null, 2));

    // 4. Update the 'last_run' time in the database
    // We don't wait for this, just fire and forget
    // (You would need a Model function for updateLastRun, but we skip it for now to keep it simple)

    res.status(200).json({
      status: "success",
      message: "Routine executed. Format produced successfully.",
      produced_packet: formatProducer
    });

  } catch (error) {
    next(error);
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