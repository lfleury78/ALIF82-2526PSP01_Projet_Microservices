import { Injectable, inject, OnDestroy } from '@angular/core';
import { Client } from '@stomp/stompjs';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { Message } from '../models/message.model';

@Injectable({ providedIn: 'root' })
export class WebSocketService implements OnDestroy {
  private auth = inject(AuthService);
  private client: Client | null = null;
  private subscriptions = new Map<string, { unsubscribe: () => void }>();
  private pendingConversations = new Set<string>();

  readonly newMessage$ = new Subject<Message>();
  readonly unreadUpdate$ = new Subject<void>();

  connect(): void {
    if (this.client?.active) return;

    this.client = new Client({
      brokerURL: environment.wsUrl,
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    });

    this.client.onConnect = () => {
      this.subscribeToUnread();
      this.pendingConversations.forEach((id) => this.doSubscribeToConversation(id));
      this.pendingConversations.clear();
    };

    this.client.onStompError = () => {};

    this.client.activate();
  }

  disconnect(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions.clear();
    this.pendingConversations.clear();
    this.client?.deactivate();
    this.client = null;
  }

  subscribeToConversation(conversationId: string): void {
    if (this.client?.active) {
      this.doSubscribeToConversation(conversationId);
    } else {
      this.pendingConversations.add(conversationId);
    }
  }

  unsubscribeFromConversation(conversationId: string): void {
    this.pendingConversations.delete(conversationId);
    const key = `conversation.${conversationId}`;
    const sub = this.subscriptions.get(key);
    if (sub) {
      sub.unsubscribe();
      this.subscriptions.delete(key);
    }
  }

  private doSubscribeToConversation(conversationId: string): void {
    const key = `conversation.${conversationId}`;
    if (this.subscriptions.has(key)) return;

    const sub = this.client!.subscribe(`/topic/conversation.${conversationId}`, (frame) => {
      const message: Message = JSON.parse(frame.body);
      this.newMessage$.next(message);
    });
    this.subscriptions.set(key, sub);
  }

  private subscribeToUnread(): void {
    const userId = this.auth.getKeycloakId();
    if (!userId || !this.client?.active) return;

    const key = `unread.${userId}`;
    if (this.subscriptions.has(key)) return;

    const sub = this.client.subscribe(`/topic/unread.${userId}`, () => {
      this.unreadUpdate$.next();
    });
    this.subscriptions.set(key, sub);
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
