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

        // LOGIC: Check if it's time to run
        // In a real app, you parse "Daily 08:00". 
        // Here is a simple example: If it's a "daily" routine and it's 8:00 AM
        if (routine.frequency === 'daily' && currentHour === 8 && currentMinute === 0) {
           console.log(`🚀 Auto-Executing Routine: ${routine.name}`);
           
           // We pretend to send the Request/Response objects since we are calling a controller
           const mockReq = { params: { id: routine.routine_id }, body: {} };
           const mockRes = { 
             json: (data) => console.log('Packet Produced:', data.produced_packet),
             status: () => ({ json: () => {} }) // Dummy function to prevent crash
           };
           
           executeRoutine(mockReq, mockRes, (err) => console.error(err));
        }
      });

    } catch (error) {
      console.error('Scheduler Error:', error);
    }
  });
};