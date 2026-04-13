import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MessageService } from '../../core/services/message.service';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { Conversation } from '../../core/models/message.model';

@Component({
  selector: 'app-conversations',
  imports: [RouterLink],
  template: `
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-8">Mes messages</h1>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-500"></div>
        </div>
      } @else if (conversations().length === 0) {
        <div class="text-center py-16">
          <svg class="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Aucune conversation</h3>
          <p class="text-gray-500">Contactez un propriétaire depuis une annonce pour démarrer une conversation.</p>
        </div>
      } @else {
        <div class="space-y-2">
          @for (conv of conversations(); track conv.id) {
            @if (deletingId() === conv.id) {
              <div class="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p class="text-sm text-red-700 mb-3">Supprimer cette conversation avec <strong>{{ getParticipantName(conv) }}</strong> ? Cette action est irréversible.</p>
                <div class="flex gap-2 justify-end">
                  <button (click)="cancelDelete()" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                    Annuler
                  </button>
                  <button (click)="confirmDelete(conv.id)" class="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition">
                    Supprimer
                  </button>
                </div>
              </div>
            } @else {
              <div class="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition">
                <a [routerLink]="['/conversation', conv.id]" class="flex items-center gap-4 flex-1 min-w-0 cursor-pointer">
                  <div class="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span class="text-sm font-bold text-rose-500">{{ getInitials(conv) }}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900">{{ getParticipantName(conv) }}</p>
                    <p class="text-xs text-gray-500">Dernière activité : {{ formatDate(conv.lastMessageAt) }}</p>
                  </div>
                  <svg class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </a>
                <button (click)="askDelete(conv.id)" class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition flex-shrink-0" title="Supprimer la conversation">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            }
          }
        </div>
      }
    </div>
  `,
})
export class ConversationsComponent implements OnInit {
  private messageService = inject(MessageService);
  private userService = inject(UserService);
  private auth = inject(AuthService);

  conversations = signal<Conversation[]>([]);
  loading = signal(true);
  deletingId = signal<string | null>(null);
  participantNames = signal<Record<string, string>>({});

  ngOnInit() {
    this.messageService.getConversations().subscribe({
      next: (data) => {
        this.conversations.set(data);
        this.loading.set(false);
        this.resolveParticipantNames(data);
      },
      error: () => this.loading.set(false),
    });
  }

  private resolveParticipantNames(convs: Conversation[]) {
    const currentUserId = this.auth.getKeycloakId() || '';
    const otherIds = new Set<string>();
    for (const conv of convs) {
      const otherId = conv.participantOneId === currentUserId ? conv.participantTwoId : conv.participantOneId;
      otherIds.add(otherId);
    }
    for (const id of otherIds) {
      this.userService.getById(id).subscribe({
        next: (user) => {
          this.participantNames.update((names) => ({
            ...names,
            [id]: `${user.firstName} ${user.lastName}`,
          }));
        },
      });
    }
  }

  getParticipantName(conv: Conversation): string {
    const currentUserId = this.auth.getKeycloakId() || '';
    const otherId = conv.participantOneId === currentUserId ? conv.participantTwoId : conv.participantOneId;
    return this.participantNames()[otherId] || 'Chargement...';
  }

  getInitials(conv: Conversation): string {
    const name = this.getParticipantName(conv);
    if (!name || name === 'Chargement...') return '?';
    const parts = name.split(' ').filter(Boolean);
    return parts.map((p) => p[0]).join('').toUpperCase().substring(0, 2);
  }

  askDelete(id: string) {
    this.deletingId.set(id);
  }

  cancelDelete() {
    this.deletingId.set(null);
  }

  confirmDelete(id: string) {
    this.messageService.deleteConversation(id).subscribe({
      next: () => {
        this.conversations.update((list) => list.filter((c) => c.id !== id));
        this.deletingId.set(null);
      },
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Paris',
    });
  }
}
