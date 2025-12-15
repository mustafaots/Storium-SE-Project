// receive into a slot
export function makeManualInflowPayload({ stockId, productId, slotId, sourceId, quantity, unitPrice, note }) {
  return {
    stockId,
    productId,
    toSlotId: slotId,
    sourceId,
    quantity,
    unitPrice,
    note
  };
}

// issue from a slot to a client 

export function makeManualOutflowPayload({ stockId, productId, slotId, clientId, quantity, unitPrice, note }) {
  return {
    stockId,
    productId,
    fromSlotId: slotId,
    clientId,
    quantity,
    unitPrice,
    note
  };
}

//  transfer between two slots
export function makeTransferPayload({
  productId,
  fromStockId,
  toStockId,
  fromSlotId,
  toSlotId,
  quantity,
  note
}) {
  return {
    productId,
    fromStockId,
    toStockId,
    fromSlotId,
    toSlotId,
    quantity,
    note
  };
}

// adjustment in a slot
export function makeAdjustmentPayload({
  stockId,
  productId,
  slotId,
  quantityDelta,
  unitPrice,
  note,
  isAutomated,
  routineId
}) {
  return {
    stockId,
    productId,
    slotId,
    quantityDelta,
    unitPrice,
    note,
    isAutomated,
    routineId
  };
}

// automated inflow
export function makeAutomatedInflowArgs({
  stockId,
  productId,
  slotId,
  sourceId,
  routineId,
  quantity,
  unitPrice,
  note
}) {
  return {
    stockId,
    productId,
    toSlotId: slotId,
    sourceId,
    routineId,
    quantity,
    unitPrice,
    note
  };
}

// automated outflow
export function makeAutomatedOutflowArgs({
  stockId,
  productId,
  slotId,
  clientId,
  routineId,
  quantity,
  unitPrice,
  note
}) {
  return {
    stockId,
    productId,
    fromSlotId: slotId,
    clientId,
    routineId,
    quantity,
    unitPrice,
    note
  };
}
