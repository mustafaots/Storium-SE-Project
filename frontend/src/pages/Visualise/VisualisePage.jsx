import CategoryChart from '../../components/Layout/VisualiseLayout/CategoryChart/CategoryChart';
import DepotStockChart from '../../components/Layout/VisualiseLayout/DepotStockChart/DepotStockChart';
import ExpiryTimeline from '../../components/Layout/VisualiseLayout/ExpiryTimeline/ExpiryTimeline';
import InventoryHealthTable from '../../components/Layout/VisualiseLayout/InventoryHealthTable/InventoryHealthTable';
import PlacementSearch from '../../components/Layout/VisualiseLayout/PlacementSearch/PlacementSearch';
import SupplierPerformance from '../../components/Layout/VisualiseLayout/SupplierPerformance/SupplierPerformance';
import TransactionChart from '../../components/Layout/VisualiseLayout/TransactionChart/TransactionChart';
import { exportToCSV, exportToPDF } from '../../utils/exportUtils';
import styles from './VisualisePage.module.css';
import useVisualise from '../../hooks/useVisualise';
import { FileText, Table } from 'lucide-react';
import FilterBar from '../../components/Layout/VisualiseLayout/FilterBar/FilterBar';
import { StatCardsGrid } from '../../components/Layout/VisualiseLayout/StatCard/StatCard';
import Chart from '../../components/Layout/VisualiseLayout/Chart/Chart';
import WarehouseOccupancy from '../../components/Layout/VisualiseLayout/WarehouseOccupancy/WarehouseOccupancy';
import StockByDepotChart from '../../components/Layout/VisualiseLayout/StockByDepotChart/StockByDepotChart';
import LowStockAlert from '../../components/Layout/VisualiseLayout/LowStockAlert/LowStockAlert';
import MovementLogTable from '../../components/Layout/VisualiseLayout/MovementLogTable/MovementLogTable';
import TransactionTypeSummaryChart from '../../components/Layout/VisualiseLayout/TransactionTypeSummaryChart/TransactionTypeSummaryChart';

// Navigation imports
import NavBar from '../../components/UI/NavBar/NavBar';
import { useActiveNavItem } from '../../hooks/useActiveNavItem';

const VisualisePage = () => {
  const { data, loading, filters, updateFilters, applyFilters } = useVisualise();
  const activeItem = useActiveNavItem();

  const handleExportCSV = () => {
    if (!data) return;
    
    if (filters.viewType === 'movements') {
      // Export movement log data
      const csvContent = [
        ['Timestamp', 'Product', 'Type', 'Transaction', 'Quantity', 'Value', 'Source/Destination', 'Reference'].join(','),
        ...data.movementLog.map(row => [
          row.timestamp,
          `"${row.productName}"`,
          row.productType || '',
          row.txnType,
          row.quantity,
          row.totalValue || 0,
          `"${row.sourceDestination || ''}"`,
          row.referenceNumber || ''
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `movement-log-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      // Export stock trends for other views
      const exportData = data.stockTrends.map(t => ({
        Date: t.date,
        Value: t.value,
        Units: t.units
      }));
      exportToCSV(exportData, 'storium-stock-trends');
    }
  };

  const handleExportPDF = () => {
    if (!data) return;
    const reportData = {
      kpis: data.kpis,
      categories: data.categoryDistribution
    };
    exportToPDF(reportData, 'Storium Inventory Analytics');
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        Loading visualization data...
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Main Content Area */}
      <div className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>Visualise</h1>
            <p className={styles.subtitle}>Stock analytics and insights</p>
          </div>

          <div className={styles.exportGroup}>
            <button className={styles.exportButton} onClick={handleExportCSV}>
              <Table size={16} />
              <span>CSV Report</span>
            </button>
            <button className={styles.exportButton} onClick={handleExportPDF}>
              <FileText size={16} />
              <span>PDF Report</span>
            </button>
          </div>
        </header>

        <FilterBar
          filters={filters}
          onFilterChange={updateFilters}
          onApply={applyFilters}
          products={data?.filterOptions?.products || []}
          locations={data?.filterOptions?.locations || []}
        />

        <StatCardsGrid
          totalStockValue={data?.kpis?.totalStockValue || 0}
          movementsToday={data?.kpis?.movementsToday || 0}
          belowMinLevel={data?.kpis?.belowMinLevel || 0}
          warehouseOccupancy={data?.kpis?.warehouseOccupancy || 0}
        />

        <div className={styles.chartsGrid}>
          {/* Stock Levels View - Comprehensive inventory overview */}
          {filters.viewType === 'stock_levels' && (
            <>
              <div className={styles.mainChart}>
                <Chart data={data?.stockTrends || []} comparison={data?.comparison || {}} />
              </div>

              <StockByDepotChart data={data?.stockByDepot || []} />
              <LowStockAlert data={data?.lowStockProducts || []} />

              <InventoryHealthTable data={data?.inventoryHealth} />
              <DepotStockChart data={data?.depotStock || []} />

              {!filters.productId && (
                <CategoryChart data={data?.categoryDistribution || []} />
              )}
              <ExpiryTimeline data={data?.expirySchedule || []} />

              <PlacementSearch data={data?.productPlacement || []} />
              <SupplierPerformance data={data?.supplyChainMetrics || []} />
            </>
          )}

          {/* Movements View - Transaction-focused analytics */}
          {filters.viewType === 'movements' && (
            <>
              <MovementLogTable data={data?.movementLog || []} />

              <div className={styles.mainChart}>
                <TransactionChart data={data?.movementsOverTime || []} />
              </div>

              <TransactionTypeSummaryChart data={data?.transactionTypeSummary || []} />
              <DepotStockChart data={data?.depotStock || []} />

              <ExpiryTimeline data={data?.expirySchedule || []} />
              <SupplierPerformance data={data?.supplyChainMetrics || []} />
            </>
          )}

          {/* Occupancy View - Warehouse space management */}
          {filters.viewType === 'occupancy' && (
            <>
              <div className={styles.mainChart}>
                <WarehouseOccupancy zones={data?.warehouseZones || []} />
              </div>

              <InventoryHealthTable data={data?.inventoryHealth} />
              <PlacementSearch data={data?.productPlacement || []} />

              <DepotStockChart data={data?.depotStock || []} />
              <ExpiryTimeline data={data?.expirySchedule || []} />

              {!filters.productId && (
                <CategoryChart data={data?.categoryDistribution || []} />
              )}
            </>
          )}
        </div>
      </div>

      {/* Navigation Bar */}
      <NavBar activeItem={activeItem} />
    </div>
  );
};

export default VisualisePage;
