// frontend/src/pages/support/SupportPage.jsx
import React, { useState, useRef , useMemo } from "react";
import {
  FaSearch,
  FaQuestionCircle,
  FaBook,
  FaWarehouse,
  FaCubes,
  FaExchangeAlt,
  FaUsers,
  FaChartLine,
  FaClock,
  FaBell,
  FaMapMarkerAlt,
  FaProjectDiagram,
  FaLayerGroup,
  FaBorderAll,
  FaHeadset,
  FaFileDownload,
  FaBoxes,
  FaEnvelope,
} from "react-icons/fa";
import styles from './support.module.css';
import Header from '../../components/UI/Header/Header';

const DOC_ENTRIES = [
  {
    id: "getting-started",
    title: "Getting started",
    icon: "🚀",
    short:
      "Open STORIUM, access the main menu, and enter the inventory workspace.",
    content: `
 Accessing STORIUM

1. Open your browser and go to the STORIUM URL, or launch the desktop app if installed.
2. After the application loads, you see the main menu with "Enter", "Support", and "Exit".
3. Click "Enter" to open the main website and access all navigation pages (Schema, Locations, Sources, Products, Transactions, Clients, and more).

Use "Support" to open this help center, and "Exit" to close your session.
    `,
    tips: [
      "Bookmark the STORIUM URL in your browser for faster access.",
      "If the app does not load, verify your internet connection and try again.",
    ],
  },
  {
    id: "inventory-overview",
    title: "Inventory overview (Schema)",
    icon: <FaProjectDiagram />,
    short: "See a high‑level snapshot of locations, depots, aisles, racks, and slots.",
    content: `
Schema overview

After you click "Enter", STORIUM opens on the "Schema" page.

This page shows the main inventory structure:

- Locations
- Depots
- Aisles
- Racks
- Slots
- Active stocks
- Products

Use the "Manage Locations" action to dive into detailed structural management.
    `,
    tips: [
      "Use the Schema view before making changes to understand how your warehouse is organized.",
      "Look at the counters to quickly detect missing structure or low‑stock areas.",
    ],
  },
  {
    id: "locations",
    title: "Locations",
    icon: <FaMapMarkerAlt />,
    short: "Create and manage top‑level warehouses or branches.",
    content: `
Purpose

Locations represent top‑level storage sites (for example, main warehouse, branch, or cold room).

Locations page
The table shows:

- Location name
- Address
- Coordinates
- Created time
- Actions

From the actions menu you can:

- "Manage Depots" for that location
- "Edit" location details
- "Remove" or deactivate the location (when allowed)

Creating a location

1. Open "Locations" from the navigation.
2. Click "+ Add".
3. Fill in "Name", "Address", and "Coordinates".
4. Save to create the new location.
    `,
    tips: [
      "Use clear, unique names for locations so users can instantly identify where stock is stored.",
      "Prefer deactivating locations over deleting them to preserve history.",
    ],
  },
  {
    id: "depots",
    title: "Depots",
    icon: <FaWarehouse />,
    short: "Sub‑areas inside a location, such as halls or zones.",
    content: `
Purpose

Depots are subdivisions inside a "Location" (halls, zones, or areas) that make large sites easier to manage.

Depots table
Per selected location, the table lists:

- Depot name
- Created time
- Actions

Actions include:

- "View Aisles" in the depot
- "Edit" depot details
- "Remove" or deactivate the depot

Adding a depot

1. Open "Locations", then click "Manage Depots" on a location.
2. In "Depots", click "+ Add".
3. Enter the depot name.
4. Click "Create Depot" to save.
    `,
    tips: [
      "Create depots that match how your team refers to physical areas (e.g., “Zone A”, “Cold Room”).",
      "Avoid generic names like “Depot 1” if you have many; be descriptive.",
    ],
  },
  {
    id: "aisles",
    title: "Aisles",
    icon: <FaProjectDiagram />,
    short: "Corridors inside a depot that group racks.",
    content: `
Purpose

Aisles are linear segments within a depot and act as an intermediate level before racks and slots.

Aisles table
For each depot you see:

- Name
- Created time
- Actions

Actions:

- "View Racks" in the aisle
- "Edit" aisle attributes
- "Remove" the aisle

Adding an aisle

1. Open "Depots", choose a depot and click "View Aisles".
2. In "Aisles", click "+ Add".
3. Enter the aisle name and save.
    `,
    tips: [
      "Use clear aisle codes (e.g., A1, A2) to make physical navigation easy.",
      "Keep racks always attached to an aisle, not directly to a depot.",
    ],
  },
  {
    id: "racks",
    title: "Racks",
    icon: <FaLayerGroup />,
    short: "Vertical structures that contain slots for stock.",
    content: `
Purpose

Racks are vertical storage structures inside an aisle, composed of levels, bays, and bins.

Racks management
In the "Racks" view you can:

- See all racks for the selected aisle
- "+ Add" a new rack
- "Edit" rack properties
- "Remove" a rack when allowed

Adding a rack

1. Go to "Aisles", choose an aisle and open "Racks".
2. Click "+ Add".
3. Provide rack face, number of "Levels", "Bays", and "Bins per bay".
4. Save the form.
    `,
    tips: [
      "Define levels and bays according to the real rack labels in your warehouse.",
      "Plan rack layout once and reuse conventions across locations.",
    ],
  },
  {
    id: "slots-stock",
    title: "Slots & stock placement",
    icon: <FaBorderAll />,
    short: "Manage individual slots and create stock in precise positions.",
    content: `
Rack overview

Inside a rack you see:

- Rack code, layout, levels, bays, bins, and face type
- Context information (Location, Depot, Aisle) for full traceability

Slots by level

Slots are grouped per level. Each level shows:

- Bays and bins (e.g., "Bay 1, Bin 1")
- All existing stock currently in each slot

Adding stock to a slot

1. Open the desired rack and find the target level/bay/bin.
2. Click "Add Stock" on the chosen slot.
3. Fill the stock form:

   - "Product" and "Quantity"
   - "Stock strategy": FIFO, LIFO, or JIT
   - "Product type": Raw, WIP, To ship, Dead stock, Discrepancy
   - Optional: Batch, Sale price, Expiry date, Cost price, Consumable flag

4. Click "Create Stock" to save the placement.
    `,
    tips: [
      "Double‑check the rack, level, bay, and bin before you create stock.",
      "Use product type and batch fields consistently to improve traceability.",
    ],
  },
  {
    id: "sources",
    title: "Sources (suppliers)",
    icon: <FaBoxes />,
    short: "Manage suppliers and other stock providers.",
    content: `
Purpose

Sources store information about suppliers or any entity that provides goods.

Sources table

You can:

- View all sources with key contact details
- Click "+ Add" to create a new source
- Export the table
- Filter between current view and all sources
- Search by name, code, or other attributes

Actions per source:

- "Edit" supplier information
- "Remove" or deactivate a source
- Toggle an "active" flag when available
    `,
    tips: [
      "Keep supplier phone and email up to date for quick communication.",
      "Prefer deactivation instead of deletion so past purchases remain traceable.",
    ],
  },
  {
    id: "products",
    title: "Products",
    icon: <FaCubes />,
    short: "Define all items that can be stored and moved.",
    content: `
Purpose

Products represent every item stored in STORIUM. Accurate product data ensures correct stock tracking and reporting.

Products table
The Products page allows you to:

- "+ Add" new products
- "Export" the product list
- Filter between current view and all products
- Search by name, code, or other properties

Actions per product:

- "Edit" attributes
- "Remove" or deactivate the product

Adding a product

1. Open "Products" and click "+ Add".
2. Provide name, category, unit of measure, default pricing, supplier, and optional description/image URL.
3. Save the record.
    `,
    tips: [
      "Use unique SKUs to avoid confusion between similar products.",
      "Include an image URL for visually similar products to reduce picking errors.",
    ],
  },
  {
    id: "transactions",
    title: "Transactions",
    icon: <FaExchangeAlt />,
    short: "View and filter all inflows, outflows, and automated movements.",
    content: `
Purpose

The Transactions section logs all inventory movements so stock remains auditable.

Transaction history
The table shows, for each transaction:

- Date
- Type
- Notes
- Actions

You can filter by:

- "Type": Automated, Manual, or Mixed
- "Date range": Today, This week, This month, All

Actions:

- "View details" for full information
- "Export" the list for reporting
    `,
    tips: [
      "Use filters to focus on a specific date range or type when investigating issues.",
      "Before creating a corrective transaction, check recent history to understand what happened.",
    ],
  },
  {
    id: "clients",
    title: "Clients",
    icon: <FaUsers />,
    short: "Manage customers or internal clients linked to outflows.",
    content: `
Purpose

Clients store customer or internal department details that are linked to outgoing stock.

Clients table
You can:

- Add new clients with "+ Add"
- Export the client list
- Filter between current and all clients
- Search by client name or other fields

Actions per client:

- "Edit" contact details
- "Remove" or deactivate the client

Adding a client

1. Open "Clients" and click "+ Add".
2. Enter name, contact details, and address.
3. Save to create the client.
    `,
    tips: [
      "Keep addresses accurate so shipping labels are correct.",
      "Deactivate inactive clients instead of deleting to keep history valid.",
    ],
  },
  {
    id: "visualizations",
    title: "Visualizations",
    icon: <FaChartLine />,
    short: "Analyze stock levels, movements, and value with charts.",
    content: `
Purpose

Visualizations turn raw inventory data into charts and indicators for quick analysis.

Filters
You can filter by:

- "Metric": Stock level, Movement, Stock value
- "Date range": Last 7, 30, 90 days, or Last year
- "Product": All products or specific ones
- "Location": All or selected locations
- "Stock type": All or specific stock types

Click "Apply" to refresh the graphs.

Charts and indicators

Dynamic curve charts show how metrics evolve over time.

Summary cards highlight:

- Total stock value
- Movement today
- Items below minimum stock
- Warehouse occupancy
    `,
    tips: [
      "Compare different time ranges to distinguish short‑term spikes from long‑term trends.",
      "Combine product and location filters to analyze specific areas of your business.",
    ],
  },
  {
    id: "routines",
    title: "Routines",
    icon: <FaClock />,
    short: "Automate recurring checks and actions for critical inventory events.",
    content: `
Routines

Routines automate recurring checks, such as daily low‑stock control.

To create a routine:

1. Go to "Routines" and click "New Routine".
2. Set a name and "Frequency" (Daily, Weekly, On event).
3. Configure the "Trigger", time, and condition (for example, stock below minimum).
4. Choose an "Action" (Create alert, Log transaction, Send email) and fill the details.
5. Save. The routine appears in the table with frequency and last‑run status.

Automation Benefits.

Routines help you:
- Automate repetitive inventory checks
- Reduce manual errors
- Ensure consistent monitoring
- Trigger actions automatically based on conditions
    `,
    tips: [
      "Start with a simple daily low‑stock routine before adding more complex automations.",
      "Test routines with simple triggers first, then expand to more complex conditions.",
      "Monitor routine execution logs to ensure they're working as expected.",
    ],
  },
  {
    id: "alerts",
    title: "Alerts",
    icon: <FaBell />,
    short: "Monitor and manage notifications for critical stock conditions.",
    content: `
Alerts:

Alerts collect notifications about inventory conditions such as:

- Low stock
- Overstock
- Expiry
- Reorder reminders

Managing Alerts:

You can filter alerts by:

- "Type": Stock level, Expiry, Reorder, etc.
- "Severity": Critical, Warning, Info
- "Status": Unread or All

Alert Actions

Once you review an alert, you can:

- "Mark as read" once handled
- "Delete" alerts that are no longer needed
- "View details" to understand the underlying issue
- "Take corrective action" like creating a transaction

Alert Best Practices: 

Review alerts regularly to catch critical issues early and maintain inventory accuracy.
    `,
    tips: [
      "Set up alert notifications to stay informed of critical stock events.",
      "Review and clean up old alerts regularly to keep the list focused.",
      "Use alert severity levels to prioritize which issues need immediate attention.",
    ],
  },
];

const FAQ_ITEMS = [
  {
    category: "Structure & locations",
    items: [
      {
        q: "How do I add a new warehouse or branch?",
        a: "Create a new Location, then add Depots, Aisles, Racks, and Slots under it before placing stock.",
      },
      {
        q: "Can I rename a location without losing data?",
        a: "Yes. Editing a location only changes its label; all linked depots, racks, and stock remain intact.",
      },
    ],
  },
  {
    category: "Stock & transactions",
    items: [
      {
        q: "How do I correct a wrong stock placement?",
        a: "Create a transaction to move or adjust the stock (for example, transfer or manual inflow/outflow) and update the slot using Add Stock.",
      },
      {
        q: "Why is my transaction not visible?",
        a: "Check date and type filters, then refresh the page. If it still does not appear, verify that the transaction was saved without errors.",
      },
    ],
  },
  {
    category: "Automation & alerts",
    items: [
      {
        q: "Do routines run automatically?",
        a: "Yes. Once saved and active, routines execute according to their frequency and trigger conditions.",
      },
      {
        q: "What should I do with old alerts?",
        a: "Mark them as read or delete them after the issue is resolved to keep the list focused on current events.",
      },
    ],
  },
];

const SupportPage = () => {
  const [search, setSearch] = useState("");
  const [activeDoc, setActiveDoc] = useState(null); // DocEntry | null
  const [activeTab, setActiveTab] = useState('docs');
  const [openFaqId, setOpenFaqId] = useState(null);
  const docsRef = React.useRef(null);
  const contactRef = React.useRef(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const faqRef = useRef(null);
  const filteredDocs = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return DOC_ENTRIES;
    return DOC_ENTRIES.filter(
      (doc) =>
        doc.title.toLowerCase().includes(term) ||
        doc.short.toLowerCase().includes(term) ||
        (doc.content && doc.content.toLowerCase().includes(term))
    );
  }, [search]);

  const handleOpenDoc = (doc) => {
    setActiveDoc(doc);
  };

  const handleCloseDoc = () => {
    setActiveDoc(null);
  };

  const handleScrollToDocs = () => {
    docsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScrollToContact = () => {
    contactRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === 'docs' && docsRef.current) {
      setTimeout(() => {
        docsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
    if (tab === 'faq' && faqRef.current) {
      setTimeout(() => {
        faqRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
    if (tab === 'contact' && contactRef.current) {
      setTimeout(() => {
        contactRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.mainContent}>
        <div className={styles.content}>
            <div className={styles.supportContent}>
          {/* Header */}
          <Header
            title="SUPPORT CENTER"
            subtitle="Get help and learn how to use Storium effectively"
            size="large"
            align="center"
          />
          </div>

          {/* Search */}
          <div className={styles.searchWrapper}>
            <div className={styles.searchContainer}>
              <FaSearch className={styles.searchIcon} />
              <input
                className={styles.searchInput}
                type="text"
                placeholder="Search documentation (e.g. locations, stock, alerts)…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

           {/* Tabs */}
          <div className={styles.tabsWrapper}>
            <button
              className={`${styles.tab} ${activeTab === 'docs' ? styles.tabActive : ''}`}
              onClick={() => handleTabClick('docs')}
              title="Browse documentation topics"
            >
              <FaBook style={{ marginRight: '8px' }} />
              Documentation
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'faq' ? styles.tabActive : ''}`}
              onClick={() => handleTabClick('faq')}
              title="Frequently asked questions"
            >
              <FaQuestionCircle style={{ marginRight: '8px' }} />
              FAQ
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'contact' ? styles.tabActive : ''}`}
              onClick={() => handleTabClick('contact')}
              title="Get in touch with us"
            >
              <FaEnvelope style={{ marginRight: '8px' }} />
              Contact
            </button>
          </div>

          
          {/* Documentation section */}
          <div ref={docsRef}>
            <>
              <section className={styles.docsSection}>
                {filteredDocs.length === 0 ? (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyStateIcon}>🧐</div>
                    <p>No documentation matched your search.</p>
                    <p className={styles.emptyStateSubtext}>
                      Try another keyword or clear the search field.
                    </p>
                  </div>
                ) : (
                  filteredDocs.map((doc) => (
                    <button
                      key={doc.id}
                      type="button"
                      className={styles.docBox}
                      onClick={() => handleOpenDoc(doc)}
                    >
                      <div className={styles.docBoxIcon}>
                        {React.isValidElement(doc.icon) ? doc.icon : doc.icon}
                      </div>
                      <p className={styles.docBoxTitle}>{doc.title}</p>
                      <span className={styles.docBoxArrow}>↗</span>
                    </button>
                  ))
                )}
              </section>
            </>
          </div>

          {/* FAQ Section */}
          <div ref={faqRef}>
            <>
              {/* FAQ */}
              <section className={styles.faqSection}>
                <div className={styles.faqHeader}>
                  <FaQuestionCircle className={styles.faqHeaderIcon} />
                  <h2 className={styles.faqTitle}>Frequently asked questions</h2>
                </div>
                <div className={styles.faqContent}>
                  {FAQ_ITEMS.map((cat) => (
                    <div key={cat.category} className={styles.faqCategory}>
                      <h3 className={styles.faqCategoryTitle}>
                        {cat.category}
                      </h3>
                      <div className={styles.faqItems}>
                        {cat.items.map((item, idx) => {
                          const id = `${cat.category}-${idx}`;
                          const isOpen = openFaqId === id;
                          return (
                            <div
                              key={id}
                              className={`${styles.faqItem} ${
                                isOpen ? styles.faqItemActive : ""
                              }`}
                              onClick={() =>
                                setOpenFaqId(isOpen ? null : id)
                              }
                            >
                              <div className={styles.faqItemHeader}>
                                <p className={styles.faqItemQuestion}>
                                  {item.q}
                                </p>
                                <div
                                  className={`${styles.faqItemToggle} ${
                                    isOpen ? styles.faqItemToggleOpen : ""
                                  }`}
                                >
                                  ▼
                                </div>
                              </div>
                              {isOpen && (
                                <div className={styles.faqItemBody}>
                                  <p className={styles.faqItemAnswer}>
                                    {item.a}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          </div>

          {/* Contact Section - At Bottom */}
          <div className={styles.contactSection} ref={contactRef}>
            {/* <div className={styles.contactHeader}>
              <FaHeadset className={styles.contactHeaderIcon} />
              <h2 className={styles.contactTitle}>Get in Touch</h2>
            </div> */}

            <div className={styles.contactFooter}>
              <div className={styles.contactFooterItem}>
                <FaFileDownload className={styles.contactFooterIcon} />
                <div className={styles.contactFooterText}>
                  <p className={styles.contactFooterLabel}>User Manual</p>
                  <a href="/client_documentation_storium.pdf" download="Storium_User_Manual.pdf">Download PDF</a>
                </div>
              </div>

              <div className={styles.contactFooterItem}>
                <FaHeadset className={styles.contactFooterIcon} />
                <div className={styles.contactFooterText}>
                  <p className={styles.contactFooterLabel}>Support</p>
                  <a href="mailto:support@storium.com">support@storium.com</a>
                </div>
              </div>

              <div className={styles.contactFooterItem}>
                <FaUsers className={styles.contactFooterIcon} />
                <div className={styles.contactFooterText}>
                  <p className={styles.contactFooterLabel}>Meet the Team</p>
                  <a href="https://mustafaots.github.io/G5-team4-portfolio-project/">View our portfolio</a>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className={styles.footer}>
            <p>STORIUM Inventory Management System — Support center</p>
          </footer>
        </div>
      </main>

      {/* Modal for documentation entry */}
      {activeDoc && (
        <div className={styles.modalOverlay} onClick={handleCloseDoc}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.modalClose}
              type="button"
              onClick={handleCloseDoc}
              aria-label="Close"
            >
              ✕
            </button>
            <div className={styles.modalHeader}>
              <div className={styles.modalIcon}>
                {React.isValidElement(activeDoc.icon)
                  ? activeDoc.icon
                  : activeDoc.icon}
              </div>
              <h2 className={styles.modalTitle}>{activeDoc.title}</h2>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalDescription}>
                {/* Markdown-style rendering: headings, lists, paragraphs */}
                {(() => {
                  const lines = activeDoc.content.trim().split("\n");
                  const result = [];
                  let currentOL = [];
                  let currentUL = [];
                  let nestedUL = [];
                  let lastOLItemText = null;
                  
                  const flushNestedUL = () => {
                    if (nestedUL.length > 0 && currentOL.length > 0) {
                      // Pop the last item from currentOL
                      const lastItem = currentOL.pop();
                      // Recreate it with nested list
                      currentOL.push(
                        <li key={`ol-${currentOL.length}`} className={styles.modalOrderedItem}>
                          {lastOLItemText}
                          <ul style={{ marginLeft: '24px', listStyle: 'disc', marginTop: '8px' }}>
                            {nestedUL}
                          </ul>
                        </li>
                      );
                      nestedUL = [];
                      lastOLItemText = null;
                    }
                  };
                  
                  const flushOL = () => {
                    flushNestedUL();
                    if (currentOL.length > 0) {
                      result.push(
                        <ol key={`ol-${result.length}`} style={{ counterReset: 'none', marginLeft: '24px' }}>
                          {currentOL}
                        </ol>
                      );
                      currentOL = [];
                      lastOLItemText = null;
                    }
                  };
                  
                  const flushUL = () => {
                    if (currentUL.length > 0) {
                      result.push(
                        <ul key={`ul-${result.length}`} style={{ marginLeft: '24px', listStyle: 'disc' }}>
                          {currentUL}
                        </ul>
                      );
                      currentUL = [];
                    }
                  };
                  
                  lines.forEach((line, idx) => {
                    // Check if line is indented (nested list item)
                    const isIndented = /^\s+/.test(line);
                    const trimmedLine = line.trim();
                    
                    if (trimmedLine.startsWith("### ")) {
                      flushNestedUL();
                      flushOL();
                      flushUL();
                      result.push(
                        <h3 key={`h3-${idx}`} className={styles.modalContentH3}>
                          {trimmedLine.replace("### ", "")}
                        </h3>
                      );
                    } else if (trimmedLine.startsWith("## ")) {
                      flushNestedUL();
                      flushOL();
                      flushUL();
                      result.push(
                        <h2 key={`h2-${idx}`} className={styles.modalContentH2}>
                          {trimmedLine.replace("## ", "")}
                        </h2>
                      );
                    } else if (isIndented && trimmedLine.startsWith("- ")) {
                      // Nested bullet point - add to nested list
                      nestedUL.push(
                        <li key={`nested-li-${idx}`} className={styles.modalBulletItem}>
                          {trimmedLine.replace("- ", "")}
                        </li>
                      );
                    } else if (trimmedLine.startsWith("- ")) {
                      flushNestedUL();
                      flushOL();
                      currentUL.push(
                        <li key={`li-${idx}`} className={styles.modalBulletItem}>
                          {trimmedLine.replace("- ", "")}
                        </li>
                      );
                    } else if (/^\d+\.\s+/.test(trimmedLine)) {
                      // New numbered item - flush any nested items first
                      flushNestedUL();
                      flushUL();
                      const match = trimmedLine.match(/^\d+\.\s+(.*)/);
                      lastOLItemText = match ? match[1] : trimmedLine;
                      currentOL.push(
                        <li key={`ol-${idx}`} className={styles.modalOrderedItem}>
                          {lastOLItemText}
                        </li>
                      );
                    } else if (trimmedLine === "") {
                      // Empty line - only flush if NOT waiting for nested items
                      // (if we have currentOL but no nested items yet, keep waiting)
                      if (currentOL.length === 0) {
                        flushNestedUL();
                        flushOL();
                        flushUL();
                        result.push(<div key={`space-${idx}`} className={styles.modalSpacing} />);
                      }
                      // Otherwise skip empty lines within lists
                    } else {
                      // Regular paragraph - flush everything
                      flushNestedUL();
                      flushOL();
                      flushUL();
                      result.push(
                        <p key={`p-${idx}`} className={styles.modalParagraph}>
                          {trimmedLine}
                        </p>
                      );
                    }
                  });
                  
                  flushNestedUL();
                  flushOL();
                  flushUL();
                  
                  return result;
                })()}
              </div>

              {activeDoc.tips && activeDoc.tips.length > 0 && (
                <div className={styles.modalTips}>
                  <h4>Tips</h4>
                  <ul>
                    {activeDoc.tips.map((tip) => (
                      <li key={tip}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.modalButton}
                onClick={handleCloseDoc}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportPage;
