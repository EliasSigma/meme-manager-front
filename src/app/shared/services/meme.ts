import { Injectable } from '@angular/core';
import { ApiService } from './api';
import { Meme, CreateMemeData } from '../interfaces/meme';

@Injectable({
  providedIn: 'root'
})
export class MemeService {

  constructor(private apiService: ApiService) { }

  async getMemes(page: number = 1, limit: number = 12, search?: string, tags?: string[]): Promise<{data: Meme[], meta: any}> {
    let params: any = {
      limit,
      offset: (page - 1) * limit,
      fields: ['*', 'user_created.first_name', 'user_created.last_name', 'tags.tags_id.name'].join(','),
      sort: '-date_created'
    };

    // Filtre de recherche
    if (search) {
      params['filter[title][_contains]'] = search;
    }

    // Filtre par tags
    if (tags && tags.length > 0) {
      params['filter[tags.tags_id.name][_in]'] = tags.join(',');
    }

    return await this.apiService.requestApi('/items/memes', 'GET', params);
  }

  async getMeme(id: string): Promise<Meme> {
    const params = {
      fields: ['*', 'user_created.first_name', 'user_created.last_name', 'user_created.avatar', 'tags.tags_id.*'].join(',')
    };

    const response = await this.apiService.requestApi(`/items/memes/${id}`, 'GET', params);
    return response.data;
  }

  async createMeme(memeData: CreateMemeData): Promise<Meme> {
    try {
      // D'abord uploader l'image
      const formData = new FormData();
      formData.append('file', memeData.image);

      const uploadResponse = await this.apiService.requestApi('/files', 'POST', formData, undefined, {
        headers: {} // Laisser le navigateur définir le Content-Type pour FormData
      });

      // Puis créer le meme avec l'ID de l'image
      const memePayload = {
        title: memeData.title,
        image: uploadResponse.data.id,
        status: memeData.status || 'published',
        tags: memeData.tags?.map(tagId => ({ tags_id: tagId })) || []
      };

      const response = await this.apiService.requestApi('/items/memes', 'POST', memePayload);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du meme:', error);
      throw error;
    }
  }

  async updateMeme(id: string, data: Partial<Meme>): Promise<Meme> {
    const response = await this.apiService.requestApi(`/items/memes/${id}`, 'PATCH', data);
    return response.data;
  }

  async deleteMeme(id: string): Promise<void> {
    await this.apiService.requestApi(`/items/memes/${id}`, 'DELETE');
  }

  async incrementViews(memeId: string): Promise<void> {
    await this.apiService.requestApi(`/items/memes/${memeId}`, 'PATCH', {
      views: { _increment: 1 }
    });
  }

  async getUserMemes(userId: string): Promise<Meme[]> {
    const params = {
      'filter[user_created][_eq]': userId,
      fields: ['*', 'tags.tags_id.name'].join(','),
      sort: '-date_created'
    };

    const response = await this.apiService.requestApi('/items/memes', 'GET', params);
    return response.data;
  }

  async getPopularMemes(limit: number = 10): Promise<Meme[]> {
    const params = {
      limit,
      fields: ['*', 'user_created.first_name', 'user_created.last_name'].join(','),
      sort: '-likes,-views'
    };

    const response = await this.apiService.requestApi('/items/memes', 'GET', params);
    return response.data;
  }
}