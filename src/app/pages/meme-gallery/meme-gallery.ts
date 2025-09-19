import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MemeService } from '../../shared/services/meme';
import { LikeService } from '../../shared/services/like';
import { Meme } from '../../shared/interfaces/meme';

@Component({
  selector: 'app-meme-gallery',
  templateUrl: './meme-gallery.component.html',
  styleUrl: './meme-gallery.component.scss'
})
export class MemeGallery implements OnInit {
  memes: Meme[] = [];
  isLoading = true;
  error = '';
  searchTerm = '';
  selectedTags: string[] = [];

  // Pagination
  currentPage = 1;
  totalPages = 1;
  hasMore = true;

  constructor(
    private memeService: MemeService,
    private likeService: LikeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMemes();
  }

  loadMemes(reset = false): void {
    if (reset) {
      this.currentPage = 1;
      this.memes = [];
    }

    this.isLoading = true;
    this.error = '';

    this.memeService.getMemes(this.currentPage, 12, this.searchTerm, this.selectedTags)
      .subscribe({
        next: (response) => {
          if (reset) {
            this.memes = response.data;
          } else {
            this.memes = [...this.memes, ...response.data];
          }

          this.totalPages = Math.ceil(response.meta.total_count / response.meta.limit);
          this.hasMore = this.currentPage < this.totalPages;
          this.isLoading = false;
        },
        error: (error) => {
          this.error = 'Erreur lors du chargement des memes';
          this.isLoading = false;
          console.error('Erreur:', error);
        }
      });
  }

  onSearch(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.loadMemes(true);
  }

  onTagsChanged(tags: string[]): void {
    this.selectedTags = tags;
    this.loadMemes(true);
  }

  onMemeClicked(meme: Meme): void {
    this.router.navigate(['/meme', meme.id]);
  }

  onLikeClicked(meme: Meme): void {
    this.likeService.toggleLike(meme.id).subscribe({
      next: (liked) => {
        // Mettre à jour le compteur de likes
        const index = this.memes.findIndex(m => m.id === meme.id);
        if (index !== -1) {
          this.memes[index].likes = liked ? meme.likes + 1 : meme.likes - 1;
        }
      },
      error: (error) => {
        console.error('Erreur lors du like:', error);
      }
    });
  }

  loadMore(): void {
    if (this.hasMore && !this.isLoading) {
      this.currentPage++;
      this.loadMemes();
    }
  }

  trackByMemeId(index: number, meme: Meme): string {
    return meme.id;
  }
}