const { EventEmitter } = require('events');
const child_process = require('child_process');
const Item = require('./item');

module.exports = class InventoryReader extends EventEmitter {
    constructor(pathToReadInventoryExecutable) {
        super();
        this.readInvExe = pathToReadInventoryExecutable;
        this.buffer = '';
    }
    attachProcess() {
        this.readInvProc = child_process.execFile(this.readInvExe);
        this.readInvProc.on('exit', this.__onExitHandler.bind(this));
        this.readInvProc.stdout.on('data', this.__onDataHandler.bind(this));
        this.readInvProc.stderr.on('data', this.__onErrorHandler.bind(this));
    }
    onInventorySnapshot(func) {
        this.addListener('inventory-snapshot', func);
    }
    removeInventorySnapshotListener(func) {
        this.removeListener('inventory-snapshot', func);
    }
    __readItemsData() {
        const startIndex = this.buffer.indexOf("__ITEM_ARR_BEG__");
        const endIndex = this.buffer.indexOf("__ITEM_ARR_END__") + "__ITEM_ARR_END__".length;

        let itemsData = this.buffer.substring(startIndex, endIndex);
        this.buffer = this.buffer.substring(endIndex);

        itemsData = itemsData.replace("__ITEM_ARR_BEG__", "");
        itemsData = itemsData.replace("__ITEM_ARR_END__", "");
        const parsed = JSON.parse(itemsData);
        return parsed.map(item => new Item(item[0], item[1]));
    }
    __onDataHandler(chunk) {
        let data = chunk.toString();
        this.buffer += data;
        if (data.includes("__ITEM_ARR_END__")) {
            this.emit('inventory-snapshot', this.__readItemsData());
        }
    }
    __onErrorHandler(chunk) {
        let data = chunk.toString();
        this.emit('error', data);
    }
    __onExitHandler(event) {
        this.emit('exit');
        console.error("[INVENTORY READER]: READER PROCESS EXITED");
        this.readInvProc = null;
    }
}
