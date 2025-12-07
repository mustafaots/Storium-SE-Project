import { TransactionsService } from "../services/transactions.service.js";

export const getTransactions = async (req, res, next) => {
    try {
        const transactions = await TransactionsService.getAllTransactions();
        res.json({ success: true, data: transactions });
    } catch (error) {
        next(error); // to centralized error handling middleware
    }  
};

