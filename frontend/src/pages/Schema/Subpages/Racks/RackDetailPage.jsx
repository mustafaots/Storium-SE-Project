import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { FaArrowLeft, FaBorderAll, FaSyncAlt, FaPlus, FaBoxes, FaTrash, FaEdit, FaTruck, FaUtensils, FaUserTie } from 'react-icons/fa';

import NavBar from '../../../../components/UI/NavBar/NavBar';
import Header from '../../../../components/UI/Header/Header';
import Button from '../../../../components/UI/Button/Button';
import { useActiveNavItem } from '../../../../hooks/useActiveNavItem';
import { useRackLayout } from '../../../../hooks/useRackLayout';
import { transactionsAPI } from '../../../../utils/transactionsAPI';

import styles from './RackDetailPage.module.css';

const API_BASE_URL = 'http://localhost:3001/api';

const strategyOptions = ['FIFO', 'LIFO', 'JIT'];
const productTypeOptions = ['raw', 'wip', 'to_ship', 'deadstock', 'discrepancy'];
const defaultStockForm = {
  product_id: '',
  quantity: 1,
  batch_no: '',
  expiry_date: '',
  strategy: 'FIFO',
  product_type: 'raw',
  is_consumable: false,
  sale_price: '',
  cost_price: ''
};

const RackDetailPage = () => {
  const { locationId, depotId, aisleId, rackId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const activeItem = useActiveNavItem();

  const {
    layoutData,
    loading,
    error,
    setError,
    loadLayout,
    createStock,
    moveStock
  } = useRackLayout(locationId, depotId, aisleId, rackId);

  const [selectedDirection, setSelectedDirection] = useState('R');
  const [products, setProducts] = useState([]);
  const [productsError, setProductsError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [targetSlot, setTargetSlot] = useState(null);
  const [stockForm, setStockForm] = useState(defaultStockForm);

  // Stock options modal state
  const [showStockOptions, setShowStockOptions] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [stockOptionMode, setStockOptionMode] = useState(null); // 'edit' | 'migrate' | 'consume' | 'send'
  const [editForm, setEditForm] = useState({});
  
  // Migration state
  const [locations, setLocations] = useState([]);
  const [depots, setDepots] = useState([]);
  const [aisles, setAisles] = useState([]);
  const [racks, setRacks] = useState([]);
  const [emptySlots, setEmptySlots] = useState([]);
  const [migrateForm, setMigrateForm] = useState({
    locationId: '',
    depotId: '',
    aisleId: '',
    rackId: '',
    slotId: ''
  });

  // Consume and Send to Client state
  const [clients, setClients] = useState([]);
  const [consumeForm, setConsumeForm] = useState({ quantity: 1, note: '' });
  const [sendForm, setSendForm] = useState({ quantity: 1, clientId: '', note: '' });

  useEffect(() => {
    loadLayout();
  }, [loadLayout]);

  useEffect(() => {
    if (layoutData?.layout?.directions?.length) {
      setSelectedDirection(layoutData.layout.directions[0]);
    }
  }, [layoutData]);

  const fetchProducts = useCallback(async () => {
    try {
      setProductsError('');
      const response = await fetch(`${API_BASE_URL}/products?page=1&limit=100`);
      const data = await response.json();
      if (data.success) {
        setProducts(data.data || []);
      } else {
        setProductsError(data.error || 'Failed to load products');
      }
    } catch (err) {
      setProductsError(err?.message || 'Failed to load products');
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const slotMap = useMemo(() => {
    const map = new Map();
    (layoutData?.slots || []).forEach((slot) => {
      const key = `${slot.direction}-${slot.level_no}-${slot.bay_no}-${slot.bin_no}`;
      // Prefer slots that have stock over empty ones
      const existing = map.get(key);
      if (!existing || slot.stock) {
        map.set(key, slot);
      }
    });
    console.log('slotMap built:', map.size, 'slots with stock:', [...map.values()].filter(s => s.stock).length);
    return map;
  }, [layoutData]);

  const getProductName = useCallback((productId) => {
    const product = products.find((p) => `${p.product_id}` === `${productId}`);
    if (product?.name) return product.name;
    if (productId) return `Product #${productId}`;
    return 'Unknown product';
  }, [products]);

  // Stock options handlers
  const handleStockClick = (stock, slot) => {
    setSelectedStock({ ...stock, slot });
    setStockOptionMode(null);
    setShowStockOptions(true);
  };

  const handleCloseStockOptions = () => {
    setShowStockOptions(false);
    setSelectedStock(null);
    setStockOptionMode(null);
    setEditForm({});
    setMigrateForm({ locationId: '', depotId: '', aisleId: '', rackId: '', slotId: '' });
    setConsumeForm({ quantity: 1, note: '' });
    setSendForm({ quantity: 1, clientId: '', note: '' });
    setDepots([]);
    setAisles([]);
    setRacks([]);
    setEmptySlots([]);
    setClients([]);
  };

  const handleDiscardStock = async () => {
    if (!selectedStock) return;
    if (!window.confirm('Are you sure you want to discard this stock?')) return;
    setActionLoading(true);
    try {
      const resp = await fetch(`${API_BASE_URL}/locations/${locationId}/depots/${depotId}/aisles/${aisleId}/racks/stocks/${selectedStock.stock_id}`, {
        method: 'DELETE'
      });
      const data = await resp.json();
      if (data.success) {
        handleCloseStockOptions();
        await loadLayout();
      } else {
        setError(data.error || 'Failed to discard stock');
      }
    } catch (err) {
      setError(err?.message || 'Failed to discard stock');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditStock = () => {
    setEditForm({
      quantity: selectedStock.quantity,
      batch_no: selectedStock.batch_no || '',
      expiry_date: selectedStock.expiry_date?.split('T')[0] || '',
      strategy: selectedStock.strategy,
      product_type: selectedStock.product_type,
      is_consumable: selectedStock.is_consumable,
      sale_price: selectedStock.sale_price || '',
      cost_price: selectedStock.cost_price || ''
    });
    setStockOptionMode('edit');
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedStock) return;
    setActionLoading(true);
    try {
      const resp = await fetch(`${API_BASE_URL}/locations/${locationId}/depots/${depotId}/aisles/${aisleId}/racks/stocks/${selectedStock.stock_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      const data = await resp.json();
      if (data.success) {
        handleCloseStockOptions();
        await loadLayout();
      } else {
        setError(data.error || 'Failed to update stock');
      }
    } catch (err) {
      setError(err?.message || 'Failed to update stock');
    } finally {
      setActionLoading(false);
    }
  };

  // Migration handlers
  const handleMigrateStock = async () => {
    setStockOptionMode('migrate');
    // Load locations
    try {
      const resp = await fetch(`${API_BASE_URL}/locations?limit=100`);
      const data = await resp.json();
      if (data.success) {
        setLocations(data.data || []);
      }
    } catch (err) {
      setError('Failed to load locations');
    }
  };

  const handleMigrateChange = async (e) => {
    const { name, value } = e.target;
    setMigrateForm((prev) => ({ ...prev, [name]: value }));

    if (name === 'locationId' && value) {
      // Load depots for selected location
      try {
        const resp = await fetch(`${API_BASE_URL}/locations/${value}/depots?limit=100`);
        const data = await resp.json();
        setDepots(data.success ? data.data || [] : []);
        setAisles([]);
        setRacks([]);
        setEmptySlots([]);
        setMigrateForm((prev) => ({ ...prev, depotId: '', aisleId: '', rackId: '', slotId: '' }));
      } catch (err) {
        setDepots([]);
      }
    } else if (name === 'depotId' && value) {
      // Load aisles for selected depot
      try {
        const resp = await fetch(`${API_BASE_URL}/locations/${migrateForm.locationId}/depots/${value}/aisles?limit=100`);
        const data = await resp.json();
        setAisles(data.success ? data.data || [] : []);
        setRacks([]);
        setEmptySlots([]);
        setMigrateForm((prev) => ({ ...prev, aisleId: '', rackId: '', slotId: '' }));
      } catch (err) {
        setAisles([]);
      }
    } else if (name === 'aisleId' && value) {
      // Load racks for selected aisle
      try {
        const resp = await fetch(`${API_BASE_URL}/locations/${migrateForm.locationId}/depots/${migrateForm.depotId}/aisles/${value}/racks?limit=100`);
        const data = await resp.json();
        setRacks(data.success ? data.data || [] : []);
        setEmptySlots([]);
        setMigrateForm((prev) => ({ ...prev, rackId: '', slotId: '' }));
      } catch (err) {
        setRacks([]);
      }
    } else if (name === 'rackId' && value) {
      // Load empty slots for selected rack
      try {
        const resp = await fetch(`${API_BASE_URL}/racks/${value}/empty-slots`);
        const data = await resp.json();
        setEmptySlots(data.success ? data.data || [] : []);
        setMigrateForm((prev) => ({ ...prev, slotId: '' }));
      } catch (err) {
        setEmptySlots([]);
      }
    }
  };

  const handleSaveMigrate = async (e) => {
    e.preventDefault();
    if (!selectedStock || !migrateForm.slotId) return;
    setActionLoading(true);
    try {
      const targetRack = racks.find(r => `${r.rack_id}` === `${migrateForm.rackId}`);
      const resp = await fetch(`${API_BASE_URL}/locations/${locationId}/depots/${depotId}/aisles/${aisleId}/racks/stocks/migrate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stockId: selectedStock.stock_id,
          targetSlotId: migrateForm.slotId,
          rackCode: targetRack?.rack_code || ''
        })
      });
      const data = await resp.json();
      if (data.success) {
        handleCloseStockOptions();
        await loadLayout();
      } else {
        setError(data.error || 'Failed to migrate stock');
      }
    } catch (err) {
      setError(err?.message || 'Failed to migrate stock');
    } finally {
      setActionLoading(false);
    }
  };

  // Consume stock handlers
  const handleConsumeStock = () => {
    const stockIsConsumable = Boolean(selectedStock?.is_consumable ?? selectedStock?.consumable);
    if (!stockIsConsumable) return;
    setConsumeForm({ quantity: 1, note: '' });
    setStockOptionMode('consume');
  };

  const handleConsumeChange = (e) => {
    const { name, value } = e.target;
    setConsumeForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveConsume = async (e) => {
    e.preventDefault();
    if (!selectedStock || !consumeForm.quantity) return;
    if (Number(consumeForm.quantity) > selectedStock.quantity) {
      setError('Cannot consume more than available quantity');
      return;
    }
    setActionLoading(true);
    try {
      await transactionsAPI.consumption({
        stockId: selectedStock.stock_id,
        productId: selectedStock.product_id,
        slotId: selectedStock.slot?.slot_id,
        quantity: Number(consumeForm.quantity),
        note: consumeForm.note || `Consumed ${consumeForm.quantity} units`
      });
      handleCloseStockOptions();
      await loadLayout();
    } catch (err) {
      setError(err?.message || 'Failed to consume stock');
    } finally {
      setActionLoading(false);
    }
  };

  // Send to client handlers
  const handleSendToClient = async () => {
    setSendForm({ quantity: 1, clientId: '', note: '' });
    setStockOptionMode('send');
    // Load clients
    try {
      const resp = await fetch(`${API_BASE_URL}/clients?limit=100`);
      const data = await resp.json();
      if (data.success) {
        setClients(data.data || []);
      }
    } catch (err) {
      setError('Failed to load clients');
    }
  };

  const handleSendChange = (e) => {
    const { name, value } = e.target;
    setSendForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveSend = async (e) => {
    e.preventDefault();
    if (!selectedStock || !sendForm.quantity || !sendForm.clientId) return;
    if (Number(sendForm.quantity) > selectedStock.quantity) {
      setError('Cannot send more than available quantity');
      return;
    }
    setActionLoading(true);
    try {
      await transactionsAPI.manualOutflow({
        stockId: selectedStock.stock_id,
        productId: selectedStock.product_id,
        fromSlotId: selectedStock.slot?.slot_id,
        clientId: Number(sendForm.clientId),
        quantity: Number(sendForm.quantity),
        unitPrice: selectedStock.sale_price || 0,
        note: sendForm.note || `Sent to client`
      });
      handleCloseStockOptions();
      await loadLayout();
    } catch (err) {
      setError(err?.message || 'Failed to send stock to client');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBack = () => {
    navigate(`/locations/${locationId}/depots/${depotId}/aisles/${aisleId}/racks`, {
      state: {
        locationName: state?.locationName,
        depotName: state?.depotName,
        aisleName: state?.aisleName
      }
    });
  };

  const handleAddStock = (slot) => {
    setTargetSlot(slot);
    setStockForm(defaultStockForm);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setTargetSlot(null);
  };

  const handleStockChange = (e) => {
    const { name, value, type, checked } = e.target;
    setStockForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCreateStock = async (e) => {
    e.preventDefault();
    if (!targetSlot) return;
    setActionLoading(true);
    setError('');
    try {
      const payload = {
        ...stockForm,
        product_id: Number(stockForm.product_id),
        quantity: Number(stockForm.quantity),
        sale_price: stockForm.sale_price === '' ? null : Number(stockForm.sale_price),
        cost_price: stockForm.cost_price === '' ? null : Number(stockForm.cost_price)
      };

      const resp = await createStock(targetSlot.slot_id, payload, async (newStockData) => {
        // Create inflow transaction for new stock
        try {
          await transactionsAPI.stockInflow({
            stockId: newStockData.stock_id,
            productId: payload.product_id,
            slotId: targetSlot.slot_id,
            quantity: payload.quantity,
            unitPrice: payload.cost_price || 0,
            note: `New stock added: ${payload.quantity} units`
          });
        } catch (txnError) {
          console.error('Failed to create inflow transaction:', txnError);
        }
        await loadLayout();
      });
      if (resp?.success) {
        setShowModal(false);
        setTargetSlot(null);
        setStockForm(defaultStockForm);
      }
    } catch (err) {
      setError(err?.message || 'Failed to create stock');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result?.destination || !layoutData) return;
    const sourceSlotId = Number(result.source?.droppableId?.replace('slot-', ''));
    const targetSlotId = Number(result.destination?.droppableId?.replace('slot-', ''));
    const stockId = Number(result.draggableId);

    if (!stockId || !targetSlotId || sourceSlotId === targetSlotId) return;

    const sourceSlot = layoutData.slots?.find((s) => s.slot_id === sourceSlotId);
    const targetSlot = layoutData.slots?.find((s) => s.slot_id === targetSlotId);
    if (targetSlot?.stock) {
      setError('Target slot already has stock.');
      return;
    }

    // Get stock info for the transaction
    const stockInfo = sourceSlot?.stock;
    if (!stockInfo) {
      setError('Stock information not found.');
      return;
    }

    setActionLoading(true);
    setError('');
    try {
      await moveStock(stockId, targetSlotId, async () => {
        // Create relocation transaction after successful move
        try {
          await transactionsAPI.relocation({
            stockId: stockId,
            productId: stockInfo.product_id,
            fromSlotId: sourceSlotId,
            toSlotId: targetSlotId,
            quantity: stockInfo.quantity,
            note: `Stock relocated from slot ${sourceSlot?.coordinate || sourceSlotId} to slot ${targetSlot?.coordinate || targetSlotId}`
          });
        } catch (txnError) {
          console.error('Failed to create relocation transaction:', txnError);
          // Don't block the UI since the move was successful
        }
        await loadLayout();
      });
    } finally {
      setActionLoading(false);
    }
  };

  const renderSlotCell = (slot, bay, bin, binsPerBay, totalBays) => (
    <Droppable key={`slot-${slot?.slot_id || `${bay}-${bin}`}`} droppableId={`slot-${slot?.slot_id || `${bay}-${bin}`}`} isDropDisabled={!slot || actionLoading}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`${styles.slotCell} ${slot?.stock ? styles.filled : styles.empty} ${snapshot.isDraggingOver ? styles.dropping : ''} ${(bin === binsPerBay && bay < totalBays) ? styles.baySeparator : ''}`}
          onClick={() => (!slot?.stock && slot && !actionLoading ? handleAddStock(slot) : null)}
        >
          <div className={styles.slotMeta}>
            <span className={styles.slotLabel}>Bay {bay} · Bin {bin}</span>
            <span className={styles.slotCoord}>{slot?.coordinate || 'No slot found'}</span>
          </div>

          {slot?.stock ? (
            <Draggable draggableId={`${slot.stock.stock_id}`} index={slot.stock.stock_id} isDragDisabled={actionLoading}>
              {(dragProvided, dragSnapshot) => (
                <div
                  ref={dragProvided.innerRef}
                  {...dragProvided.draggableProps}
                  {...dragProvided.dragHandleProps}
                  className={`${styles.stockCard} ${dragSnapshot.isDragging ? styles.dragging : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStockClick(slot.stock, slot);
                  }}
                  title="Click to manage stock"
                >
                  <div className={styles.stockHeader}>
                    <span className={styles.stockProduct}>{getProductName(slot.stock.product_id)}</span>
                    <span className={styles.stockBadge}>{slot.stock.strategy}</span>
                  </div>
                  <div className={styles.stockDetails}>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Qty</span>
                      <span className={styles.detailValue}>{slot.stock.quantity}</span>
                    </div>
                    {slot.stock.batch_no && (
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Batch</span>
                        <span className={styles.detailValue}>{slot.stock.batch_no}</span>
                      </div>
                    )}
                  </div>
                  <div className={styles.stockFooter}>
                    {slot.stock.expiry_date && (
                      <div className={styles.footerRow}>
                        <span className={styles.detailLabel}>Expiry</span>
                        <span className={styles.detailValue}>{slot.stock.expiry_date}</span>
                      </div>
                    )}
                    <div className={styles.footerRow}>
                      <span className={styles.detailLabel}>Type</span>
                      <span className={styles.detailValue}>{slot.stock.product_type}</span>
                    </div>
                  </div>
                </div>
              )}
            </Draggable>
          ) : (
            <button
              type="button"
              className={styles.addStockBtn}
              onClick={() => slot && handleAddStock(slot)}
              disabled={!slot || actionLoading}
            >
              <FaPlus />
              <span>Add stock</span>
            </button>
          )}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );

  const renderDirectionGrid = (direction) => {
    if (!layoutData?.layout) return null;
    const { bays, bins_per_bay, levels } = layoutData.layout;
    const totalColumns = bays * bins_per_bay;

    const rows = [];
    for (let level = levels; level >= 1; level -= 1) {
      const cells = [];
      for (let bay = 1; bay <= bays; bay += 1) {
        for (let bin = 1; bin <= bins_per_bay; bin += 1) {
          const slotKey = `${direction}-${level}-${bay}-${bin}`;
          const slot = slotMap.get(slotKey);
          cells.push(renderSlotCell(slot, bay, bin, bins_per_bay, bays));
        }
      }

      rows.push(
        <div key={`${direction}-level-${level}`} className={styles.levelRow}>
          <div className={styles.levelLabel}>Level {level}</div>
          <div
            className={styles.slotGrid}
            style={{ gridTemplateColumns: `repeat(${totalColumns}, minmax(180px, 1fr))` }}
          >
            {cells}
          </div>
        </div>
      );
    }

    return rows;
  };

  const rackCode = state?.rackCode || layoutData?.rack?.rack_code;
  const locationName = state?.locationName;
  const depotName = state?.depotName;
  const aisleName = state?.aisleName;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.mainContent}>
        <div className={styles.content}>
          <div className={styles.headerRow}>
            <span className={styles.backLink} onClick={handleBack}>
              <FaArrowLeft style={{ marginRight: '8px' }} /> Back to Racks
            </span>
            <div className={styles.headerActions}>
              <Button variant="secondary" onClick={() => loadLayout()} leadingIcon={<FaSyncAlt />} disabled={loading || actionLoading}>
                Refresh
              </Button>
            </div>
          </div>

          <Header title="RACK DETAIL" subtitle="Manage slots and stock placements" size="small" align="left" icon={<FaBorderAll size={28} />} />

          {(error || productsError) && (
            <div className={styles.errorAlert}>
              <div className={styles.errorContent}>
                <span className={styles.errorMessage}>{error || productsError}</span>
                <button onClick={() => { setError(''); setProductsError(''); }} className={styles.closeBtn}>×</button>
              </div>
            </div>
          )}

          <div className={styles.summaryGrid}>
            <div className={styles.infoCard}>
              <div className={styles.infoLabel}>Rack code</div>
              <div className={styles.infoValue}>{rackCode || 'Loading...'}</div>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoLabel}>Layout</div>
              <div className={styles.infoValue}>
                {layoutData?.layout ? (
                  <span>
                    {layoutData.layout.levels} levels · {layoutData.layout.bays} bays · {layoutData.layout.bins_per_bay} bins
                    {layoutData.layout.directions?.length === 2 ? ' · Double face' : ' · Single face'}
                  </span>
                ) : 'Loading...'}
              </div>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoLabel}>Context</div>
              <div className={styles.infoValue}>
                {locationName && <span className={styles.badge}>Location: {locationName}</span>}
                {depotName && <span className={styles.badge}>Depot: {depotName}</span>}
                {aisleName && <span className={styles.badge}>Aisle: {aisleName}</span>}
              </div>
            </div>
          </div>

          <div className={styles.layoutSection}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>
                <FaBorderAll />
                <span>Slots</span>
              </div>
              <div className={styles.directionToggle}>
                {(layoutData?.layout?.directions || ['R']).map((dir) => (
                  <button
                    key={dir}
                    className={`${styles.directionButton} ${selectedDirection === dir ? styles.activeDirection : ''}`}
                    onClick={() => setSelectedDirection(dir)}
                    disabled={loading || actionLoading}
                  >
                    Face {dir}
                  </button>
                ))}
              </div>
            </div>

            {loading && !layoutData ? (
              <div className={styles.loadingState}>Loading layout...</div>
            ) : (
              <div className={styles.gridScroll}>
                <DragDropContext onDragEnd={handleDragEnd}>
                  {renderDirectionGrid(selectedDirection)}
                </DragDropContext>
              </div>
            )}
          </div>
        </div>
      </div>
      <NavBar activeItem={activeItem} />

      {showModal && targetSlot && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div>
                <div className={styles.modalTitle}>Add stock</div>
                <div className={styles.modalSubtitle}>{targetSlot.coordinate}</div>
              </div>
              <button className={styles.closeBtn} onClick={handleModalClose}>×</button>
            </div>

            <form className={styles.modalForm} onSubmit={handleCreateStock}>
              <div className={styles.formRow}>
                <label className={styles.formLabel}>Product</label>
                <select
                  name="product_id"
                  className={styles.formInput}
                  value={stockForm.product_id}
                  onChange={handleStockChange}
                  required
                  disabled={actionLoading}
                >
                  <option value="">Select product</option>
                  {products.map((p) => (
                    <option key={p.product_id} value={p.product_id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formRowSplit}>
                <div className={styles.formRow}>
                  <label className={styles.formLabel}>Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    className={styles.formInput}
                    value={stockForm.quantity}
                    onChange={handleStockChange}
                    required
                    disabled={actionLoading}
                  />
                </div>
                <div className={styles.formRow}>
                  <label className={styles.formLabel}>Strategy</label>
                  <select
                    name="strategy"
                    className={styles.formInput}
                    value={stockForm.strategy}
                    onChange={handleStockChange}
                    required
                    disabled={actionLoading}
                  >
                    {strategyOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formRowSplit}>
                <div className={styles.formRow}>
                  <label className={styles.formLabel}>Product type</label>
                  <select
                    name="product_type"
                    className={styles.formInput}
                    value={stockForm.product_type}
                    onChange={handleStockChange}
                    required
                    disabled={actionLoading}
                  >
                    {productTypeOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formRow}>
                  <label className={styles.formLabel}>Batch</label>
                  <input
                    type="text"
                    name="batch_no"
                    className={styles.formInput}
                    value={stockForm.batch_no}
                    onChange={handleStockChange}
                    placeholder="Optional"
                    disabled={actionLoading}
                  />
                </div>
              </div>

              <div className={styles.formRowSplit}>
                <div className={styles.formRow}>
                  <label className={styles.formLabel}>Expiry</label>
                  <input
                    type="date"
                    name="expiry_date"
                    className={styles.formInput}
                    value={stockForm.expiry_date}
                    onChange={handleStockChange}
                    disabled={actionLoading}
                  />
                </div>
                <div className={styles.formRow}>
                  <label className={styles.formLabel}>Sale price</label>
                  <input
                    type="number"
                    step="0.01"
                    name="sale_price"
                    className={styles.formInput}
                    value={stockForm.sale_price}
                    onChange={handleStockChange}
                    placeholder="Optional"
                    disabled={actionLoading}
                  />
                </div>
              </div>

              <div className={styles.formRowSplit}>
                <div className={styles.formRow}>
                  <label className={styles.formLabel}>Cost price</label>
                  <input
                    type="number"
                    step="0.01"
                    name="cost_price"
                    className={styles.formInput}
                    value={stockForm.cost_price}
                    onChange={handleStockChange}
                    placeholder="Optional"
                    disabled={actionLoading}
                  />
                </div>
                <div className={`${styles.formRow} ${styles.checkboxRow}`}>
                  <label className={styles.formLabel}>Consumable</label>
                  <input
                    type="checkbox"
                    name="is_consumable"
                    checked={stockForm.is_consumable}
                    onChange={handleStockChange}
                    disabled={actionLoading}
                  />
                </div>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.secondaryButton} onClick={handleModalClose} disabled={actionLoading}>
                  Cancel
                </button>
                <button type="submit" className={styles.primaryButton} disabled={actionLoading}>
                  {actionLoading ? 'Saving...' : 'Create stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Options Modal */}
      {showStockOptions && selectedStock && (
        <div className={styles.modalOverlay} onClick={handleCloseStockOptions}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>
                <FaBoxes style={{ marginRight: '0.5rem' }} />
                Stock Options
              </h3>
              <button className={styles.modalClose} onClick={handleCloseStockOptions}>×</button>
            </div>

            {/* Show options if no mode selected */}
            {!stockOptionMode && (
              <div className={styles.stockOptionsGrid}>
                <button className={styles.stockOptionBtn} onClick={handleDiscardStock} disabled={actionLoading}>
                  <FaTrash className={styles.optionIcon} />
                  <span className={styles.optionLabel}>Discard</span>
                  <span className={styles.optionDesc}>Remove this stock</span>
                </button>
                <button className={styles.stockOptionBtn} onClick={handleEditStock} disabled={actionLoading}>
                  <FaEdit className={styles.optionIcon} />
                  <span className={styles.optionLabel}>Edit</span>
                  <span className={styles.optionDesc}>Update details</span>
                </button>
                <button className={styles.stockOptionBtn} onClick={handleMigrateStock} disabled={actionLoading}>
                  <FaTruck className={styles.optionIcon} />
                  <span className={styles.optionLabel}>Migrate</span>
                  <span className={styles.optionDesc}>Move to another rack</span>
                </button>
                {Boolean(selectedStock?.is_consumable ?? selectedStock?.consumable) && (
                  <button className={styles.stockOptionBtn} onClick={handleConsumeStock} disabled={actionLoading}>
                    <FaUtensils className={styles.optionIcon} />
                    <span className={styles.optionLabel}>Consume</span>
                    <span className={styles.optionDesc}>Use internally</span>
                  </button>
                )}
                <button className={styles.stockOptionBtn} onClick={handleSendToClient} disabled={actionLoading}>
                  <FaUserTie className={styles.optionIcon} />
                  <span className={styles.optionLabel}>Send</span>
                  <span className={styles.optionDesc}>Send to client</span>
                </button>
              </div>
            )}

            {/* Edit form */}
            {stockOptionMode === 'edit' && (
              <form onSubmit={handleSaveEdit} className={styles.modalForm}>
                <div className={styles.formRowSplit}>
                  <div className={styles.formRow}>
                    <label className={styles.formLabel}>Quantity</label>
                    <input
                      type="number"
                      name="quantity"
                      className={styles.formInput}
                      value={editForm.quantity || ''}
                      onChange={handleEditChange}
                      min="1"
                      required
                      disabled={actionLoading}
                    />
                  </div>
                  <div className={styles.formRow}>
                    <label className={styles.formLabel}>Strategy</label>
                    <select
                      name="strategy"
                      className={styles.formInput}
                      value={editForm.strategy || 'FIFO'}
                      onChange={handleEditChange}
                      disabled={actionLoading}
                    >
                      {strategyOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.formRowSplit}>
                  <div className={styles.formRow}>
                    <label className={styles.formLabel}>Product type</label>
                    <select
                      name="product_type"
                      className={styles.formInput}
                      value={editForm.product_type || 'non-perishable'}
                      onChange={handleEditChange}
                      disabled={actionLoading}
                    >
                      {productTypeOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formRow}>
                    <label className={styles.formLabel}>Batch</label>
                    <input
                      type="text"
                      name="batch_no"
                      className={styles.formInput}
                      value={editForm.batch_no || ''}
                      onChange={handleEditChange}
                      placeholder="Optional"
                      disabled={actionLoading}
                    />
                  </div>
                </div>

                <div className={styles.formRowSplit}>
                  <div className={styles.formRow}>
                    <label className={styles.formLabel}>Expiry</label>
                    <input
                      type="date"
                      name="expiry_date"
                      className={styles.formInput}
                      value={editForm.expiry_date || ''}
                      onChange={handleEditChange}
                      disabled={actionLoading}
                    />
                  </div>
                  <div className={styles.formRow}>
                    <label className={styles.formLabel}>Sale price</label>
                    <input
                      type="number"
                      step="0.01"
                      name="sale_price"
                      className={styles.formInput}
                      value={editForm.sale_price || ''}
                      onChange={handleEditChange}
                      placeholder="Optional"
                      disabled={actionLoading}
                    />
                  </div>
                </div>

                <div className={styles.formRowSplit}>
                  <div className={styles.formRow}>
                    <label className={styles.formLabel}>Cost price</label>
                    <input
                      type="number"
                      step="0.01"
                      name="cost_price"
                      className={styles.formInput}
                      value={editForm.cost_price || ''}
                      onChange={handleEditChange}
                      placeholder="Optional"
                      disabled={actionLoading}
                    />
                  </div>
                  <div className={`${styles.formRow} ${styles.checkboxRow}`}>
                    <label className={styles.formLabel}>Consumable</label>
                    <input
                      type="checkbox"
                      name="is_consumable"
                      checked={editForm.is_consumable || false}
                      onChange={handleEditChange}
                      disabled={actionLoading}
                    />
                  </div>
                </div>

                <div className={styles.modalActions}>
                  <button type="button" className={styles.secondaryButton} onClick={() => setStockOptionMode(null)} disabled={actionLoading}>
                    Back
                  </button>
                  <button type="submit" className={styles.primaryButton} disabled={actionLoading}>
                    {actionLoading ? 'Saving...' : 'Save changes'}
                  </button>
                </div>
              </form>
            )}

            {/* Migrate form */}
            {stockOptionMode === 'migrate' && (
              <form onSubmit={handleSaveMigrate} className={styles.modalForm}>
                <p className={styles.migrateHint}>Select the target location for this stock:</p>

                <div className={styles.formRow}>
                  <label className={styles.formLabel}>Location</label>
                  <select
                    name="locationId"
                    className={styles.formInput}
                    value={migrateForm.locationId}
                    onChange={handleMigrateChange}
                    required
                    disabled={actionLoading}
                  >
                    <option value="">Select location...</option>
                    {locations.map((loc) => (
                      <option key={loc.location_id} value={loc.location_id}>{loc.name}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formRow}>
                  <label className={styles.formLabel}>Depot</label>
                  <select
                    name="depotId"
                    className={styles.formInput}
                    value={migrateForm.depotId}
                    onChange={handleMigrateChange}
                    required
                    disabled={actionLoading || !migrateForm.locationId}
                  >
                    <option value="">Select depot...</option>
                    {depots.map((d) => (
                      <option key={d.depot_id} value={d.depot_id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formRow}>
                  <label className={styles.formLabel}>Aisle</label>
                  <select
                    name="aisleId"
                    className={styles.formInput}
                    value={migrateForm.aisleId}
                    onChange={handleMigrateChange}
                    required
                    disabled={actionLoading || !migrateForm.depotId}
                  >
                    <option value="">Select aisle...</option>
                    {aisles.map((a) => (
                      <option key={a.aisle_id} value={a.aisle_id}>{a.name}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formRow}>
                  <label className={styles.formLabel}>Rack</label>
                  <select
                    name="rackId"
                    className={styles.formInput}
                    value={migrateForm.rackId}
                    onChange={handleMigrateChange}
                    required
                    disabled={actionLoading || !migrateForm.aisleId}
                  >
                    <option value="">Select rack...</option>
                    {racks.map((r) => (
                      <option key={r.rack_id} value={r.rack_id}>{r.name} ({r.rack_code})</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formRow}>
                  <label className={styles.formLabel}>Empty slot</label>
                  <select
                    name="slotId"
                    className={styles.formInput}
                    value={migrateForm.slotId}
                    onChange={(e) => setMigrateForm((prev) => ({ ...prev, slotId: e.target.value }))}
                    required
                    disabled={actionLoading || !migrateForm.rackId}
                  >
                    <option value="">Select slot...</option>
                    {emptySlots.map((s) => (
                      <option key={s.slot_id} value={s.slot_id}>{s.coordinate}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.modalActions}>
                  <button type="button" className={styles.secondaryButton} onClick={() => setStockOptionMode(null)} disabled={actionLoading}>
                    Back
                  </button>
                  <button type="submit" className={styles.primaryButton} disabled={actionLoading || !migrateForm.slotId}>
                    {actionLoading ? 'Migrating...' : 'Migrate stock'}
                  </button>
                </div>
              </form>
            )}

            {/* Consume form */}
            {stockOptionMode === 'consume' && (
              <form onSubmit={handleSaveConsume} className={styles.modalForm}>
                <p className={styles.migrateHint}>Consume stock internally (available: {selectedStock.quantity} units)</p>

                <div className={styles.formRow}>
                  <label className={styles.formLabel}>Quantity to consume</label>
                  <input
                    type="number"
                    name="quantity"
                    className={styles.formInput}
                    value={consumeForm.quantity}
                    onChange={handleConsumeChange}
                    min="1"
                    max={selectedStock.quantity}
                    required
                    disabled={actionLoading}
                  />
                </div>

                <div className={styles.formRow}>
                  <label className={styles.formLabel}>Note (optional)</label>
                  <input
                    type="text"
                    name="note"
                    className={styles.formInput}
                    value={consumeForm.note}
                    onChange={handleConsumeChange}
                    placeholder="Reason for consumption..."
                    disabled={actionLoading}
                  />
                </div>

                <div className={styles.modalActions}>
                  <button type="button" className={styles.secondaryButton} onClick={() => setStockOptionMode(null)} disabled={actionLoading}>
                    Back
                  </button>
                  <button type="submit" className={styles.primaryButton} disabled={actionLoading}>
                    {actionLoading ? 'Processing...' : 'Consume stock'}
                  </button>
                </div>
              </form>
            )}

            {/* Send to Client form */}
            {stockOptionMode === 'send' && (
              <form onSubmit={handleSaveSend} className={styles.modalForm}>
                <p className={styles.migrateHint}>Send stock to client (available: {selectedStock.quantity} units)</p>

                <div className={styles.formRow}>
                  <label className={styles.formLabel}>Client</label>
                  <select
                    name="clientId"
                    className={styles.formInput}
                    value={sendForm.clientId}
                    onChange={handleSendChange}
                    required
                    disabled={actionLoading}
                  >
                    <option value="">Select client...</option>
                    {clients.map((c) => (
                      <option key={c.client_id} value={c.client_id}>{c.client_name}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formRow}>
                  <label className={styles.formLabel}>Quantity to send</label>
                  <input
                    type="number"
                    name="quantity"
                    className={styles.formInput}
                    value={sendForm.quantity}
                    onChange={handleSendChange}
                    min="1"
                    max={selectedStock.quantity}
                    required
                    disabled={actionLoading}
                  />
                </div>

                <div className={styles.formRow}>
                  <label className={styles.formLabel}>Note (optional)</label>
                  <input
                    type="text"
                    name="note"
                    className={styles.formInput}
                    value={sendForm.note}
                    onChange={handleSendChange}
                    placeholder="Order reference, delivery note..."
                    disabled={actionLoading}
                  />
                </div>

                <div className={styles.modalActions}>
                  <button type="button" className={styles.secondaryButton} onClick={() => setStockOptionMode(null)} disabled={actionLoading}>
                    Back
                  </button>
                  <button type="submit" className={styles.primaryButton} disabled={actionLoading || !sendForm.clientId}>
                    {actionLoading ? 'Sending...' : 'Send to client'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RackDetailPage;
