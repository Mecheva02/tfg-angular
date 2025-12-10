import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-post-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './post-create.html',
  styleUrls: ['./post-create.scss']
})
export class PostCreateComponent {

  post: any = {
    title: '',
    content: '',
    category_id: 1,
    image: ''
  };

  selectedFile: File | null = null;
  loading: boolean = false;

  constructor(
    private postService: PostService,
    private router: Router
  ) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onSubmit() {
    if (!this.selectedFile) {
      alert('Debes seleccionar una imagen');
      return;
    }

    this.loading = true;

    // 1. Subir imagen primero
    this.postService.uploadImage(this.selectedFile).subscribe({
      next: (uploadRes: any) => {
        console.log('✅ IMAGEN SUBIDA:', uploadRes);

        this.post.image = uploadRes.image;

        // 2. Crear post con la imagen real
        this.postService.createPost(this.post).subscribe({
          next: (res: any) => {
            console.log('✅ POST CREADO:', res);
            alert('Post creado correctamente');

            this.loading = false;
            this.router.navigate(['/posts']);
          },
          error: (err: any) => {
            console.error('❌ ERROR CREANDO POST:', err);
            alert('Error creando el post');
            this.loading = false;
          }
        });
      },
      error: (err: any) => {
        console.error('❌ ERROR SUBIENDO IMAGEN:', err);
        alert('Error subiendo la imagen');
        this.loading = false;
      }
    });
  }
}
