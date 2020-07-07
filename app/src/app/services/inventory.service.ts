import { Injectable } from '@angular/core';
import { IpcService } from './ipc.service';
import { fromEvent, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import IItem from './interfaces/item';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  public itemsMap: Observable<Map<number, number>>;

  constructor(ipc: IpcService) {
    const source = fromEvent(ipc, 'inventory-reader-snapshot');
    this.itemsMap = source.pipe(
      // inventory[1] because source event callback has 2 arguments
      // (event, data), but rxjs is placing it in array, where [0] is event
      // and [1] is data
      map(inventory => this.convertInventoryToItemMap(inventory[1] as IItem[]))
    );
  }

  private convertInventoryToItemMap(inventory: IItem[]): Map<number, number> {
    const items = new Map<number, number>();
    inventory.forEach(item => {
      if (items.has(item.id)) {
        const oldItemCount = items.get(item.id);
        items.set(item.id, oldItemCount + item.quantity);
      }
      else {
        items.set(item.id, item.quantity);
      }
    });

    return items;
  }
}
