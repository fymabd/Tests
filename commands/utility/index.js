// فهرس الأوامر المساعدة
const { calculateTax } = require('./calculateTax');
const { showShopData } = require('./showShopData');
const { showWarns } = require('./showWarns');
const { sendBuyTicket } = require('./sendBuyTicket');

module.exports = {
    calculateTax,
    showShopData,
    showWarns,
    sendBuyTicket,
    sendPanels: require('./sendPanels'),
    sendShops: require('./sendShops'),
    sendOrders: require('./sendOrders'),
    sendActions: require('./sendActions'),
    pricePanel: require('./pricePanel')
};