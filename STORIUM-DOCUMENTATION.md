# STORIUM Documentation

Storium is an inventory management system built with scalability in mind and shaped around the end user’s workflow.  
Its purpose is to offer a reliable way to track inventory activity, automate routine actions, and provide insight through alerts and analytics.

---

## Overview

Storium is aimed at any group or business that needs a straightforward but powerful way to manage stock.  
This includes tracking items, recording movements, getting notified when supplies drop too low, and generating useful forecasts.

---

## TODO – Features

- Inventory tracking  
- Stock transfers  
- Alerts  
- Forecasting and analytics  
- Automated routines  
- (More features will be added as development continues)

---

## Architecture

Storium is a full-stack web application wrapped in Neutralino.js.  
The stack is split into two parts:

---

## Frontend

The frontend is built in React and communicates with the backend through HTTP requests.

### Dependencies
axios ^1.13.1
react ^19.1.1
react-dom ^19.1.1

---

## Backend

The backend runs on Node.js using Express, with MySQL handling all persistent data.

### Dependencies
cors ^2.8.5
dotenv ^17.2.3
express ^5.1.0
mysql2 ^3.15.3

---

## Database

The system uses a MySQL database for relational data storage.  
This includes products, transactions, locations, threshold rules, and anything else that needs consistent structure.

---

## Notes

All dependency versions can be verified by checking `package.json` or running: `npm list --depth=0`
