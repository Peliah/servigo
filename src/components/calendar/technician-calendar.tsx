'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookingApiSimulation, AvailabilitySlot } from '@/lib/booking-api-simulation';
import { ServiceRequest } from '@/schemas/service-request-schema';
import { Technician } from '@/schemas/user-schema';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addDays, subDays } from 'date-fns';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface TechnicianCalendarProps {
  technician: Technician;
}

interface CalendarEvent {
  date: Date;
  requests: ServiceRequest[];
  availability: AvailabilitySlot[];
}

export function TechnicianCalendar({ technician }: TechnicianCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  // Load calendar data
  const loadCalendarData = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Get requests for the current month
      const startDate = startOfMonth(currentDate);
      const endDate = endOfMonth(currentDate);

      const response = await BookingApiSimulation.getServiceRequests({
        technician_id: technician.user_id,
        date_from: startDate,
        date_to: endDate,
        pagination: { page: 1, limit: 100 }
      });

      if (response.success && response.data) {
        setRequests(response.data);
      } else {
        setError(response.error || 'Failed to load calendar data');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCalendarData();
  }, [currentDate, technician.user_id]);

  // Generate calendar events
  useEffect(() => {
    const generateEvents = async () => {
      const startDate = startOfMonth(currentDate);
      const endDate = endOfMonth(currentDate);
      const days = eachDayOfInterval({ start: startDate, end: endDate });

      const calendarEvents: CalendarEvent[] = [];

      for (const day of days) {
        const dayRequests = requests.filter(request => 
          isSameDay(new Date(request.preferred_date), day)
        );

        // Get availability for this day
        const dateString = format(day, 'yyyy-MM-dd');
        const availabilityResponse = await BookingApiSimulation.getTechnicianAvailability(
          technician.user_id,
          dateString
        );

        calendarEvents.push({
          date: day,
          requests: dayRequests,
          availability: availabilityResponse.success ? availabilityResponse.data || [] : []
        });
      }

      setEvents(calendarEvents);
    };

    if (requests.length > 0) {
      generateEvents();
    }
  }, [requests, currentDate, technician.user_id]);

  const getEventColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'rejected': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'accepted': return <CheckCircle className="w-3 h-3" />;
      case 'in_progress': return <AlertCircle className="w-3 h-3" />;
      case 'completed': return <CheckCircle className="w-3 h-3" />;
      case 'cancelled': return <XCircle className="w-3 h-3" />;
      case 'rejected': return <XCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentDate(subDays(startOfMonth(currentDate), 1));
    } else {
      setCurrentDate(addDays(endOfMonth(currentDate), 1));
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              <span>Calendar View</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Select value={viewMode} onValueChange={(value: 'month' | 'week' | 'day') => setViewMode(value)}>
                <SelectTrigger className="w-32 bg-white/80 border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="day">Day</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
                className="bg-white/80 border-gray-200"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
                className="bg-white/80 border-gray-200"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            {format(currentDate, 'MMMM yyyy')} • {requests.length} bookings
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading calendar...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
              <p className="text-red-600">{error}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Header */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}

                {/* Calendar Days */}
                {events.map(event => {
                  const isToday = isSameDay(event.date, new Date());
                  const isSelected = selectedDate && isSameDay(event.date, selectedDate);
                  const hasRequests = event.requests.length > 0;

                  return (
                    <div
                      key={event.date.toISOString()}
                      className={`min-h-[100px] p-2 border rounded-lg cursor-pointer transition-colors ${
                        isToday
                          ? 'bg-blue-50 border-blue-200'
                          : isSelected
                          ? 'bg-gray-50 border-gray-300'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedDate(event.date)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-sm font-medium ${
                          isToday ? 'text-blue-600' : 'text-gray-900'
                        }`}>
                          {format(event.date, 'd')}
                        </span>
                        {hasRequests && (
                          <Badge variant="secondary" className="text-xs">
                            {event.requests.length}
                          </Badge>
                        )}
                      </div>

                      {/* Events */}
                      <div className="space-y-1">
                        {event.requests.slice(0, 2).map(request => (
                          <div
                            key={request.request_id}
                            className={`text-xs p-1 rounded border ${getEventColor(request.status)}`}
                          >
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(request.status)}
                              <span className="truncate">{request.preferred_time}</span>
                            </div>
                          </div>
                        ))}
                        {event.requests.length > 2 && (
                          <div className="text-xs text-gray-500 text-center">
                            +{event.requests.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Date Details */}
              {selectedDate && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </h3>
                  
                  {(() => {
                    const selectedEvent = events.find(e => isSameDay(e.date, selectedDate));
                    if (!selectedEvent) return null;

                    return (
                      <div className="space-y-3">
                        {/* Availability */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Availability</h4>
                          <div className="grid grid-cols-4 gap-2">
                            {selectedEvent.availability.map(slot => (
                              <div
                                key={slot.time}
                                className={`text-xs p-2 rounded text-center ${
                                  slot.available
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {slot.time}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Bookings */}
                        {selectedEvent.requests.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                              Bookings ({selectedEvent.requests.length})
                            </h4>
                            <div className="space-y-2">
                              {selectedEvent.requests.map(request => (
                                <div
                                  key={request.request_id}
                                  className="p-3 bg-white rounded-lg border"
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <Badge className={getEventColor(request.status)}>
                                          {request.status.replace('_', ' ')}
                                        </Badge>
                                        <span className="text-sm font-medium">{request.preferred_time}</span>
                                      </div>
                                      <p className="text-sm text-gray-600">{request.job_address}</p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {request.total_cost?.toLocaleString()} FCFA
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

