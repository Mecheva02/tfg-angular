import { Component } from '@angular/core';

@Component({
  selector: 'app-error',
  standalone:true,
  imports: [],
  templateUrl: './error.html',
  styleUrl: './error.scss'
})
export class ErrorComponent {
  public page_title: string;
  constructor() {
    this.page_title = 'Error';
  }
}