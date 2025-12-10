import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { HomeComponent } from './components/home/home';
import { ErrorComponent } from './components/error/error';
import { UserEditComponent } from './components/user-edit/user-edit';
import { authGuard } from './guards/auth.guard';
import { PerfilComponent } from './components/perfil/perfil.component';
import { PostDetailComponent } from './post/post-detail/post-detail';

// ✅ IMPORT CORRECTO (SIN .component)
import { NotificationsComponent } from './components/notifications/notifications';

import { PostListComponent } from './post/post-list/post-list';
import { PostCreateComponent } from './post/post-create/post-create';

// ✅ PANEL DE MODERACIÓN
import { AdminCommentsComponent } from './admin/admin-comments/admin-comments.component';

export const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegisterComponent },

  { path: 'posts', component: PostListComponent },
  { path: 'posts/create', component: PostCreateComponent },

  // ✅ NOTIFICACIONES
  { path: 'notificaciones', component: NotificationsComponent, canActivate: [authGuard] },

  { path: '', component: HomeComponent, canActivate: [authGuard] },
  { path: 'inicio', component: HomeComponent, canActivate: [authGuard] },
  { path: 'ajustes', component: UserEditComponent, canActivate: [authGuard] },
  { path: 'perfil', component: PerfilComponent, canActivate: [authGuard] },

  { path: 'admin/moderation', component: AdminCommentsComponent, canActivate: [authGuard] },
{ path: 'posts/:id', component: PostDetailComponent, canActivate: [authGuard] },

  { path: '**', component: ErrorComponent }
];
