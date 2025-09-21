// الفهرس الرئيسي لجميع الأوامر
const shopCommands = require('./shop');
const adminCommands = require('./admin');
const userCommands = require('./user');
const utilityCommands = require('./utility');

module.exports = {
    // أوامر إدارة المتاجر
    ...shopCommands,
    
    // أوامر الإدارة
    ...adminCommands,
    
    // أوامر المستخدمين
    ...userCommands,
    
    // الأوامر المساعدة
    ...utilityCommands
};