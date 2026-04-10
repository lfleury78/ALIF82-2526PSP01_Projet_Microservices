import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { environment } from '../../../environments/environment';

export interface Conversation {
  idConversation: number;
  idUser1: number;
  idUser2: number;
  idAnnonce?: number;
  dernierMessage?: string;
  nonLus?: number;
}

export interface Message {
  idMessage: number;
  idConversation: number;
  idExpediteur: number;
  contenu: string;
  lu: boolean;
  dateEnvoi: string;
}

export interface SendMessagePayload {
  idConversation: number;
  idExpediteur: number;
  contenu: string;
}

export interface CreateConversationPayload {
  idUser1: number;
  idUser2: number;
  idAnnonce?: number;
}

@Injectable({
  providedIn: 'root',
})
export class MessagerieService implements OnDestroy {
  private stompClient: Client;
  private readonly wsUrl = environment.MESSAGERIE_WS_URL;
  private readonly apiUrl = environment.MESSAGERIE_URL;

  constructor(private http: HttpClient) {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(this.wsUrl) as WebSocket,
      reconnectDelay: 5000,
    });
  }

  connect(): void {
    if (!this.stompClient.active) {
      this.stompClient.activate();
    }
  }

  disconnect(): void {
    if (this.stompClient.active) {
      this.stompClient.deactivate();
    }
  }

  subscribeToConversation(
    idConversation: number,
    callback: (message: Message) => void
  ): StompSubscription | null {
    if (!this.stompClient.active) {
      console.warn('MessagerieService: STOMP client not connected — cannot subscribe.');
      return null;
    }
    return this.stompClient.subscribe(
      `/topic/conversation/${idConversation}`,
      (stompMessage: IMessage) => {
        try {
          const parsed: Message = JSON.parse(stompMessage.body);
          callback(parsed);
        } catch (e) {
          console.error('MessagerieService: failed to parse incoming message', e);
        }
      }
    );
  }

  sendMessage(idConversation: number, idExpediteur: number, contenu: string): void {
    if (!this.stompClient.active) {
      console.warn('MessagerieService: STOMP client not connected — cannot send message.');
      return;
    }
    const payload: SendMessagePayload = { idConversation, idExpediteur, contenu };
    this.stompClient.publish({
      destination: `/app/conversation/${idConversation}`,
      body: JSON.stringify(payload),
    });
  }

  getConversations(idUser: number): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.apiUrl}/api/conversations/${idUser}`);
  }

  getMessages(idConversation: number, idLecteur: number): Observable<Message[]> {
    return this.http.get<Message[]>(
      `${this.apiUrl}/api/conversations/${idConversation}/messages?idLecteur=${idLecteur}`
    );
  }

  createConversation(
    idUser1: number,
    idUser2: number,
    idAnnonce?: number
  ): Observable<Conversation> {
    const payload: CreateConversationPayload = { idUser1, idUser2 };
    if (idAnnonce !== undefined) {
      payload.idAnnonce = idAnnonce;
    }
    return this.http.post<Conversation>(`${this.apiUrl}/api/conversations`, payload);
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
