// Message codes from backend - keep in sync with public_orders/message_codes.py
export const MESSAGE_CODES = {
  // Sale status messages
  SALE_CLOSED: 'sale_closed',
  SALE_IN_PROGRESS: 'delivery_in_progress',
  SALE_COMPLETED: 'sale_completed',

  // Order update responses
  ORDER_UPDATED: 'order_updated',
  ORDER_CLEARED: 'order_cleared',

  // Error codes
  ERROR_INVALID_TOKEN: 'invalid_token',
  ERROR_SALE_NOT_FOUND: 'sale_not_found',
  ERROR_SALE_CLOSED_NO_MODIFY: 'sale_closed_no_modify',
  ERROR_PRODUCT_NOT_FOUND: 'product_not_found',
}

// Spanish translations for message codes
const translations = {
  // Sale status messages
  [MESSAGE_CODES.SALE_CLOSED]: 'Esta venta está cerrada. No puedes hacer cambios.',
  [MESSAGE_CODES.SALE_IN_PROGRESS]: '¡Reparto en curso!',
  [MESSAGE_CODES.SALE_COMPLETED]: 'Esta venta ha sido completada.',

  // Order update responses
  [MESSAGE_CODES.ORDER_UPDATED]: '¡Pedido actualizado correctamente!',
  [MESSAGE_CODES.ORDER_CLEARED]: '¡Pedido vaciado!',

  // Error codes
  [MESSAGE_CODES.ERROR_INVALID_TOKEN]: 'Enlace de acceso inválido.',
  [MESSAGE_CODES.ERROR_SALE_NOT_FOUND]: 'Venta no encontrada.',
  [MESSAGE_CODES.ERROR_SALE_CLOSED_NO_MODIFY]: 'Esta venta está cerrada y no se puede modificar.',
  [MESSAGE_CODES.ERROR_PRODUCT_NOT_FOUND]: 'Producto no encontrado.',

  // Notification messages
  delivery_started: '¡El reparto ha comenzado!',
  track_your_order: 'Seguir tu pedido',
  new_sale_available: '¡Nueva venta disponible!',
  order_now: 'Pedir ahora',
}

/**
 * Translates a message code to Spanish.
 * Returns the original text if no translation is found.
 */
export function t(code) {
  return translations[code] ?? code
}
