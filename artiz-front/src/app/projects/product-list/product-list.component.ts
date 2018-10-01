import { Component, OnInit, Input } from '@angular/core';

import Product from '../../models/product.model';

import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {

  @Input() products: Product[];
  @Input() edit: boolean;

  title = 'Produits';

  constructor(
    private projectService: ProjectService
  ) { }

  ngOnInit() {
  }

  onDelete(i: number) {
    this.projectService.productDelete(this.products[i].id);
  }

}
