import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewChecked,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { StompSubscription } from '@stomp/stompjs';
import {
  MessagerieService,
  Conversation,
  Message,
} from '../../services/messagerie/messagerie.service';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './messages.html',
  styleUrl: './messages.css',
})
export class Messages implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messageThread') private messageThreadRef!: ElementRef<HTMLDivElement>;

  readonly currentUserId = 1;

  conversations: Conversation[] = [];
  selectedConversation: Conversation | null = null;
  messages: Message[] = [];

  loadingConversations = false;
  loadingMessages = false;
  errorConversations: string | null = null;
  errorMessages: string | null = null;

  private currentSubscription: StompSubscription | null = null;
  private shouldScrollToBottom = false;

  constructor(
    private messagerieService: MessagerieService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.messagerieService.connect();

    // Small delay to let the STOMP connection establish before any subscription attempt
    setTimeout(() => {
      this.loadConversations();
    }, 300);
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy(): void {
    this.unsubscribeCurrentConversation();
    this.messagerieService.disconnect();
  }

  loadConversations(): void {
    this.loadingConversations = true;
    this.errorConversations = null;

    this.messagerieService.getConversations(this.currentUserId).subscribe({
      next: (conversations) => {
        this.conversations = conversations;
        this.loadingConversations = false;

        // If a conversationId was passed as query param, auto-open it
        this.route.queryParams.subscribe((params) => {
          const idConversation = params['conversationId']
            ? Number(params['conversationId'])
            : null;
          if (idConversation) {
            const target = this.conversations.find(
              (c) => c.idConversation === idConversation
            );
            if (target) {
              this.selectConversation(target);
            }
          }
        });
      },
      error: (err) => {
        console.error('Erreur lors du chargement des conversations:', err);
        this.errorConversations = 'Impossible de charger les conversations.';
        this.loadingConversations = false;
      },
    });
  }

  selectConversation(conversation: Conversation): void {
    if (this.selectedConversation?.idConversation === conversation.idConversation) {
      return;
    }

    this.unsubscribeCurrentConversation();
    this.selectedConversation = conversation;
    this.messages = [];
    this.loadMessages(conversation.idConversation);
    this.subscribeToConversation(conversation.idConversation);
  }

  private loadMessages(idConversation: number): void {
    this.loadingMessages = true;
    this.errorMessages = null;

    this.messagerieService.getMessages(idConversation, this.currentUserId).subscribe({
      next: (messages) => {
        this.messages = messages;
        this.loadingMessages = false;
        this.shouldScrollToBottom = true;

        // Reset unread counter for this conversation in the list
        const conv = this.conversations.find((c) => c.idConversation === idConversation);
        if (conv) {
          conv.nonLus = 0;
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des messages:', err);
        this.errorMessages = 'Impossible de charger les messages.';
        this.loadingMessages = false;
      },
    });
  }

  private subscribeToConversation(idConversation: number): void {
    this.currentSubscription = this.messagerieService.subscribeToConversation(
      idConversation,
      (message: Message) => {
        this.messages = [...this.messages, message];
        this.shouldScrollToBottom = true;
      }
    );
  }

  private unsubscribeCurrentConversation(): void {
    if (this.currentSubscription) {
      this.currentSubscription.unsubscribe();
      this.currentSubscription = null;
    }
  }

  sendMessage(inputEl: HTMLInputElement): void {
    const contenu = inputEl.value.trim();
    if (!contenu || !this.selectedConversation) {
      return;
    }

    this.messagerieService.sendMessage(
      this.selectedConversation.idConversation,
      this.currentUserId,
      contenu
    );

    inputEl.value = '';
  }

  handleSendKeydown(event: KeyboardEvent, inputEl: HTMLInputElement): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage(inputEl);
    }
  }

  getSenderLabel(idExpediteur: number): string {
    return idExpediteur === this.currentUserId ? 'Vous' : 'Interlocuteur';
  }

  isOwnMessage(idExpediteur: number): boolean {
    return idExpediteur === this.currentUserId;
  }

  formatDate(dateEnvoi: string): string {
    const date = new Date(dateEnvoi);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  private scrollToBottom(): void {
    try {
      const el = this.messageThreadRef?.nativeElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    } catch {
      // noop — element may not be rendered yet
    }
  }
}
