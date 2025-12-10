import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PostListComponent } from '../post-list/post-list';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, PostListComponent],
  templateUrl: './post-detail.html',
  styleUrls: ['./post-detail.scss']
})
export class PostDetailComponent {

  postId: number | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.postId = +id;
  }
}
