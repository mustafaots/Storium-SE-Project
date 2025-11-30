import styles from './VisualisePage.module.css';
import NavBar from '../../components/UI/NavBar/NavBar';
import { useActiveNavItem } from '../../hooks/useActiveNavItem';
import Header from '../../components/UI/Header/Header';
import StatCard from '../../components/Visualise/StatCard/StatCard';
import Chart from '../../components/Visualise/Chart/Chart';
import WarehouseOccupancy from '../../components/Visualise/WarehouseOccupancy/WarehouseOccupancy';
import FilterBar from '../../components/Visualise/FilterBar/FilterBar';
import {
  FaDollarSign,
  FaArrowsAltH,
  FaExclamationTriangle,
  FaChartBar
} from 'react-icons/fa';

function VisualisePage() {
  const activeItem = useActiveNavItem();

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.mainContent}>
        <div className={styles.content}>
          <div className={styles.listContainer}>
            <Header
              title="VISUALISE"
              subtitle="Data & Insights for Your Inventory"
              size="small"
              align="left"
              icon={<FaChartBar size={30} />}
            />

            <FilterBar />

            <div className={styles.statsGrid}>
              <StatCard
                title="Total Stock Value"
                value="$1,234,567"
                icon={<FaDollarSign />}
              />
              <StatCard
                title="Movements Today"
                value="8,432"
                icon={<FaArrowsAltH />}
              />
              <StatCard
                title="Below Min. Level"
                value="15"
                icon={<FaExclamationTriangle />}
              />
              <StatCard
                title="Warehouse Occupancy"
                value="78%"
                icon={<FaChartBar />}
              />
            </div>

            <div className={styles.chartsGrid}>
              <div className={styles.chartWrapper}>
                <Chart />
              </div>
              <div className={styles.occupancyWrapper}>
                <WarehouseOccupancy />
              </div>
            </div>
          </div>
        </div>
      </div>

      <NavBar activeItem={activeItem} />
    </div>
  );
}

export default VisualisePage;