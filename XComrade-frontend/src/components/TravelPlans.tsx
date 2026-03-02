import type { matkaAikeet, friendRequest, tripParticipants, userProfile } from '@xcomrade/types-server';
import { useState } from 'react';
import { FaCalendarAlt } from "react-icons/fa";
/*
  - TravelPlanCard --> Single travel plan display (matkaAikeet)
  - TravelPlanList --> List of travel plans
  - TravelPlanForm --> Create/edit travel plan
  - BuddyRequestCard --> Travel buddy request item (friendRequest)
  - ParticipantsList --> Trip participants display (tripParticipants)
  - ActivityChips --> Display list of activities
*/

/** Safely convert a value that may be a JSON string or already an array into a string[] */
const toArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return value.trim() ? [value] : [];
    }
  }
  return [];
};

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23555'/%3E%3Ccircle cx='50' cy='38' r='18' fill='%23888'/%3E%3Cellipse cx='50' cy='80' rx='30' ry='22' fill='%23888'/%3E%3C/svg%3E";

interface TravelPlanWithUser extends matkaAikeet {
  user?: Pick<userProfile, 'id' | 'käyttäjäTunnus' | 'etunimi' | 'sukunimi' | 'profile_picture_url'>;
  participantsCount?: number;
}

interface TravelPlanCardProps {
  plan: TravelPlanWithUser;
  onRequestJoin?: (planId: number) => void;
  onViewDetails?: (planId: number) => void;
}

const TravelPlanCard = ({ plan, onRequestJoin, onViewDetails }: TravelPlanCardProps) => {
  const startDate = new Date(plan.suunniteltu_alku_pvm).toLocaleDateString('fi-FI');
  const endDate = new Date(plan.suunniteltu_loppu_pvm).toLocaleDateString('fi-FI');
  const activities = toArray(plan.aktiviteetit);
  const budgetArr = toArray(plan.budjetti);

  return (
    <div
      className="group flex flex-col rounded-xl overflow-hidden
                 bg-white/10 backdrop-blur-sm border border-white/[0.08]
                 hover:border-white/20 hover:shadow-lg hover:-translate-y-0.5
                 transition-all cursor-pointer"
      onClick={() => onViewDetails?.(plan.id)}
    >
      {/* Destination header band */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-gradient-to-br from-indigo-600/30 to-purple-600/20 flex flex-col items-center justify-center p-4">
        {/* Creator profile at top-left */}
        {plan.user && (
          <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full pr-3 pl-1 py-1">
            <img
              src={plan.user.profile_picture_url || DEFAULT_AVATAR}
              alt={plan.user.käyttäjäTunnus}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="text-white text-xs font-medium">
              {plan.user.käyttäjäTunnus || plan.user.etunimi}
            </span>
          </div>
        )}
        <span className="text-4xl mb-2">🌍</span>
        <h3 className="text-white font-bold text-lg text-center leading-tight">{plan.kohde}</h3>
        <p className="text-white/60 text-xs mt-1 flex items-center gap-1">
          <FaCalendarAlt className="inline-block" /> {startDate} – {endDate}
        </p>
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-4 gap-1">
        {plan.kuvaus && (
          <p className="text-white/70 font-medium text-sm line-clamp-2">{plan.kuvaus}</p>
        )}

        {/* Info box */}
        <div className="mt-2 rounded-lg border border-white/10 bg-white/5 p-2.5 text-xs text-white/60 space-y-0.5">
          <p><span className="text-white/40">Destination:</span> {plan.kohde}</p>
          <p><span className="text-white/40">Dates:</span> {startDate} – {endDate}</p>
          {activities.length > 0 && (
            <p><span className="text-white/40">Activities:</span> {activities.join(', ')}</p>
          )}
          {budgetArr.length > 0 && (
            <p><span className="text-white/40">Budget:</span> {budgetArr.join(', ')}</p>
          )}
          {plan.participantsCount !== undefined && (
            <p><span className="text-white/40">Participants:</span> {plan.participantsCount}</p>
          )}
        </div>

        {/* Actions row */}
        <div className="flex items-center gap-3 mt-3 pt-2 border-t border-white/10">
          <button
            className="flex items-center gap-1 text-xs text-white/60 hover:text-blue-400 transition-colors bg-transparent border-none p-0 m-0 cursor-pointer"
            onClick={(e) => { e.stopPropagation(); onViewDetails?.(plan.id); }}
          >
            View Details
          </button>
          <button
            className="flex items-center gap-1 text-xs text-white/60 hover:text-green-400 transition-colors bg-transparent border-none p-0 m-0 cursor-pointer"
            onClick={(e) => { e.stopPropagation(); onRequestJoin?.(plan.id); }}
          >
            Request to Join
          </button>
          {plan.user && (
            <span className="ml-auto text-xs text-white/40">
              Created by: @{plan.user.käyttäjäTunnus || plan.user.etunimi}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

interface TravelPlanListProps {
  plans: TravelPlanWithUser[];
  onRequestJoin?: (planId: number) => void;
  onViewDetails?: (planId: number) => void;
}

const TravelPlanList = ({ plans, onRequestJoin, onViewDetails }: TravelPlanListProps) => {
  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-5">Travel Plans</h2>
      {plans.length === 0 ? (
        <p className="text-white/50">No travel plans available</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {plans.map((plan) => (
            <TravelPlanCard
              key={plan.id}
              plan={plan}
              onRequestJoin={onRequestJoin}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface TravelPlanFormProps {
  onSubmit: (plan: Partial<matkaAikeet>) => void;
  initialData?: Partial<matkaAikeet>;
  isLoading?: boolean;
}

const TravelPlanForm = ({ onSubmit, initialData, isLoading }: TravelPlanFormProps) => {
  const [formData, setFormData] = useState<Partial<matkaAikeet>>({
    kohde: initialData?.kohde || '',
    suunniteltu_alku_pvm: initialData?.suunniteltu_alku_pvm || new Date(),
    suunniteltu_loppu_pvm: initialData?.suunniteltu_loppu_pvm || new Date(),
    aktiviteetit: initialData?.aktiviteetit || [],
    budjetti: initialData?.budjetti || [],
    kuvaus: initialData?.kuvaus || '',
  });

  const [activityInput, setActivityInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addActivity = () => {
    if (activityInput.trim() && formData.aktiviteetit) {
      setFormData({
        ...formData,
        aktiviteetit: [...formData.aktiviteetit, activityInput.trim()]
      });
      setActivityInput('');
    }
  };

  return (
    <form className="travel-plan-form" onSubmit={handleSubmit}>
      <h2>{initialData ? 'Edit Travel Plan' : 'Create Travel Plan'}</h2>

      <div className="form-group">
        <label htmlFor="destination">Destination *</label>
        <input
          id="destination"
          type="text"
          value={formData.kohde}
          onChange={(e) => setFormData({ ...formData, kohde: e.target.value })}
          required
          placeholder="e.g., Paris, France"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="startDate">Start Date *</label>
          <input
            id="startDate"
            type="date"
            value={formData.suunniteltu_alku_pvm ? new Date(formData.suunniteltu_alku_pvm).toISOString().split('T')[0] : ''}
            onChange={(e) => setFormData({ ...formData, suunniteltu_alku_pvm: new Date(e.target.value) })}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="endDate">End Date *</label>
          <input
            id="endDate"
            type="date"
            value={formData.suunniteltu_loppu_pvm ? new Date(formData.suunniteltu_loppu_pvm).toISOString().split('T')[0] : ''}
            onChange={(e) => setFormData({ ...formData, suunniteltu_loppu_pvm: new Date(e.target.value) })}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={formData.kuvaus}
          onChange={(e) => setFormData({ ...formData, kuvaus: e.target.value })}
          placeholder="Describe your trip plans..."
        />
      </div>

      <div className="form-group">
        <label>Activities</label>
        <div className="activity-input">
          <input
            type="text"
            value={activityInput}
            onChange={(e) => setActivityInput(e.target.value)}
            placeholder="Add activity"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addActivity())}
          />
          <button type="button" onClick={addActivity}>Add</button>
        </div>
        <ActivityChips
          activities={formData.aktiviteetit || []}
          onRemove={(activity) => setFormData({
            ...formData,
            aktiviteetit: formData.aktiviteetit?.filter(a => a !== activity)
          })}
        />
      </div>

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : (initialData ? 'Update Plan' : 'Create Plan')}
      </button>
    </form>
  );
};

interface BuddyRequestWithUser extends friendRequest {
  requester: Pick<userProfile, 'id' | 'käyttäjäTunnus' | 'etunimi' | 'sukunimi' | 'profile_picture_url'>;
}

interface BuddyRequestCardProps {
  request: BuddyRequestWithUser;
  onAccept?: (requestId: number) => void;
  onReject?: (requestId: number) => void;
}

const BuddyRequestCard = ({ request, onAccept, onReject }: BuddyRequestCardProps) => {
  return (
    <div className="buddy-request-card">
      <img
        src={request.requester.profile_picture_url || DEFAULT_AVATAR}
        alt={request.requester.käyttäjäTunnus}
      />
      <div className="request-content">
        <h4>{request.requester.etunimi} {request.requester.sukunimi}</h4>
        <p className="request-message">{request.message}</p>
        <small>{new Date(request.createdAt).toLocaleString()}</small>
      </div>
      {request.status === 'pending' && (
        <div className="request-actions">
          <button onClick={() => onAccept?.(request.id)} className="accept-btn">Accept</button>
          <button onClick={() => onReject?.(request.id)} className="reject-btn">Reject</button>
        </div>
      )}
      {request.status !== 'pending' && (
        <span className={`status-badge ${request.status}`}>{request.status}</span>
      )}
    </div>
  );
};

interface ParticipantWithUser extends tripParticipants {
  user: Pick<userProfile, 'id' | 'käyttäjäTunnus' | 'etunimi' | 'sukunimi' | 'profile_picture_url'>;
}

interface ParticipantsListProps {
  participants: ParticipantWithUser[];
}

const ParticipantsList = ({ participants }: ParticipantsListProps) => {
  return (
    <div className="participants-list">
      <h3>Trip Participants ({participants.length})</h3>
      <div className="participants-container">
        {participants.map((participant) => (
          <div key={participant.id} className="participant-item">
            <img
              src={participant.user.profile_picture_url || DEFAULT_AVATAR}
              alt={participant.user.käyttäjäTunnus}
            />
            <div className="participant-info">
              <h4>{participant.user.etunimi} {participant.user.sukunimi}</h4>
              <p className="username">@{participant.user.käyttäjäTunnus}</p>
              <span className="role-badge">{participant.role}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface ActivityChipsProps {
  activities: string[];
  onRemove?: (activity: string) => void;
}

const ActivityChips = ({ activities, onRemove }: ActivityChipsProps) => {
  return (
    <div className="activity-chips">
      {activities.map((activity, index) => (
        <span key={index} className="activity-chip">
          {activity}
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(activity)}
              className="remove-chip"
            >
              ×
            </button>
          )}
        </span>
      ))}
    </div>
  );
};

export {
  TravelPlanCard,
  TravelPlanList,
  TravelPlanForm,
  BuddyRequestCard,
  ParticipantsList,
  ActivityChips
};
export default TravelPlanList;
