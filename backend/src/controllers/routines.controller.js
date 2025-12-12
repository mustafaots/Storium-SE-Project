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