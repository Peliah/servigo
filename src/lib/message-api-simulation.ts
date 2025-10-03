import { Message, MessageType, Conversation } from '@/schemas/message-schema';
import { ServiceRequest } from '@/schemas/service-request-schema';
import { ApiResponse } from './mock-api';

// Simulate network delay
const simulateNetworkDelay = (min = 300, max = 800) => {
    const delay = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
};

export interface MessageFilters {
    service_request_id?: string;
    sender_id?: string;
    message_type?: MessageType;
    date_from?: Date;
    date_to?: Date;
    pagination?: {
        page: number;
        limit: number;
    };
}

export interface MessageResponse {
    success: boolean;
    data?: Message[];
    error?: string;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface ConversationResponse {
    success: boolean;
    data?: Conversation[];
    error?: string;
}

// WebSocket simulation for real-time messaging
class WebSocketSimulation {
    private static instance: WebSocketSimulation;
    private listeners: Map<string, Set<(message: Message) => void>> = new Map();
    private messageQueue: Message[] = [];

    static getInstance(): WebSocketSimulation {
        if (!WebSocketSimulation.instance) {
            WebSocketSimulation.instance = new WebSocketSimulation();
        }
        return WebSocketSimulation.instance;
    }

    // Simulate connecting to a specific service request conversation
    connect(serviceRequestId: string, onMessage: (message: Message) => void): () => void {
        if (!this.listeners.has(serviceRequestId)) {
            this.listeners.set(serviceRequestId, new Set());
        }

        this.listeners.get(serviceRequestId)!.add(onMessage);

        // Simulate receiving any queued messages for this conversation
        this.messageQueue
            .filter(msg => msg.service_request_id === serviceRequestId)
            .forEach(msg => onMessage(msg));

        // Return disconnect function
        return () => {
            this.listeners.get(serviceRequestId)?.delete(onMessage);
            if (this.listeners.get(serviceRequestId)?.size === 0) {
                this.listeners.delete(serviceRequestId);
            }
        };
    }

    // Simulate sending a message
    sendMessage(message: Message): void {
        // Store message in localStorage
        const messages = JSON.parse(localStorage.getItem('servigo_messages') || '[]');
        messages.push(message);
        localStorage.setItem('servigo_messages', JSON.stringify(messages));

        // Add to queue for real-time delivery
        this.messageQueue.push(message);

        // Notify all listeners for this service request
        const listeners = this.listeners.get(message.service_request_id);
        if (listeners) {
            listeners.forEach(listener => {
                // Simulate network delay for real-time delivery
                setTimeout(() => listener(message), Math.random() * 500 + 100);
            });
        }
    }

    // Simulate typing indicators
    simulateTyping(serviceRequestId: string, senderId: string, isTyping: boolean): void {
        // This would be implemented for real typing indicators
        console.log(`Typing simulation: ${serviceRequestId} ${senderId} ${isTyping}`);
    }
}

export class MessageApiSimulation {
    private static ws = WebSocketSimulation.getInstance();

    // Send a message
    static async sendMessage(messageData: Omit<Message, 'message_id' | 'created_at'>): Promise<ApiResponse<Message>> {
        await simulateNetworkDelay();

        try {
            const message: Message = {
                ...messageData,
                message_id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                created_at: new Date(),
            };

            // Send via WebSocket simulation
            this.ws.sendMessage(message);

            return {
                success: true,
                data: message,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to send message',
            };
        }
    }

    // Get messages for a service request
    static async getMessages(filters: MessageFilters = {}): Promise<MessageResponse> {
        await simulateNetworkDelay();

        try {
            const messages = JSON.parse(localStorage.getItem('servigo_messages') || '[]');

            // Apply filters
            const filteredMessages = messages.filter((message: Message) => {
                if (filters.service_request_id && message.service_request_id !== filters.service_request_id) return false;
                if (filters.sender_id && message.sender_id !== filters.sender_id) return false;
                if (filters.message_type && message.message_type !== filters.message_type) return false;
                if (filters.date_from && message.created_at < filters.date_from) return false;
                if (filters.date_to && message.created_at > filters.date_to) return false;
                return true;
            });

            // Sort by created_at (oldest first for chat)
            filteredMessages.sort((a: Message, b: Message) =>
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );

            // Apply pagination
            const page = filters.pagination?.page || 1;
            const limit = filters.pagination?.limit || 50;
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedMessages = filteredMessages.slice(startIndex, endIndex);

            return {
                success: true,
                data: paginatedMessages,
                pagination: {
                    page,
                    limit,
                    total: filteredMessages.length,
                    totalPages: Math.ceil(filteredMessages.length / limit),
                },
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get messages',
            };
        }
    }

    // Get or create conversation for a service request
    static async getConversation(serviceRequestId: string): Promise<ApiResponse<Conversation>> {
        await simulateNetworkDelay();

        try {
            const conversations = JSON.parse(localStorage.getItem('servigo_conversations') || '[]');
            let conversation = conversations.find((c: Conversation) => c.service_request_id === serviceRequestId);

            if (!conversation) {
                // Get service request details to create conversation
                const requests = JSON.parse(localStorage.getItem('servigo_service_requests') || '[]');
                const serviceRequest = requests.find((r: ServiceRequest) => r.request_id === serviceRequestId);

                if (!serviceRequest) {
                    return {
                        success: false,
                        error: 'Service request not found',
                    };
                }

                // Create new conversation
                conversation = {
                    conversation_id: `conv_${Date.now()}`,
                    service_request_id: serviceRequestId,
                    client_id: serviceRequest.client_id,
                    technician_id: serviceRequest.technician_id,
                    is_active: true,
                    created_at: new Date(),
                    updated_at: new Date(),
                };

                conversations.push(conversation);
                localStorage.setItem('servigo_conversations', JSON.stringify(conversations));
            }

            return {
                success: true,
                data: conversation,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get conversation',
            };
        }
    }

    // Mark messages as read
    static async markMessagesAsRead(serviceRequestId: string, readerId: string): Promise<ApiResponse<void>> {
        await simulateNetworkDelay();

        try {
            const messages = JSON.parse(localStorage.getItem('servigo_messages') || '[]');

            const updatedMessages = messages.map((message: Message) => {
                if (
                    message.service_request_id === serviceRequestId &&
                    message.sender_id !== readerId &&
                    !message.is_read
                ) {
                    return {
                        ...message,
                        is_read: true,
                        read_at: new Date(),
                    };
                }
                return message;
            });

            localStorage.setItem('servigo_messages', JSON.stringify(updatedMessages));

            return {
                success: true,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to mark messages as read',
            };
        }
    }

    // Get unread message count for a user
    static async getUnreadCount(userId: string): Promise<ApiResponse<number>> {
        await simulateNetworkDelay();

        try {
            const messages = JSON.parse(localStorage.getItem('servigo_messages') || '[]');

            const unreadCount = messages.filter((message: Message) =>
                message.sender_id !== userId && !message.is_read
            ).length;

            return {
                success: true,
                data: unreadCount,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get unread count',
            };
        }
    }

    // Get WebSocket connection for real-time messaging
    static getWebSocket(): WebSocketSimulation {
        return this.ws;
    }
}
