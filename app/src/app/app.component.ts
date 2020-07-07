import { Component, OnInit } from '@angular/core';
import { InventoryService } from './services/inventory.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'app';

  constructor(private inventoryService: InventoryService) {}

  ngOnInit(): void {
    this.inventoryService.itemsMap.subscribe(items => console.dir(items));
  }
}
