import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Conversation,
  ConversationCreateRequest,
  Message,
  MessageCreateRequest,
} from '../models/message.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/messages/conversations`;

  getConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(this.baseUrl);
  }

  createOrGetConversation(request: ConversationCreateRequest): Observable<Conversation> {
    return this.http.post<Conversation>(this.baseUrl, request);
  }

  getMessages(conversationId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.baseUrl}/${conversationId}`);
  }

  sendMessage(conversationId: string, request: MessageCreateRequest): Observable<Message> {
    return this.http.post<Message>(`${this.baseUrl}/${conversationId}`, request);
  }

  markAsRead(conversationId: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${conversationId}/read`, {});
  }

  getUnreadCount(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/unread-count`);
  }

  deleteConversation(conversationId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${conversationId}`);
  }
}
