import cron from 'node-cron';
import { RoutineModel } from '../models/routines.model.js';
import { executeRoutine } from '../controllers/routines.controller.js';

// This function starts the "Heartbeat" of your system
export const startScheduler = () => {
  console.log('⏰ System Scheduler Started...');

  // Run every minute: (* * * * *)
  cron.schedule('* * * * *', async () => {
    try {
      console.log('🔍 Checking for scheduled routines...');
      
      // 1. Get all active routines from DB
      const routines = await RoutineModel.findAll();
      
      // 2. Filter routines that need to run NOW
      // (For this demo, we just simulate checking the frequency)
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

    routines.forEach(routine => {
        if (!routine.is_active) return;

        // ===================================================
        // REAL MODE (Only runs at the specific time)
        // ===================================================
        
        // Example: If Frequency is "Daily" and it is 08:00 AM
        if (routine.frequency === 'daily' && currentHour === 8 && currentMinute === 0) {
           console.log(`🚀 Executing Daily Routine: ${routine.name}`);
           
           const mockReq = { params: { id: routine.routine_id }, body: {} };
           const mockRes = { 
             json: (data) => console.log('Packet Produced'),
             status: () => ({ json: () => {} }) 
           };
           executeRoutine(mockReq, mockRes, (err) => console.error(err));
        }

        // You can add logic for 'weekly' here later if you want
      });

    } catch (error) {
      console.error('Scheduler Error:', error);
    }
  });
};