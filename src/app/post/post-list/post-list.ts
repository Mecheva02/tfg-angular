import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostService } from '../../services/post.service';
import { CommentService, Comment } from '../../services/comment';
import { FormsModule } from '@angular/forms';
import { Input } from '@angular/core';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './post-list.html',
  styleUrls: ['./post-list.scss']
})
export class PostListComponent implements OnInit {

  posts: any[] = [];
  expanded: boolean[] = [];

  // ✅ Comentarios
  comments: { [key: number]: Comment[] } = {};
  showComments: boolean[] = [];
  newComment: { [key: number]: string } = {};

  // ✅ Edición
  editingCommentId: number | null = null;
  editedContent: string = '';

  // ✅ Usuario logueado
  currentUserId: number = 0;
  currentUserRole: string = '';

  // ✅ Contadores
  commentCounts: { [key: number]: number } = {};

  // ✅ Animaciones visuales
  lastAddedCommentId: number | null = null;
  deletingVisualId: number | null = null;

  // ✅ SCROLL INFINITO
  commentPages: { [key: number]: number } = {};
  commentLastPages: { [key: number]: number } = {};
  commentLoading: { [key: number]: boolean } = {};

  // ✅ MENSAJES BOOTSTRAP DE MODERACIÓN
  moderationMessage: { [key: number]: string } = {};
  moderationType: { [key: number]: 'success' | 'warning' } = {};

  // ✅ RESPUESTAS
  replyingTo: number | null = null;
  replyingToUser: string | null = null;
  replyContent: string = '';
  replyToUserId: number | null = null;

  // ✅ VER / OCULTAR RESPUESTAS
  showReplies: { [key: number]: boolean } = {};

  @Input() singlePostId: number | null = null;

  constructor(
    public postService: PostService,
    private commentService: CommentService
  ) {}

  ngOnInit(): void {
    const identity = localStorage.getItem('identity');

    if (identity) {
      const user = JSON.parse(identity);
      this.currentUserId = Number(user.sub);
      this.currentUserRole = user.role;
    }

    this.postService.getPosts().subscribe({
      next: (response: any) => {
        const allPosts = response.posts || [];

        this.posts = this.singlePostId
          ? allPosts.filter((p: any) => p.id === this.singlePostId)
          : allPosts;

        this.expanded = this.posts.map(() => false);
        this.showComments = this.posts.map(() => false);

        this.posts.forEach(post => {
          this.commentService.getCount(post.id).subscribe({
            next: (res) => this.commentCounts[post.id] = res.count,
            error: () => this.commentCounts[post.id] = 0
          });
        });
      }
    });
  }

  toggleContent(index: number) {
    this.expanded[index] = !this.expanded[index];
  }

  toggleComments(index: number, postId: number) {
    this.showComments[index] = !this.showComments[index];

    if (this.showComments[index] && !this.comments[postId]) {
      this.comments[postId] = [];
      this.commentPages[postId] = 1;
      this.commentLastPages[postId] = 1;
      this.loadMoreComments(postId);
    }
  }

  loadMoreComments(postId: number) {
    if (
      this.commentLoading[postId] ||
      (this.commentPages[postId] > this.commentLastPages[postId])
    ) return;

    this.commentLoading[postId] = true;

    this.commentService
      .getByPostPaginated(postId, this.commentPages[postId])
      .subscribe({
        next: (res) => {
          const loaded = res.data.map((c: any) => ({
            ...c,
            replies: c.replies || []
          }));

          this.comments[postId] = [
            ...this.comments[postId],
            ...loaded
          ];

          loaded.forEach((c: Comment) => {
            this.showReplies[c.id] = false;
          });

          this.commentLastPages[postId] = res.last_page;
          this.commentPages[postId]++;
          this.commentLoading[postId] = false;
        },
        error: () => this.commentLoading[postId] = false
      });
  }

  getImage(image: string): string {
    if (!image) {
      return 'assets/images/default-post.png';
    }
    return this.postService.getPostImage(image);
  }

  getUserImage(image: string): string {
    return this.postService.getUserImage(image);
  }

  // ✅ AÑADIR COMENTARIO
  addComment(postId: number) {
    if (!this.newComment[postId]?.trim()) return;

    const data = {
      post_id: postId,
      content: this.newComment[postId]
    };

    this.commentService.create(data).subscribe({
      next: (res) => {

        if (res.status === 'pending') {
          this.moderationMessage[postId] =
            'Tu comentario está siendo revisado por un administrador.';
          this.moderationType[postId] = 'warning';

          this.newComment[postId] = '';
          setTimeout(() => delete this.moderationMessage[postId], 4000);
          return;
        }

        // ✅ ASEGURAR PROPIEDADES
        res.comment.replies = [];

        // ✅ INSERTAR
        this.comments[postId].unshift(res.comment);

        // ✅ ACTIVAR ANIMACIÓN
        this.lastAddedCommentId = res.comment.id;

        // ✅ LIMPIAR DESPUÉS DE QUE TERMINE LA ANIMACIÓN
        setTimeout(() => {
          this.lastAddedCommentId = null;
        }, 300);

        this.showReplies[res.comment.id] = false;
        this.newComment[postId] = '';
        this.commentCounts[postId] = (this.commentCounts[postId] || 0) + 1;
      }
    });
  }

  // ✅ RESPONDER (ÚNICO CAMBIO AQUÍ)
  startReply(parentCommentId: number, username: string, userId: number | null) {
    this.replyingTo = parentCommentId;
    this.replyingToUser = username;
    this.replyToUserId = userId;
    this.replyContent = `@${username} `;
  }

  cancelReply() {
    this.replyingTo = null;
    this.replyingToUser = null;
    this.replyContent = '';
  }

  sendReply(postId: number, parentId: number) {
  if (!this.replyContent.trim()) return;

  const data = {
    post_id: postId,
    content: this.replyContent,
    parent_id: parentId,
    reply_to_user_id: this.replyToUserId   // ✅ ESTE ES EL FIX REAL
  };

  this.commentService.create(data).subscribe({
    next: (res) => {

      if (res.status === 'pending') {
        this.moderationMessage[postId] =
          'Tu respuesta está siendo revisada por un administrador.';
        this.moderationType[postId] = 'warning';

        this.cancelReply();
        setTimeout(() => delete this.moderationMessage[postId], 4000);
        return;
      }

      const parent = this.comments[postId].find(c => c.id === parentId);
      if (!parent) return;

      if (!parent.replies) parent.replies = [];

      parent.replies.unshift(res.comment);
      this.showReplies[parentId] = true;

      this.cancelReply();

      this.commentCounts[postId] =
        (this.commentCounts[postId] || 0) + 1;
    }
  });
}

  toggleReplies(commentId: number) {
    this.showReplies[commentId] = !this.showReplies[commentId];
  }

  // ✅ EDITAR
  startEdit(comment: Comment) {
    this.editingCommentId = comment.id;
    this.editedContent = comment.content;
  }

  cancelEdit() {
    this.editingCommentId = null;
    this.editedContent = '';
  }

  saveEdit(postId: number, comment: Comment) {
    this.commentService.update(comment.id, this.editedContent).subscribe({
      next: () => {
        comment.content = this.editedContent;
        this.cancelEdit();
      }
    });
  }

  onCommentsScroll(event: any, postId: number) {
    const element = event.target;

    const atBottom =
      element.scrollTop + element.clientHeight >= element.scrollHeight - 20;

    if (atBottom) {
      this.loadMoreComments(postId);
    }
  }

  deleteDirect(postId: number, commentId: number) {

    // ✅ 1. Activar animación de salida
    this.deletingVisualId = commentId;

    // ✅ 2. Esperar a que termine la animación
    setTimeout(() => {

      this.commentService.delete(commentId).subscribe({
        next: () => {

          // ✅ 3. Eliminar del array (desaparece del DOM)
          this.comments[postId] =
            this.comments[postId].filter(c => c.id !== commentId);

          // ✅ 4. Actualizar contador
          this.commentCounts[postId] =
            Math.max((this.commentCounts[postId] || 1) - 1, 0);

          // ✅ 5. Limpiar estados
          delete this.showReplies[commentId];
          this.deletingVisualId = null;
        },
        error: err => {
          console.error('Error borrando comentario', err);
          this.deletingVisualId = null;
        }
      });

    }, 250);
  }
}