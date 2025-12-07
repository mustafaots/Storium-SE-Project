import { TransactionsModel } from "../models/transactions.model.js";

export const TransactionsService = {
  async getAllTransactions() {
    return new Promise((resolve, reject) => {
        TransactionsModel.getAll((err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
  }
};