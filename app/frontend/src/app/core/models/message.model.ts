export interface Conversation {
  id: string;
  listingId: string;
  participantOneId: string;
  participantTwoId: string;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  readAt: string | null;
  createdAt: string;
}

export interface ConversationCreateRequest {
  listingId: string;
  recipientId: string;
}

export interface MessageCreateRequest {
  content: string;
}
