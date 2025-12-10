import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminCommentService } from '../../services/admin-comment.service';

@Component({
  selector: 'app-admin-comments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-comments.component.html'
})
export class AdminCommentsComponent implements OnInit {

  pendingComments: any[] = [];
  loading = false;

  constructor(private adminService: AdminCommentService) {}

  ngOnInit(): void {
    this.loadPending();
  }

  loadPending() {
    this.loading = true;

    this.adminService.getPending().subscribe({
      next: (res) => {
        this.pendingComments = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando pendientes', err);
        this.loading = false;
      }
    });
  }

approve(id: number) {
  this.adminService.approve(id).subscribe({
    next: () => {
      // ✅ Desaparece al instante sin recargar
      this.pendingComments = this.pendingComments.filter(c => c.id !== id);
    },
    error: (err) => {
      console.error('Error al aprobar', err);
    }
  });
}

reject(id: number) {
  this.adminService.reject(id).subscribe({
    next: () => {
      // ✅ Desaparece al instante sin recargar
      this.pendingComments = this.pendingComments.filter(c => c.id !== id);
    },
    error: (err) => {
      console.error('Error al rechazar', err);
    }
  });
}

}
