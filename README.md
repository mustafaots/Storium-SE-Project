# Software-Engineering-Project
<div align="center">
  <img width="200" height="200" alt="storium-logo" src="https://github.com/user-attachments/assets/320d7a82-813d-4e6e-ad36-0dae18369a58" />
</div>

## Overview
Storium is an inventory management system designed and built to meet industry standards for any entity with a need to effectively organise, track and automate operations on said inventory.

Storium will allow its wielders to track and record their inventory placements from geographic locations down to the microscopic shelf spots. Automate routines and visualise supply chains, tradeoff between understock and overstock, and make the institution run like clockwork with the IMS being the escapement that yields the implicit profits.

## Features
- [ ] Schmea Tab: handling the positioning of the inventories across locations, down to depots, aisles and racks.
- [x] Clients Tab: manage clients for an outflow of goods.
- [ ] Transactions Tab: record the actions occurring on the inventory's premisis.
- [ ] Products Tab: manage identified products which are present in the inventory.
- [ ] Sources Tab: manage the sources from which the inventory receives stocks of products.
- [ ] Routines Tab: manage automated transactions on inventory shelved stocks.
- [ ] Alerts Tab: get notified on any nearby events such as overstock, understock, expiry...
- [ ] Visualise Tab: transform the raw data collected through records into visualisiations that offer insight.
- [ ] Exporting Information: export the inventory files or visualisations into tangible formats (pdf, csv, json, svg...)

## Use Cases

### 1. Manage Inventory Schema
Actors: Inventory Manager  
Description: Define the full hierarchy of the inventory — locations, depots, aisles, racks and shelf positions.  
Goals:
- Add new storage locations  
- Modify existing structures  
- Ensure accurate mapping of physical layout  

---

### 2. Record Inventory Transactions
Actors: Inventory Clerk, Automated Routines  
Description: Log inflow and outflow operations on inventory items.  
Goals:
- Add stock-in transactions  
- Add stock-out transactions  
- Track quantity changes  
- View historical transaction logs  

---

### 3. Manage Clients
Actors: Sales Manager, Inventory Staff  
Description: Maintain a database of clients who receive inventory goods.  
Goals:
- Add client profiles  
- Update client information  
- Associate transactions with clients  

---

### 4. Manage Products
Actors: Inventory Manager  
Description: Handle the list of all identifiable products stored in the inventory.  
Goals:
- Create product entries  
- Edit product attributes  
- Classify products into categories  

---

### 5. Manage Sources (Suppliers)
Actors: Procurement Officer  
Description: Track origins of stock and maintain supplier information.  
Goals:
- Add new suppliers  
- Update supplier data  
- Link suppliers to product entries  

---

### 6. Automated Routines
Actors: System, Admin  
Description: Allow automated scheduled operations on inventory (e.g., planned restocking).  
Goals:
- Create automation rules  
- Define conditions (thresholds, dates, quantities)  
- Execute automated transactions  

---

### 7. Alerts & Notifications
Actors: All System Users  
Description: Notify users about important inventory conditions.  
Goals:
- Detect understock  
- Detect overstock  
- Alert on expiry  
- Notify of unusual transaction activity  

---

### 8. Visualise Supply Chain & Data
Actors: Manager, Analyst  
Description: Convert raw transaction and stock data into charts and insights.  
Goals:
- View stock trends  
- Display location utilisation  
- Track supply chain performance  

---

### 9. Export Inventory Data
Actors: Any authenticated user  
Description: Generate external files for reporting or storage.  
Goals:
- Export products table  
- Export visualisations (PDF, SVG)  
- Export transaction logs (CSV, JSON)  

---

### 10. Authenticate & Authorize Users
Actors: All users  
Description: Secure the system from unauthorized access.  
Goals:
- Login with email + password  
- Validate permissions for each module  
- Restrict access based on roles  


## Tech Stack
### Frontend
- React Framework
### Backend
- NodeJS Runtime Enivronment
- Express
#### Database
- MySQL

## Project Structure
### Backend
```
backend/
│
├── database/
│
├── node_modules/
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── utils/
│
├── .env
├── .env.example
├── package-lock.json
├── package.json
└── server.js
```
### Frontend
```
frontend/
│
├── node_modules/
│
├── public/
│
├── src/
│   ├── assets/
│   ├── components/
│   ├── config/
│   ├── controllers/
│   ├── handlers/
│   ├── hooks/
│   ├── pages/
│   └── utils/
│
├── App.jsx
├── index.css
├── main.jsx
│
├── .gitignore
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── postcss.config.js
└── vite.config.js
```
## Documentation
### Software Requirements Specifications
``` void ```
### Enduser Documentation
``` void ```
### Dev Documentation
``` void ```
