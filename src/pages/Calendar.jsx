import React, { useState, useEffect } from "react";
import { Order, Baker } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight,
  Cake,
  Calendar as CalendarIcon,
  AlertTriangle,
  Grid3X3,
  LayoutList
} from "lucide-react";
import { 
  format, 
  startOfWeek, 
  addDays, 
  isSameDay, 
  isToday,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addWeeks,
  addMonths,
  subWeeks,
  subMonths,
  isSameMonth
} from "date-fns";

export default function CalendarPage() {
  const [orders, setOrders] = useState([]);
  const [baker, setBaker] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCalendarData();
  }, []);

  const loadCalendarData = async () => {
    try {
      const [ordersData, bakerData] = await Promise.all([
        Order.list('-created_date', 100),
        Baker.list().then(data => data[0] || null)
      ]);
      setOrders(ordersData);
      setBaker(bakerData);
    } catch (error) {
      console.error('Error loading calendar data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const maxOrdersPerDay = baker?.max_orders_per_day || 3;

  // Weekly view calculations
  const weekStart = startOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Monthly view calculations
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Pad the month view to show complete weeks
  const monthStartWeek = startOfWeek(monthStart);
  const monthEndWeek = addDays(startOfWeek(endOfMonth(currentDate)), 6);
  const fullMonthDays = eachDayOfInterval({ start: monthStartWeek, end: monthEndWeek });

  const ordersByDay = (day) => {
    return orders.filter(order => 
      order.event_date && isSameDay(new Date(order.event_date), day)
    );
  };

  const getDayCapacityColor = (day) => {
    const count = ordersByDay(day).length;
    if (count >= maxOrdersPerDay) return 'bg-red-100 border-red-300 text-red-800';
    if (count >= maxOrdersPerDay * 0.7) return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    return 'bg-green-100 border-green-300 text-green-800';
  };

  const navigatePrevious = () => {
    if (viewMode === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const navigateNext = () => {
    if (viewMode === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse bg-white rounded-xl h-96 border border-amber-200"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 bg-gradient-to-br from-orange-50 to-amber-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-amber-900">Order Calendar</h1>
          <p className="text-amber-700 mt-1">
            {viewMode === 'week' ? 'Weekly' : 'Monthly'} view of your cake orders and capacity
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          {/* View Mode Toggle */}
          <div className="flex bg-white rounded-lg border border-amber-200 p-1 w-full sm:w-auto">
            <Button
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('week')}
              className={`w-1/2 sm:w-auto ${viewMode === 'week' ? 'bg-amber-500 text-white' : 'text-amber-700'}`}
            >
              <LayoutList className="h-4 w-4 mr-2" />
              Week
            </Button>
            <Button
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('month')}
              className={`w-1/2 sm:w-auto ${viewMode === 'month' ? 'bg-amber-500 text-white' : 'text-amber-700'}`}
            >
              <Grid3X3 className="h-4 w-4 mr-2" />
              Month
            </Button>
          </div>
          
          {/* Navigation Controls */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="icon" onClick={navigatePrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="w-full" onClick={goToToday}>
              {viewMode === 'week' ? 'This Week' : 'This Month'}
            </Button>
            <Button variant="outline" size="icon" onClick={navigateNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Card className="bg-white/80 backdrop-blur-sm border-amber-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-center text-amber-900">
            {viewMode === 'week' 
              ? `Week of ${format(weekStart, 'MMM d, yyyy')}` 
              : format(currentDate, 'MMMM yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {viewMode === 'week' ? (
            <div className="overflow-x-auto">
              <div className="grid grid-cols-7 min-w-[700px] md:min-w-full">
                {/* Weekday Headers */}
                {weekDays.map(day => (
                  <div key={day.toString()} className="text-center p-2 font-semibold text-amber-800 border-b border-amber-200">
                    <p className="text-sm">{format(day, 'EEE')}</p>
                    <p className="text-lg">{format(day, 'd')}</p>
                  </div>
                ))}
                
                {/* Day Cells */}
                {weekDays.map((day, index) => (
                  <div 
                    key={index} 
                    className={`
                      p-2 border-r border-amber-200 last:border-r-0
                      h-64 flex flex-col
                      ${isToday(day) ? 'bg-gradient-to-br from-amber-100 to-orange-100' : 'bg-white'}
                    `}
                  >
                    <div className="flex-1 overflow-y-auto space-y-2 -mr-2 pr-2">
                      {ordersByDay(day).map(order => (
                        <div key={order.id} className="p-2 rounded-lg bg-white/80 border border-amber-200 shadow-sm">
                          <p className="text-xs font-semibold text-amber-800 truncate">{order.cake_description}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-2 mt-auto">
                      <div className={`w-full h-2 rounded-full ${getDayCapacityColor(day).split(' ')[0]}`}></div>
                      <p className="text-xs text-center text-amber-600 mt-1">
                        {ordersByDay(day).length} / {maxOrdersPerDay}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Monthly View */
            <div className="space-y-4">
              {/* Month Headers */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs sm:text-base">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 font-semibold text-amber-800 bg-amber-100 rounded-lg">
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{day.charAt(0)}</span>
                  </div>
                ))}
              </div>
              
              {/* Month Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {fullMonthDays.map((day, index) => {
                  const dayOrders = ordersByDay(day);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  
                  return (
                    <div 
                      key={index} 
                      className={`min-h-[100px] p-2 border border-amber-200 rounded-lg ${
                        isCurrentMonth 
                          ? isToday(day) 
                            ? 'bg-gradient-to-br from-amber-100 to-orange-100' 
                            : 'bg-white'
                          : 'bg-gray-50 opacity-50'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-sm font-semibold ${
                          isCurrentMonth 
                            ? isToday(day) ? 'text-orange-600' : 'text-amber-900'
                            : 'text-gray-400'
                        }`}>
                          {format(day, 'd')}
                        </span>
                        {isCurrentMonth && dayOrders.length > 0 && (
                          <Badge 
                            className={`text-xs px-2 py-0.5 ${getDayCapacityColor(day)}`}
                          >
                            {dayOrders.length}
                          </Badge>
                        )}
                      </div>
                      
                      {isCurrentMonth && (
                        <>
                          <div className="space-y-1 mb-2">
                            {dayOrders.slice(0, 2).map(order => (
                              <div key={order.id} className="text-xs p-1 bg-amber-100 rounded truncate">
                                {order.cake_description}
                              </div>
                            ))}
                            {dayOrders.length > 2 && (
                              <div className="text-xs text-amber-600 font-medium">
                                +{dayOrders.length - 2} more
                              </div>
                            )}
                          </div>
                          
                          <div className={`w-full h-1 rounded-full ${getDayCapacityColor(day).split(' ')[0]}`}></div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="bg-white/80 backdrop-blur-sm border-amber-200 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
              <span className="text-sm text-amber-700">Available Capacity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
              <span className="text-sm text-amber-700">Near Capacity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
              <span className="text-sm text-amber-700">At/Over Capacity</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}