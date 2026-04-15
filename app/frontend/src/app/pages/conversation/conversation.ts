import { Component, inject, OnInit, OnDestroy, signal, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MessageService } from '../../core/services/message.service';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { WebSocketService } from '../../core/services/websocket.service';
import { Message } from '../../core/models/message.model';

@Component({
  selector: 'app-conversation',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col" style="height: calc(100vh - 80px);">
      <div class="flex items-center gap-3 mb-4">
        <a routerLink="/conversations"
           class="p-2 hover:bg-gray-100 rounded-lg transition">
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </a>
        <div class="flex items-center gap-3">
          @if (otherParticipantName()) {
            <div class="w-9 h-9 bg-rose-100 rounded-full flex items-center justify-center">
              <span class="text-xs font-bold text-rose-500">{{ getInitials() }}</span>
            </div>
          }
          <h1 class="text-lg font-semibold text-gray-900">{{ otherParticipantName() || 'Conversation' }}</h1>
        </div>
      </div>

      @if (loading()) {
        <div class="flex-1 flex justify-center items-center">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-500"></div>
        </div>
      } @else {
        <div #messagesContainer class="flex-1 overflow-y-auto space-y-3 mb-4 p-4 bg-gray-50 rounded-xl">
          @if (messages().length === 0) {
            <p class="text-center text-gray-400 py-8">Aucun message. Commencez la conversation !</p>
          }
          @for (msg of messages(); track msg.id) {
            @if (isSystemMessage(msg)) {
              <div class="flex justify-center my-2">
                <div class="max-w-sm lg:max-w-md px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
                  <div class="flex items-center justify-center gap-2 mb-1">
                    <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span class="text-xs font-semibold text-amber-600">Message système</span>
                  </div>
                  <p class="text-sm text-amber-800 whitespace-pre-line">{{ msg.content }}</p>
                  <p class="text-xs mt-1 text-amber-400">{{ formatTime(msg.createdAt) }}</p>
                </div>
              </div>
            } @else {
              <div [class]="msg.senderId === currentUserId()
                ? 'flex justify-end'
                : 'flex justify-start'">
                <div [class]="msg.senderId === currentUserId()
                  ? 'max-w-xs lg:max-w-md px-4 py-2 rounded-2xl bg-rose-500 text-white rounded-br-md'
                  : 'max-w-xs lg:max-w-md px-4 py-2 rounded-2xl bg-white border border-gray-200 text-gray-900 rounded-bl-md'">
                  <p class="text-sm whitespace-pre-line">{{ msg.content }}</p>
                  <p [class]="msg.senderId === currentUserId()
                    ? 'text-xs mt-1 text-rose-200'
                    : 'text-xs mt-1 text-gray-400'">
                    {{ formatTime(msg.createdAt) }}
                  </p>
                </div>
              </div>
            }
          }
        </div>

        <form (ngSubmit)="send()" class="flex gap-2">
          <input type="text" [(ngModel)]="newMessage" name="newMessage"
                 placeholder="Votre message..."
                 class="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:ring-rose-500 focus:border-rose-500"
                 autocomplete="off"/>
          <button type="submit" [disabled]="!newMessage.trim() || sending()"
                  class="px-6 py-3 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition disabled:opacity-50">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
          </button>
        </form>
      }
    </div>
  `,
})
export class ConversationComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);
  private userService = inject(UserService);
  private auth = inject(AuthService);
  private ws = inject(WebSocketService);

  messages = signal<Message[]>([]);
  loading = signal(true);
  sending = signal(false);
  otherParticipantName = signal<string>('');
  newMessage = '';
  private conversationId = '';
  private wsSub: Subscription | null = null;
  private pollInterval: ReturnType<typeof setInterval> | null = null;

  @ViewChild('messagesContainer') private messagesContainer?: ElementRef;

  currentUserId(): string {
    return this.auth.getKeycloakId() || '';
  }

  ngOnInit() {
    this.conversationId = this.route.snapshot.paramMap.get('id') || '';
    if (this.conversationId) {
      this.loadMessages();
      this.messageService.markAsRead(this.conversationId).subscribe();
      this.resolveOtherParticipant();

      this.ws.subscribeToConversation(this.conversationId);
      this.wsSub = this.ws.newMessage$.subscribe((msg) => {
        if (msg.conversationId === this.conversationId) {
          const existing = this.messages();
          if (!existing.find((m) => m.id === msg.id)) {
            this.messages.update((msgs) => [...msgs, msg]);
            setTimeout(() => this.scrollToBottom(), 50);
            this.messageService.markAsRead(this.conversationId).subscribe();
          }
        }
      });

      this.pollInterval = setInterval(() => {
        this.loadMessages(false);
        this.messageService.markAsRead(this.conversationId).subscribe();
      }, 30000);
    }
  }

  ngOnDestroy() {
    this.wsSub?.unsubscribe();
    this.ws.unsubscribeFromConversation(this.conversationId);
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }

  private resolveOtherParticipant() {
    this.messageService.getConversations().subscribe({
      next: (convs) => {
        const conv = convs.find((c) => c.id === this.conversationId);
        if (conv) {
          const currentId = this.currentUserId();
          const otherId = conv.participantOneId === currentId ? conv.participantTwoId : conv.participantOneId;
          this.userService.getById(otherId).subscribe({
            next: (user) => this.otherParticipantName.set(`${user.firstName} ${user.lastName}`),
          });
        }
      },
    });
  }

  getInitials(): string {
    const name = this.otherParticipantName();
    if (!name) return '?';
    const parts = name.split(' ').filter(Boolean);
    return parts.map((p) => p[0]).join('').toUpperCase().substring(0, 2);
  }

  private loadMessages(showLoading = true) {
    if (showLoading) this.loading.set(true);
    this.messageService.getMessages(this.conversationId).subscribe({
      next: (msgs) => {
        const currentCount = this.messages().length;
        this.messages.set(msgs);
        this.loading.set(false);
        if (msgs.length > currentCount) {
          setTimeout(() => this.scrollToBottom(), 50);
        }
      },
      error: () => this.loading.set(false),
    });
  }

  send() {
    if (!this.newMessage.trim()) return;
    this.sending.set(true);
    const content = this.newMessage.trim();
    this.newMessage = '';

    this.messageService.sendMessage(this.conversationId, { content }).subscribe({
      next: (msg) => {
        const existing = this.messages();
        if (!existing.find((m) => m.id === msg.id)) {
          this.messages.update((msgs) => [...msgs, msg]);
        }
        this.sending.set(false);
        setTimeout(() => this.scrollToBottom(), 50);
      },
      error: () => {
        this.newMessage = content;
        this.sending.set(false);
      },
    });
  }

  private scrollToBottom() {
    if (this.messagesContainer) {
      const el = this.messagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }

  private readonly SYSTEM_SENDER_ID = '00000000-0000-0000-0000-000000000000';

  isSystemMessage(msg: Message): boolean {
    return msg.senderId === this.SYSTEM_SENDER_ID;
  }

  formatTime(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' });
  }
}
