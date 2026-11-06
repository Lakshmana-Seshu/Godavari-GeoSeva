import React from 'react';
import {
  PhoneCall,
  ShieldAlert,
  HeartPulse,
  LifeBuoy,
  Users,
  Compass,
  AlertTriangle,
  Info,
  ExternalLink,
} from 'lucide-react';

export const EmergencyInfo = () => {
  const emergencyContacts = [
    {
      title: 'Pushkaralu Central Control Room',
      phone: '1077 / 0883-2442000',
      desc: '24/7 Apex Command Center for crowd control, sector guidance & lost pilgrims',
      badge: '24/7 Toll-Free',
      color: 'bg-teal-50 border-teal-200 text-teal-900',
      icon: PhoneCall,
    },
    {
      title: 'Disaster & River Rescue (NDRF / SDRF)',
      phone: '1070 / 112',
      desc: 'Emergency boat teams, deep-water diver rescue, and ghat barricade response',
      badge: 'Water Rescue',
      color: 'bg-blue-50 border-blue-200 text-blue-900',
      icon: LifeBuoy,
    },
    {
      title: 'Pushkaralu Medical Emergency Command',
      phone: '108 / 104',
      desc: 'Advanced Life Support (ALS) ambulances & riverbank first-aid trauma centers',
      badge: 'Medical Post',
      color: 'bg-rose-50 border-rose-200 text-rose-900',
      icon: HeartPulse,
    },
    {
      title: 'Police & Crowd Safety Helpdesk',
      phone: '100 / 0883-2442010',
      desc: 'Law enforcement, perimeter barricades, and security surveillance',
      badge: 'Police Desk',
      color: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: ShieldAlert,
    },
    {
      title: 'Lost Children & Senior Citizen Help Center',
      phone: '1098 / 0883-2442022',
      desc: 'RFID child identification wristband coordination and reuniting booth',
      badge: 'Pilgrim Care',
      color: 'bg-purple-50 border-purple-200 text-purple-900',
      icon: Users,
    },
    {
      title: 'Fire & Rescue Services',
      phone: '101',
      desc: 'Electrical safety, holding zone fire prevention, and emergency evacuation',
      badge: 'Fire Safety',
      color: 'bg-red-50 border-red-200 text-red-900',
      icon: AlertTriangle,
    },
  ];

  const safetyGuidelines = [
    'Always bathe within the designated safety iron barricades and floating bouy lines.',
    'Do not enter deep river waters outside authorized bathing ghat platforms.',
    'Obtain RFID wristbands for children and senior citizens at the holding area helpdesks.',
    'In case of heavy crowd pressure, follow designated green one-way pedestrian exit corridors.',
    'Drink water only from municipal certified RO distribution points to avoid waterborne ailments.',
    'Report unattended bags or suspicious items to the nearest pushkaralu volunteer or police booth.',
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold border border-rose-200">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          Godavari Pushkaralu 2027 Safety & Emergency Coordination
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Emergency Services & Helplines
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          Rapid-dial contacts for medical assistance, river rescue, disaster management, and lost-and-found support along the Godavari corridor.
        </p>
      </div>

      {/* Synthetic simulation notice */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
        <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="block font-semibold">Hackathon Demonstration Notice</strong>
          <span>
            The telephone numbers and facility allocations listed below are representative civic protocols modeled after Andhra Pradesh State Disaster Management Authority (APSDMA) and Rajamahendravaram Municipal Corporation standards for Pushkaralu 2027 operations.
          </span>
        </div>
      </div>

      {/* Emergency Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {emergencyContacts.map((contact, index) => {
          const Icon = contact.icon;
          return (
            <div
              key={index}
              className={`p-6 rounded-2xl border shadow-card flex flex-col justify-between space-y-4 ${contact.color}`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-white shadow-xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/80 border border-current">
                    {contact.badge}
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900">{contact.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{contact.desc}</p>
              </div>

              <div className="pt-3 border-t border-black/5 flex items-center justify-between">
                <span className="font-mono text-base font-bold text-slate-900">
                  {contact.phone}
                </span>
                <a
                  href={`tel:${contact.phone.split('/')[0].trim()}`}
                  className="px-3.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs"
                >
                  Dial Now
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* River Safety Guidelines */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-8 space-y-6">
        <div>
          <span className="text-xs font-bold text-teal-800 uppercase tracking-wider block mb-1">
            River Safety Protocol
          </span>
          <h2 className="text-xl font-bold text-slate-900">
            Godavari River Bathing Guidelines & Pilgrim Safety
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {safetyGuidelines.map((tip, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-3"
            >
              <span className="w-5 h-5 rounded-full bg-teal-800 text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="text-slate-700 leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
