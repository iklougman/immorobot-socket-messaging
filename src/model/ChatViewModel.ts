export class ChatViewModel {
  roomId: string;
  creatorId: string;
  recipientId: string;
  recipientName: string;
  lastMessageContent: string;
  lastMessageTimestamp: Date;
  lastMessageRead: boolean;
  unreadCount: number;

  constructor(
    roomId: string,
    creatorId: string,
    recipientId: string,
    recipientName: string,
    lastMessageContent: string,
    lastMessageTimestamp: Date,
    lastMessageRead: boolean,
    unreadCount: number,
  ) {
    this.roomId = roomId;
    this.creatorId = creatorId;
    this.recipientId = recipientId;
    this.recipientName = recipientName;
    this.lastMessageContent = lastMessageContent;
    this.lastMessageTimestamp = lastMessageTimestamp;
    this.lastMessageRead = lastMessageRead;
    this.unreadCount = unreadCount;
  }
}
