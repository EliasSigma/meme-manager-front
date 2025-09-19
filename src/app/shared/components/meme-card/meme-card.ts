import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Meme } from '../../interfaces/meme';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-meme-card',
  templateUrl: './meme-card.component.html',
  styleUrl: './meme-card.component.scss'
})
export class MemeCard {
  @Input() meme!: Meme;
  @Input() showActions = true;
  @Output() likeClicked = new EventEmitter<Meme>();
  @Output() memeClicked = new EventEmitter<Meme>();

  constructor(private ApiService: ApiService) {}

  getImageUrl(fileId: string): string {
    return this.ApiService.getAssetUrl(fileId, 'fit=cover&width=400&height=400&quality=80');
  }

  onLike(event: Event): void {
    event.stopPropagation();
    this.likeClicked.emit(this.meme);
  }

  onMemeClick(): void {
    this.memeClicked.emit(this.meme);
  }

  getUserName(): string {
    const user = this.meme.user_created;
    if (typeof user === 'object' && user) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Utilisateur anonyme';
    }
    return 'Utilisateur anonyme';
  }

  getRelativeTime(date: string): string {
    const now = new Date();
    const memeDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - memeDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}j`;

    return memeDate.toLocaleDateString('fr-FR');
  }
}