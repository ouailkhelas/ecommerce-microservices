const { createHttpClient } = require('../utils/httpClient');
const config = require('../config/resilience.config');

// Créer le client HTTP avec retry et timeout
const httpClient = createHttpClient('inventoryService');
const BASE_URL = config.services.inventoryService;

/**
 * Vérifier la disponibilité d'un produit
 * @param {number} productId - ID du produit
 * @param {number} quantity - Quantité demandée
 * @returns {Promise<Object>}
 */
async function checkAvailability(productId, quantity) {
  try {
    console.log(`[Inventory Client] Checking availability for product ${productId} (qty: ${quantity})`);
    
    const response = await httpClient.get(`${BASE_URL}/products/${productId}`);
    const product = response.data.data || response.data;

    const available = product.stock >= quantity;
    
    console.log(`[Inventory Client] Product ${productId}: ${product.stock} in stock (${available ? 'Available' : 'Not available'})`);

    return {
      productId,
      available,
      stock: product.stock,
      requestedQuantity: quantity
    };
    
  } catch (error) {
    console.error(`[Inventory Client] ❌ Failed to check availability for product ${productId}:`, error.message);
    throw error;
  }
}

/**
 * Réserver du stock pour une commande
 * @param {Array} items - Liste d'items [{productId, quantity}]
 * @returns {Promise<Object>}
 */
async function reserveStock(items) {
  try {
    console.log(`[Inventory Client] Reserving stock for ${items.length} items`);
    
    const reservations = [];
    
    for (const item of items) {
      const availability = await checkAvailability(item.productId, item.quantity);
      
      if (!availability.available) {
        throw new Error(`Product ${item.productId} not available (stock: ${availability.stock}, requested: ${item.quantity})`);
      }

      // Simuler la réservation (PUT pour décrémenter le stock)
      const response = await httpClient.put(`${BASE_URL}/products/${item.productId}`, {
        stock: availability.stock - item.quantity
      });

      reservations.push({
        productId: item.productId,
        quantityReserved: item.quantity,
        newStock: availability.stock - item.quantity
      });

      console.log(`[Inventory Client] ✅ Reserved ${item.quantity} units of product ${item.productId}`);
    }

    return {
      success: true,
      reservations
    };
    
  } catch (error) {
    console.error('[Inventory Client] ❌ Failed to reserve stock:', error.message);
    throw error;
  }
}

/**
 * Libérer du stock (rollback)
 * @param {Array} reservations - Liste des réservations à annuler
 * @returns {Promise<void>}
 */
async function releaseStock(reservations) {
  try {
    console.log(`[Inventory Client] Releasing stock for ${reservations.length} reservations`);
    
    for (const reservation of reservations) {
      await httpClient.put(`${BASE_URL}/products/${reservation.productId}`, {
        stock: reservation.newStock + reservation.quantityReserved
      });

      console.log(`[Inventory Client] ✅ Released ${reservation.quantityReserved} units of product ${reservation.productId}`);
    }
    
  } catch (error) {
    console.error('[Inventory Client] ❌ Failed to release stock:', error.message);
    // Ne pas throw ici, juste logger
  }
}

module.exports = {
  checkAvailability,
  reserveStock,
  releaseStock
};