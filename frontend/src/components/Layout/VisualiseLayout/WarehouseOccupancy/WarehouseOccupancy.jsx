// WarehouseOccupancy Component
// Path: frontend/src/components/Visualise/WarehouseOccupancy/WarehouseOccupancy.jsx

import { useState, useMemo } from 'react';
import { ChevronDown, Warehouse } from 'lucide-react';
import styles from './WarehouseOccupancy.module.css';

/**
 * WarehouseOccupancy Component
 * Displays warehouse zone occupancy as a visual grid
 */
const WarehouseOccupancy = ({ zones = [] }) => {
  const [selectedZoneId, setSelectedZoneId] = useState(zones[0]?.id || null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedZone = useMemo(() => {
    return zones.find(z => z.id === selectedZoneId) || zones[0] || null;
  }, [zones, selectedZoneId]);

  const handleZoneSelect = (zoneId) => {
    setSelectedZoneId(zoneId);
    setDropdownOpen(false);
  };

  const getSlotClass = (occupancy) => {
    switch (occupancy) {
      case 'high': return styles.slotHigh;
      case 'medium': return styles.slotMedium;
      case 'low': return styles.slotLow;
      default: return styles.slotEmpty;
    }
  };

  const legendItems = [
    { label: 'Empty', className: styles.legendEmpty },
    { label: 'Low (< 40%)', className: styles.legendLow },
    { label: 'Medium (40-80%)', className: styles.legendMedium },
    { label: 'High (> 80%)', className: styles.legendHigh },
  ];

  if (zones.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>Warehouse Occupancy</h3>
        </div>
        <div className={styles.emptyState}>
          <Warehouse size={48} />
          <p>No warehouse data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Warehouse Occupancy</h3>
        
        {/* Zone Selector Dropdown */}
        <div className={styles.zoneSelector}>
          <button 
            className={styles.zoneSelectorButton}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <Warehouse size={16} />
            <span>{selectedZone?.name || 'Select Zone'}</span>
            <ChevronDown size={16} />
          </button>
          
          {dropdownOpen && (
            <div className={styles.zoneDropdown}>
              {zones.map(zone => (
                <div
                  key={zone.id}
                  className={`${styles.zoneOption} ${
                    zone.id === selectedZoneId ? styles.zoneOptionActive : ''
                  }`}
                  onClick={() => handleZoneSelect(zone.id)}
                >
                  {zone.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Occupancy Grid */}
      {selectedZone && selectedZone.slots && selectedZone.slots.length > 0 ? (
        <div className={styles.grid}>
          {selectedZone.slots.map((slot) => (
            <div
              key={slot.id}
              className={`${styles.slot} ${getSlotClass(slot.occupancy)}`}
              title={slot.label}
            >
              <div className={styles.slotTooltip}>
                <div className={styles.tooltipLabel}>{slot.label}</div>
                {slot.product && (
                  <div className={styles.tooltipProduct}>
                    {slot.product} ({slot.quantity}/{slot.capacity})
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>No slots in this zone</p>
        </div>
      )}

      {/* Legend */}
      <div className={styles.legend}>
        {legendItems.map(item => (
          <div key={item.label} className={styles.legendItem}>
            <div className={`${styles.legendColor} ${item.className}`} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WarehouseOccupancy;
