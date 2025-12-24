import CategoryChart from '../../components/Visualise/CategoryChart/CategoryChart';
import DepotStockChart from '../../components/Visualise/DepotStockChart/DepotStockChart';
import ExpiryTimeline from '../../components/Visualise/ExpiryTimeline/ExpiryTimeline';
import InventoryHealthTable from '../../components/Visualise/InventoryHealthTable/InventoryHealthTable';
import PlacementSearch from '../../components/Visualise/PlacementSearch/PlacementSearch';
import SupplierPerformance from '../../components/Visualise/SupplierPerformance/SupplierPerformance';
import TransactionChart from '../../components/Visualise/TransactionChart/TransactionChart';
import { exportToCSV, exportToPDF } from '../../utils/exportUtils';
import styles from './VisualisePage.module.css';
import useVisualise from '../../hooks/useVisualise';
import { FileText, Table } from 'lucide-react';
import FilterBar from '../../components/Visualise/FilterBar/FilterBar';
import { StatCardsGrid } from '../../components/Visualise/StatCard/StatCard';
import Chart from '../../components/Visualise/Chart/Chart';
import WarehouseOccupancy from '../../components/Visualise/WarehouseOccupancy/WarehouseOccupancy';
import StockByDepotChart from '../../components/Visualise/StockByDepotChart/StockByDepotChart';
import LowStockAlert from '../../components/Visualise/LowStockAlert/LowStockAlert';
import MovementLogTable from '../../components/Visualise/MovementLogTable/MovementLogTable';
import TransactionTypeSummaryChart from '../../components/Visualise/TransactionTypeSummaryChart/TransactionTypeSummaryChart';

// Navigation imports
import NavBar from '../../components/UI/NavBar/NavBar';
import { useActiveNavItem } from '../../hooks/useActiveNavItem';

const VisualisePage = () => {
  const { data, loading, filters, updateFilters, applyFilters } = useVisualise();
  const activeItem = useActiveNavItem();

  const handleExportCSV = () => {
    if (!data) return;
    const exportData = data.stockTrends.map(t => ({
      Date: t.date,
      Value: t.value,
      Units: t.units
    }));
    exportToCSV(exportData, 'storium-stock-trends');
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
