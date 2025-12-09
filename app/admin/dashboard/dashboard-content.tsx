'use client';

import { Calendar, Users, DollarSign, Star, Clock, CheckCircle2 } from 'lucide-react';
import { JWTPayload } from '@/lib/jwt';
import { memo } from 'react';

interface DashboardContentProps {
  user: JWTPayload;
}

// Memoize stats data to prevent re-renders
const stats = [
  {
    name: 'Total Appointments',
    value: '234',
    change: '+12.5%',
    icon: Calendar,
    color: 'purple'
  },
  {
    name: 'Active Clients',
    value: '1,543',
    change: '+8.2%',
    icon: Users,
    color: 'indigo'
  },
  {
    name: 'Monthly Revenue',
    value: '$45,678',
    change: '+23.1%',
    icon: DollarSign,
    color: 'violet'
  },
  {
    name: 'Avg Rating',
    value: '4.9',
    change: '+0.3',
    icon: Star,
    color: 'purple'
  },
];

const appointments = [
  {
    id: 1,
    client: 'Sarah Johnson',
    service: 'Hair Color & Highlights',
    time: '9:00 AM',
    duration: '2h',
    staff: 'Emma Wilson',
    status: 'confirmed'
  },
  {
    id: 2,
    client: 'Maria Garcia',
    service: 'Manicure & Pedicure',
    time: '10:30 AM',
    duration: '1.5h',
    staff: 'Olivia Brown',
    status: 'in-progress'
  },
  {
    id: 3,
    client: 'Jennifer Lee',
    service: 'Facial Treatment',
    time: '12:00 PM',
    duration: '1h',
    staff: 'Sophia Davis',
    status: 'confirmed'
  },
  {
    id: 4,
    client: 'Amanda Taylor',
    service: 'Hair Cut & Style',
    time: '2:00 PM',
    duration: '1h',
    staff: 'Emma Wilson',
    status: 'pending'
  },
  {
    id: 5,
    client: 'Lisa Anderson',
    service: 'Hair Extensions',
    time: '3:30 PM',
    duration: '3h',
    staff: 'Isabella Martinez',
    status: 'confirmed'
  },
];

const tasks = [
  { id: 1, task: 'Order new hair products inventory', priority: 'high', checked: false },
  { id: 2, task: 'Confirm tomorrow\'s appointments', priority: 'high', checked: false },
  { id: 3, task: 'Review client feedback forms', priority: 'medium', checked: false },
  { id: 4, task: 'Update service price list', priority: 'low', checked: true },
];

function DashboardContent({ user }: DashboardContentProps) {

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold mb-1 sm:mb-1.5">Welcome back, {user.name}! 👋</h2>
        <p className="text-xs sm:text-sm md:text-base text-purple-100 leading-relaxed">Here&apos;s what&apos;s happening with your salon today.</p>
      </div>

      {/* Stats Grid - Mobile First Design */}
      <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 md:p-6 hover:shadow-lg hover:border-purple-200 transition-all duration-300 active:scale-[0.98] cursor-pointer group min-h-[120px] sm:min-h-[140px]"
            >
              <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate mb-1 sm:mb-1.5 leading-tight">{stat.name}</p>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tabular-nums leading-none">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-${stat.color}-100 to-${stat.color}-200 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                  <Icon className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-${stat.color}-600`} />
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm sm:text-base font-semibold text-green-600 tabular-nums">{stat.change}</span>
                <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">vs last month</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
        {/* Today's Schedule */}
        <div className="xl:col-span-2 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 md:p-6 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4 sm:mb-5 md:mb-6">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">Today&apos;s Schedule</h2>
            <button className="text-xs sm:text-sm text-purple-600 hover:text-purple-700 active:text-purple-800 font-semibold hover:underline transition-colors duration-200 min-h-[44px] sm:min-h-0 flex items-center">
              View All
            </button>
          </div>
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 md:p-5 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50/30 hover:shadow-sm transition-all duration-200 active:scale-[0.99] cursor-pointer"
              >
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md flex-shrink-0">
                    {appointment.client.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 truncate mb-0.5">{appointment.client}</p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{appointment.service}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 ml-14 sm:ml-0">
                  <div className="text-left sm:text-right">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700 font-medium mb-1">
                      <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span>{appointment.time}</span>
                      <span className="text-gray-400">•</span>
                      <span>{appointment.duration}</span>
                    </div>
                    <p className="text-xs text-gray-500">{appointment.staff}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <span
                      className={`inline-flex items-center px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                        appointment.status === 'confirmed'
                          ? 'bg-green-100 text-green-700'
                          : appointment.status === 'in-progress'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {appointment.status === 'in-progress' ? 'In Progress' : appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks & Reminders */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 md:p-6 hover:shadow-md transition-shadow duration-300">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-4 sm:mb-5 md:mb-6">Tasks & Reminders</h2>
          <div className="space-y-2 sm:space-y-2.5 md:space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-2.5 sm:gap-3 p-3 sm:p-3.5 md:p-4 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors duration-200 cursor-pointer min-h-[56px] sm:min-h-0"
              >
                <input
                  type="checkbox"
                  defaultChecked={task.checked}
                  className="w-5 h-5 sm:w-5 sm:h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 mt-0.5 flex-shrink-0 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs sm:text-sm md:text-base leading-relaxed ${task.checked ? 'line-through text-gray-400' : 'text-gray-700 font-medium'}`}>
                    {task.task}
                  </p>
                  <span
                    className={`inline-block mt-1.5 sm:mt-2 text-xs px-2.5 py-1 rounded-full font-medium ${
                      task.priority === 'high'
                        ? 'bg-red-100 text-red-700'
                        : task.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-3 sm:mt-4 text-xs sm:text-sm md:text-base text-purple-600 hover:text-purple-700 active:text-purple-800 font-semibold py-3 sm:py-3.5 border-2 border-purple-200 rounded-xl hover:bg-purple-50 active:bg-purple-100 hover:border-purple-300 transition-all duration-200 active:scale-[0.99] min-h-[48px]">
            + Add New Task
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 md:p-6 hover:shadow-md transition-shadow duration-300">
        <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-4 sm:mb-5 md:mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 md:gap-4">
          <button className="flex flex-col items-center gap-2 sm:gap-2.5 md:gap-3 p-3 sm:p-4 md:p-5 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 hover:shadow-md transition-all duration-200 active:scale-95 min-h-[100px] sm:min-h-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-purple-600 rounded-xl shadow-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-gray-900 text-center leading-tight">New Booking</span>
          </button>
          <button className="flex flex-col items-center gap-2 sm:gap-2.5 md:gap-3 p-3 sm:p-4 md:p-5 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 hover:shadow-md transition-all duration-200 active:scale-95 min-h-[100px] sm:min-h-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-indigo-600 rounded-xl shadow-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-gray-900 text-center leading-tight">Add Client</span>
          </button>
          <button className="flex flex-col items-center gap-2 sm:gap-2.5 md:gap-3 p-3 sm:p-4 md:p-5 rounded-xl bg-gradient-to-br from-violet-50 to-violet-100 hover:from-violet-100 hover:to-violet-200 hover:shadow-md transition-all duration-200 active:scale-95 min-h-[100px] sm:min-h-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-violet-600 rounded-xl shadow-lg flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-gray-900 text-center leading-tight">Reports</span>
          </button>
          <button className="flex flex-col items-center gap-2 sm:gap-2.5 md:gap-3 p-3 sm:p-4 md:p-5 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 hover:shadow-md transition-all duration-200 active:scale-95 min-h-[100px] sm:min-h-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-purple-600 rounded-xl shadow-lg flex items-center justify-center flex-shrink-0">
              <Star className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-gray-900 text-center leading-tight">Services</span>
          </button>
          <button className="flex flex-col items-center gap-2 sm:gap-2.5 md:gap-3 p-3 sm:p-4 md:p-5 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 hover:shadow-md transition-all duration-200 active:scale-95 min-h-[100px] sm:min-h-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-indigo-600 rounded-xl shadow-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-gray-900 text-center leading-tight">Staff</span>
          </button>
          <button className="flex flex-col items-center gap-2 sm:gap-2.5 md:gap-3 p-3 sm:p-4 md:p-5 rounded-xl bg-gradient-to-br from-violet-50 to-violet-100 hover:from-violet-100 hover:to-violet-200 hover:shadow-md transition-all duration-200 active:scale-95 min-h-[100px] sm:min-h-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-violet-600 rounded-xl shadow-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-gray-900 text-center leading-tight">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Export memoized component for better performance
export default memo(DashboardContent);