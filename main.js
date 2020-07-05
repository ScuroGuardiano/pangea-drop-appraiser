const path = require('path');
const InventoryReader = require('./inventory-reader');

const inventoryReader = new InventoryReader(
    path.join(__dirname, 'read-inventory/bin/Release/read-inventory.exe')
);

inventoryReader.attachProcess();
inventoryReader.on('error', error => {
    if(error)
        console.error(error);
});
inventoryReader.onInventorySnapshot(inventory => {
    console.log(inventory[0]);
});
