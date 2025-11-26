import styles from './TransactionsPage.module.css';
import NavBar from '../../components/UI/NavBar/NavBar';
import { useActiveNavItem } from '../../hooks/useActiveNavItem';

function TransactionsPage() {
    const activeItem = useActiveNavItem();
 // Filter transactions based on search and filters
     const filteredTransactions = useMemo(() => {
         return transactions.filter(transaction => {
             const matchesSearch = transaction.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 transaction.routine.toLowerCase().includes(searchTerm.toLowerCase());
            
             // You can add date filtering logic here when dates are implemented
             const matchesDate = true; // Placeholder for date filtering
            
             const matchesType = filterType === 'mixed' || 
                                transaction.routine.toLowerCase() === filterType.toLowerCase();
        
             return matchesSearch && matchesDate && matchesType;
         });
     }, [transactions, searchTerm, filterType]);

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.mainContent}>
                <div className={styles.comingSoon}>
                    <div className={styles.content}>
                        <h1 className={styles.title}>TRANSACTIONS</h1>
                        <p className={styles.subtitle}>We're working on it.</p>
                            {/* Transactions Table */}
                            <div className={styles.transactionsTable}>
                            {/* Table Header */}
                            <div className={styles.tableHeader}>
                                {/* Always show Timestamp */}
                                <div className={styles.headerCell}>Timestamp</div>
                                
                                {/* Show Type column for Mixed filter */}
                                {filterType === 'mixed' && (
                                <div className={styles.headerCell}>Type</div>
                                )}
                                
                                {/* Show Routine column for Automatic filter */}
                                {filterType === 'automatic' && (
                                <div className={styles.headerCell}>Routine</div>
                                )}
                                
                                {/* Always show Action */}
                                <div className={styles.headerCell}>Action</div>
                            </div>

                            {/* Table Body */}
                            <div className={styles.tableBody}>
                                {filteredTransactions.map((transaction) => (
                                <div key={transaction.id} className={styles.tableRow}>
                                    {/* Timestamp - Always shown */}
                                    <div className={styles.cell}>
                                    <div className={styles.timestamp}>
                                        {transaction.timestamp}
                                    </div>
                                    </div>
                                    
                                    {/* Type column - Only for Mixed filter */}
                                    {filterType === 'mixed' && (
                                    <div className={styles.cell}>
                                        <span className={`${styles.typeBadge} ${
                                        transaction.routine.toLowerCase() === 'automatic' ? styles.automatic : 
                                        transaction.routine.toLowerCase() === 'manual' ? styles.manual : ''
                                        }`}>
                                        {transaction.routine}
                                        </span>
                                    </div>
                                    )}
                                    
                                    {/* Routine column - Only for Automatic filter */}
                                    {filterType === 'automatic' && (
                                    <div className={styles.cell}>
                                        <span className={`${styles.routineBadge} ${
                                        transaction.routine.toLowerCase() === 'automatic' ? styles.automatic : ''
                                        }`}>
                                        {transaction.routine}
                                        </span>
                                    </div>
                                    )}
                                    
                                    {/* Action - Always shown */}
                                    <div className={styles.cell}>
                                    <div className={styles.action}>
                                        {transaction.action}
                                    </div>
                                    </div>
                                </div>
                                ))}
                            </div>
                            </div>
                        
                    </div>
                </div>
            </div>
            <NavBar activeItem={activeItem} />
        </div>
    );
}

export default TransactionsPage;