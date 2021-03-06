import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeWelcomeComponent } from './welcome.component';
import { PostListModule } from '../../post-list/post-list.module';
import { LoadingModule } from '../../loading/loading.module';
import {FooterModule} from '../../footer/footer.module';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    PostListModule,
    LoadingModule,
    FooterModule,
  ],
  exports: [HomeWelcomeComponent],
  declarations: [HomeWelcomeComponent],
})
export class HomeWelcomeModule {
}
