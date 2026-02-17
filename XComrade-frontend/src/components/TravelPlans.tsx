import type { matkaAikeet, friendRequest, tripParticipants, userProfile } from '@xcomrade/types-server';
import { useState } from 'react';
/*
  - TravelPlanCard --> Single travel plan display (matkaAikeet)
  - TravelPlanList --> List of travel plans
  - TravelPlanForm --> Create/edit travel plan
  - BuddyRequestCard --> Travel buddy request item (friendRequest)
  - ParticipantsList --> Trip participants display (tripParticipants)
  - ActivityChips --> Display list of activities
*/

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
  return (
    <div className="travel-plan-card">
      {plan.user && (
        <div className="plan-creator">
          <img
            src={plan.user.profile_picture_url || '/default-avatar.png'}
            alt={plan.user.käyttäjäTunnus}
          />
          <span>{plan.user.etunimi} {plan.user.sukunimi}</span>
        </div>
      )}

      <div className="plan-content">
        <h3>🌍 {plan.kohde}</h3>
        <p className="plan-dates">
          📅 {new Date(plan.suunniteltu_alku_pvm).toLocaleDateString()} - {new Date(plan.suunniteltu_loppu_pvm).toLocaleDateString()}
        </p>
        {plan.kuvaus && <p className="plan-description">{plan.kuvaus}</p>}

        <ActivityChips activities={plan.aktiviteetit} />

        {plan.budjetti && plan.budjetti.length > 0 && (
          <div className="plan-budget">
            <strong>Budget:</strong> {plan.budjetti.join(', ')}
          </div>
        )}

        {plan.participantsCount !== undefined && (
          <p className="participants-count">👥 {plan.participantsCount} participant(s)</p>
        )}
      </div>

      <div className="plan-actions">
        <button onClick={() => onViewDetails?.(plan.id)}>View Details</button>
        <button onClick={() => onRequestJoin?.(plan.id)}>Request to Join</button>
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
    <div className="travel-plan-list">
      <h2>Travel Plans</h2>
      {plans.length === 0 ? (
        <p className="empty-message">No travel plans available</p>
      ) : (
        plans.map((plan) => (
          <TravelPlanCard
            key={plan.id}
            plan={plan}
            onRequestJoin={onRequestJoin}
            onViewDetails={onViewDetails}
          />
        ))
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
        src={request.requester.profile_picture_url || '/default-avatar.png'}
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
              src={participant.user.profile_picture_url || '/default-avatar.png'}
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
