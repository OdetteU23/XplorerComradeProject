import type { matkaAikeet, friendRequest, tripParticipants, userProfile } from '@xcomrade/types-server';
import type { TravelPlanWithUser, ParticipantWithUser, BuddyRequestWithUser } from '../../utilHelpers/types/localTypes';
import { useState, useEffect } from 'react';
import { TravelPlanList, TravelPlanForm, ParticipantsList, BuddyRequestCard } from '../components/TravelPlans';
import { SearchBar, FilterBar } from '../components/Forms';
import { api } from '../../utilHelpers/FetchingData';
import { GiWorld } from "react-icons/gi";
import { FaCalendarAlt } from 'react-icons/fa';

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

const TravelPlansView = () => {
  const [travelPlans, setTravelPlans] = useState<TravelPlanWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTravelPlans();
  }, []);

  const loadTravelPlans = async () => {
    try {
      setIsLoading(true);
      const plans = await api.travelPlan.getTravelPlans();
      setTravelPlans(plans as unknown as TravelPlanWithUser[]);
    } catch (err) {
      console.error('Load travel plans error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePlan = async (planData: Partial<matkaAikeet>) => {
    try {
      const newPlan = await api.travelPlan.createTravelPlan(planData as any);
      setTravelPlans([newPlan as unknown as TravelPlanWithUser, ...travelPlans]);
      setShowCreateForm(false);
      alert('Travel plan created successfully!');
    } catch (err) {
      console.error('Create travel plan error:', err);
      alert('Failed to create travel plan');
    }
  };

  const handleRequestJoin = async (planId: number) => {
    try {
      await api.buddyRequest.sendBuddyRequest(planId, 'Request to join this trip.');
      alert('Join request sent successfully!');
    } catch (err) {
      console.error('Request join error:', err);
      alert('Failed to send join request');
    }
  };

  const handleViewDetails = (planId: number) => {
    console.log('View plan details:', planId);
    // TODO: Navigate to plan detail view
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      loadTravelPlans();
      return;
    }

    try {
      const results = await api.travelPlan.searchTravelPlans(query);
      setTravelPlans(results as unknown as TravelPlanWithUser[]);
    } catch (err) {
      console.error('Search travel plans error:', err);
    }
  };

  const handleFilter = (filters: any) => {
    console.log('Applying filters:', filters);
    // TODO: Apply filters to travel plans (may need backend support)
  };

  return (
    <div className="travel-plans-view">
      <div className="travel-plans-header">
        <h2>Discover Travel Plans <GiWorld /></h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="create-plan-btn"
        >
          {showCreateForm ? 'Cancel' : '+ Create New Plan'}
        </button>
      </div>

      {showCreateForm && (
        <div className="create-plan-section">
          <TravelPlanForm onSubmit={handleCreatePlan} />
        </div>
      )}

      <div className="search-filter-section">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search destinations..."
        />
        <FilterBar onFilter={handleFilter} />
      </div>

      {isLoading ? (
        <p>Loading travel plans...</p>
      ) : travelPlans.length === 0 ? (
        <div className="empty-state">
          <p>No travel plans available yet.</p>
          <p>Be the first to create one!</p>
        </div>
      ) : (
        <TravelPlanList
          plans={travelPlans}
          onRequestJoin={handleRequestJoin}
          onViewDetails={handleViewDetails}
        />
      )}
    </div>
  );
};

const TravelPlanDetailView = () => {
  const [plan, setPlan] = useState<TravelPlanWithUser | null>(null);
  const [participants, setParticipants] = useState<ParticipantWithUser[]>([]);
  const [requests, setRequests] = useState<BuddyRequestWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner] = useState(false); // TODO: Determine from auth and plan data
  const [planId] = useState(1); // TODO: Get from route params

  useEffect(() => {
    loadPlanDetails();
  }, [planId]);

  const loadPlanDetails = async () => {
    try {
      setIsLoading(true);
      const [planData, participantsList] = await Promise.all([
        api.travelPlan.getTravelPlan(planId),
        api.participant.getParticipants(planId),
      ]);
      setPlan(planData as unknown as TravelPlanWithUser);
      setParticipants(participantsList as unknown as ParticipantWithUser[]);

      // If owner, load buddy requests
      if (isOwner) {
        const reqs = await api.buddyRequest.getBuddyRequests();
        // Filter for this plan
        setRequests(reqs as unknown as BuddyRequestWithUser[]);
      }
    } catch (err) {
      console.error('Load plan details error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: number) => {
    try {
      await api.buddyRequest.acceptBuddyRequest(requestId);
      setRequests(requests.filter(r => r.id !== requestId));
      // Reload participants
      const updatedParticipants = await api.participant.getParticipants(planId);
      setParticipants(updatedParticipants as unknown as ParticipantWithUser[]);
      alert('Request accepted!');
    } catch (err) {
      console.error('Accept request error:', err);
      alert('Failed to accept request');
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    try {
      await api.buddyRequest.rejectBuddyRequest(requestId);
      setRequests(requests.filter(r => r.id !== requestId));
    } catch (err) {
      console.error('Reject request error:', err);
      alert('Failed to reject request');
    }
  };

  const handleRequestToJoin = async () => {
    try {
      await api.buddyRequest.sendBuddyRequest(planId, 'Request to join this trip.');
      alert('Join request sent successfully!');
    } catch (err) {
      console.error('Request to join error:', err);
      alert('Failed to send join request');
    }
  };

  if (isLoading) {
    return (
      <div className="travel-plan-detail-view">
        <p>Loading travel plan...</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="travel-plan-detail-view">
        <h2>Travel Plan Not Found</h2>
        <p>The travel plan you're looking for doesn't exist.</p>
        <button onClick={() => window.history.back()}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="travel-plan-detail-view">
      <button onClick={() => window.history.back()} className="back-btn">
        ← Back to Travel Plans
      </button>

      <div className="plan-detail-header">
        <h1><GiWorld /> {plan.kohde}</h1>
        <div className="plan-dates">
          <FaCalendarAlt /> {new Date(plan.suunniteltu_alku_pvm).toLocaleDateString()} - {new Date(plan.suunniteltu_loppu_pvm).toLocaleDateString()}
        </div>
      </div>

      {plan.user && (
        <div className="plan-creator-info">
          <img
            src={plan.user.profile_picture_url || DEFAULT_AVATAR}
            alt={plan.user.käyttäjäTunnus}
          />
          <div>
            <h3>Organized by</h3>
            <p>{plan.user.etunimi} {plan.user.sukunimi}</p>
          </div>
        </div>
      )}

      <div className="plan-description">
        <h3>About this trip</h3>
        <p>{plan.kuvaus || 'No description provided.'}</p>
      </div>

      <div className="plan-activities">
        <h3>Activities</h3>
        <div className="activity-chips">
          {toArray(plan.aktiviteetit).map((activity, index) => (
            <span key={index} className="activity-chip">{activity}</span>
          ))}
        </div>
      </div>

      {(() => {
        const budgetArr = toArray(plan.budjetti);
        return budgetArr.length > 0 ? (
          <div className="plan-budget">
            <h3>Budget</h3>
            <p>{budgetArr.join(', ')}</p>
          </div>
        ) : null;
      })()}

      <ParticipantsList participants={participants} />

      {!isOwner && (
        <div className="join-section">
          <button onClick={handleRequestToJoin} className="join-btn">
            Request to Join This Trip
          </button>
        </div>
      )}

      {isOwner && requests.length > 0 && (
        <div className="pending-requests-section">
          <h3>Pending Buddy Requests ({requests.length})</h3>
          {requests.map((request) => (
            <BuddyRequestCard
              key={request.id}
              request={request}
              onAccept={handleAcceptRequest}
              onReject={handleRejectRequest}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export { TravelPlansView, TravelPlanDetailView };
