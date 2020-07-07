const path = require('path');
const InventoryReader = require('./inventory-reader');


module.exports = class ReadInventoryIpcEmitter {
    constructor() {
        this.inventoryReader = new InventoryReader(
            path.join(__dirname, 'read-inventory/bin/Release/read-inventory.exe')
        );
        this.inventoryReader.on('exit', () => {
            console.error('InventoryReader Process Exited, trying to restart in 5 secs');
            setTimeout(this.init.bind(this), 5000);
        })
    }
    init() {
        this.inventoryReader.attachProcess();
    }
    startEmittingTo(webContents) {
        this.inventoryReader.on('error', error => {
            console.error("InventoryReader error:", error);
            webContents.send('inventory-reader-error', error);
        });
        this.inventoryReader.onInventorySnapshot(inventory => {
            webContents.send('inventory-reader-snapshot', inventory);
        });
    }
}
