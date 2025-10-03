'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageApiSimulation, MessageFilters } from '@/lib/message-api-simulation';
import { Message, MessageType } from '@/schemas/message-schema';
import { ServiceRequest } from '@/schemas/service-request-schema';
import { Technician, Client } from '@/schemas/user-schema';
import { useAuthStore } from '@/stores/auth-store';
import { format } from 'date-fns';
import {
    Send,
    Phone,
    Video,
    MoreVertical,
    Paperclip,
    Smile,
    Check,
    CheckCheck,
    AlertCircle,
    DollarSign,
    FileText,
    Image as ImageIcon
} from 'lucide-react';

interface ChatWindowProps {
    serviceRequest: ServiceRequest;
    technician?: Technician;
    client?: Client;
    onClose?: () => void;
}

export function ChatWindow({ serviceRequest, technician, client, onClose }: ChatWindowProps) {
    const { user } = useAuthStore();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom when messages change
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load messages
    const loadMessages = useCallback(async () => {
        setIsLoading(true);
        setError('');

        try {
            const filters: MessageFilters = {
                service_request_id: serviceRequest.request_id,
                pagination: { page: 1, limit: 100 }
            };

            const response = await MessageApiSimulation.getMessages(filters);

            if (response.success && response.data) {
                setMessages(response.data);
            } else {
                setError(response.error || 'Failed to load messages');
            }
        } catch {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    }, [serviceRequest.request_id]);

    useEffect(() => {
        loadMessages();
    }, [loadMessages]);

    // Set up real-time messaging
    useEffect(() => {
        const ws = MessageApiSimulation.getWebSocket();

        const disconnect = ws.connect(serviceRequest.request_id, (message) => {
            setMessages(prev => [...prev, message]);
        });

        return disconnect;
    }, [serviceRequest.request_id]);

    // Send message
    const handleSendMessage = async () => {
        if (!newMessage.trim() || !user) return;

        setIsSending(true);
        setError('');

        try {
            const messageData = {
                service_request_id: serviceRequest.request_id,
                sender_id: user.user_id,
                sender_type: user.user_type as 'client' | 'technician',
                message_type: 'text' as MessageType,
                content: newMessage.trim(),
                is_read: false,
            };

            const response = await MessageApiSimulation.sendMessage(messageData);

            if (response.success) {
                setNewMessage('');
                // Mark messages as read
                await MessageApiSimulation.markMessagesAsRead(serviceRequest.request_id, user.user_id);
            } else {
                setError(response.error || 'Failed to send message');
            }
        } catch {
            setError('Failed to send message');
        } finally {
            setIsSending(false);
        }
    };

    // Handle key press
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Get message icon based on type
    const getMessageIcon = (messageType: MessageType) => {
        switch (messageType) {
            case 'transport_fee_proposal': return <DollarSign className="w-4 h-4" />;
            case 'payment_confirmation': return <CheckCheck className="w-4 h-4" />;
            case 'service_update': return <AlertCircle className="w-4 h-4" />;
            case 'system_notification': return <AlertCircle className="w-4 h-4" />;
            case 'image': return <ImageIcon className="w-4 h-4" />;
            case 'file': return <FileText className="w-4 h-4" />;
            default: return null;
        }
    };

    // Get message type color
    const getMessageTypeColor = (messageType: MessageType) => {
        switch (messageType) {
            case 'transport_fee_proposal': return 'bg-green-100 text-green-800 border-green-200';
            case 'payment_confirmation': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'service_update': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'system_notification': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return '';
        }
    };

    // Get other participant
    const otherParticipant = user?.user_type === 'client' ? technician : client;
    const otherParticipantName = otherParticipant ? `${otherParticipant.first_name} ${otherParticipant.last_name}` : 'Unknown';

    return (
        <Card className="h-[600px] flex flex-col bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
            <CardHeader className="flex-shrink-0 pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                            <AvatarImage src={otherParticipant?.profile_picture_url || undefined} />
                            <AvatarFallback>
                                {otherParticipant ? otherParticipant.first_name[0] + otherParticipant.last_name[0] : '??'}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-lg">{otherParticipantName}</CardTitle>
                            <p className="text-sm text-gray-600">
                                Service Request: {serviceRequest.request_id.slice(-8)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                            <Phone className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                            <Video className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                        {onClose && (
                            <Button variant="outline" size="sm" onClick={onClose}>
                                ×
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {isLoading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading messages...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8">
                            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
                            <p className="text-red-600">{error}</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Send className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500">No messages yet</p>
                            <p className="text-sm text-gray-400">Start the conversation!</p>
                        </div>
                    ) : (
                        messages.map((message) => {
                            const isOwnMessage = message.sender_id === user?.user_id;
                            const isSystemMessage = message.sender_type === 'system';
                            const messageDate = new Date(message.created_at);
                            const isToday = messageDate.toDateString() === new Date().toDateString();

                            return (
                                <div key={message.message_id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                                        {!isOwnMessage && !isSystemMessage && (
                                            <div className="flex items-center space-x-2 mb-1">
                                                <Avatar className="w-6 h-6">
                                                    <AvatarFallback className="text-xs">
                                                        {otherParticipant ? otherParticipant.first_name[0] : '?'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-xs text-gray-500">{otherParticipantName}</span>
                                            </div>
                                        )}

                                        <div className={`rounded-lg p-3 ${isOwnMessage
                                            ? 'bg-blue-600 text-white'
                                            : isSystemMessage
                                                ? 'bg-gray-100 text-gray-800'
                                                : 'bg-gray-200 text-gray-900'
                                            }`}>
                                            {/* Message Type Badge */}
                                            {message.message_type !== 'text' && (
                                                <div className="flex items-center space-x-1 mb-2">
                                                    {getMessageIcon(message.message_type)}
                                                    <Badge className={`text-xs ${getMessageTypeColor(message.message_type)}`}>
                                                        {message.message_type.replace('_', ' ')}
                                                    </Badge>
                                                </div>
                                            )}

                                            {/* Message Content */}
                                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                                            {/* Message Meta */}
                                            <div className={`flex items-center justify-between mt-2 text-xs ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                                                }`}>
                                                <span>
                                                    {isToday
                                                        ? format(messageDate, 'h:mm a')
                                                        : format(messageDate, 'MMM d, h:mm a')
                                                    }
                                                </span>
                                                {isOwnMessage && (
                                                    <div className="flex items-center space-x-1">
                                                        {message.is_read ? (
                                                            <CheckCheck className="w-3 h-3" />
                                                        ) : (
                                                            <Check className="w-3 h-3" />
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="flex-shrink-0 p-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                            <Paperclip className="w-4 h-4" />
                        </Button>
                        <div className="flex-1 relative">
                            <Input
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type a message..."
                                disabled={isSending}
                                className="pr-12"
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                className="absolute right-1 top-1/2 transform -translate-y-1/2"
                            >
                                <Smile className="w-4 h-4" />
                            </Button>
                        </div>
                        <Button
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim() || isSending}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isSending ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
