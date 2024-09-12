import { Chat } from 'src/entities/mongodb/chat.entity';
import { ChatViewModel } from './ChatViewModel';
import { User } from '../entities/postgresql/user.entity';

export function convertChatEntityToChatViewModel(
  data: Chat,
  recipient: User,
): ChatViewModel {
  // Map raw data to the expected View format
  const fullName = recipient.firstName + ' ' + recipient.lastName;
  const unreadCount = data.messages.filter(
    (message) => message.senderId !== data.recipientId && !message.read,
  ).length;
  return new ChatViewModel(
    data.roomId,
    data.creatorId,
    data.recipientId,
    fullName,
    data.lastMessageContent,
    data.lastMessageTimestamp,
    data.lastMessageRead,
    unreadCount,
  );
}
