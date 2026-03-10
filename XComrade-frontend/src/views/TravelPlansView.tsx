import type { matkaAikeet } from '@xcomrade/types-server';
import type { TravelPlanWithUser } from '../../utilHelpers/types/localTypes';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { TravelPlanList, TravelPlanForm } from '../components/TravelPlans';
import { SearchBar, FilterBar } from '../components/Forms';
import { api } from '../../utilHelpers/FetchingData';
import { useKäyttäjä } from '../content/käyttänKontentti';
import { GiWorld } from "react-icons/gi";
import { FaCalendarAlt } from 'react-icons/fa';
import { RiArrowGoBackLine } from 'react-icons/ri';
import { DEFAULT_AVATAR, toArray } from '../../utilHelpers/constants';

const TravelPlansView = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useKäyttäjä();
  const [travelPlans, setTravelPlans] = useState<TravelPlanWithUser[]>([]);
  const [allTravelPlans, setAllTravelPlans] = useState<TravelPlanWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'published' | 'create'>('published');

  useEffect(() => {
    loadTravelPlans();
  }, []);

  const loadTravelPlans = async () => {
    try {
      setIsLoading(true);
      const plans = await api.travelPlan.getTravelPlans();
      const fetched = plans as unknown as TravelPlanWithUser[];
      setAllTravelPlans(fetched);
      setTravelPlans(fetched);
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
      setActiveTab('published');
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
    const plan = travelPlans.find(p => p.id === planId);
    navigate(`/travel-plans/${planId}`, { state: { plan } });
  };

  const handleSearch = async (query: string) => {
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

  const handleFilter = (filters: { destination?: string; activities?: string[]; dateRange?: { start?: Date; end?: Date } }) => {
    let filtered = allTravelPlans;

    if (filters.destination?.trim()) {
      const dest = filters.destination.toLowerCase();
      filtered = filtered.filter(p => p.kohde?.toLowerCase().includes(dest));
    }

    if (filters.activities && filters.activities.length > 0) {
      filtered = filtered.filter(p => {
        const planActivities = toArray(p.aktiviteetit).map(a => a.toLowerCase());
        return filters.activities!.some(a => planActivities.includes(a.toLowerCase()));
      });
    }

    if (filters.dateRange?.start) {
      filtered = filtered.filter(p => new Date(p.suunniteltu_alku_pvm) >= filters.dateRange!.start!);
    }
    if (filters.dateRange?.end) {
      filtered = filtered.filter(p => new Date(p.suunniteltu_loppu_pvm) <= filters.dateRange!.end!);
    }

    setTravelPlans(filtered);
  };

  return (
    <div>
      {/* Hero header */}
      <div className="max-w-7xl mx-auto w-full px-8 pt-16 pb-4 text-white text-center">
        <div className="flex justify-center mb-3">
          <GiWorld className="text-5xl drop-shadow-[0_2px_16px_rgba(0,0,0,0.5)]" />
        </div>
        <h1 className="text-5xl font-extrabold mb-2 tracking-tight drop-shadow-[0_2px_16px_rgba(0,0,0,0.5)]">
          Discover Travel Plans
        </h1>
        <p className="text-lg max-w-lg mx-auto text-white/90 mb-6 drop-shadow-[0_1px_10px_rgba(0,0,0,0.4)]">
          Find trips to join, or create your own and invite travel buddies.
        </p>

        {/* ---- Tabs ---- */}
        <div className="search-tabs">
          <button
            className={activeTab === 'published' ? 'active' : ''}
            onClick={() => setActiveTab('published')}
          >
            Published Plans
          </button>
          <button
            className={activeTab === 'create' ? 'active' : ''}
            onClick={() => setActiveTab('create')}
          >
            + Create New Plan
          </button>
        </div>
      </div>

      {/* ---- Tab content ---- */}
      {activeTab === 'create' ? (
        <div className="max-w-[1400px] mx-auto px-4 pb-8 pt-4">
          <TravelPlanForm onSubmit={handleCreatePlan} />
        </div>
      ) : (
        <>
          <div className="max-w-[1400px] mx-auto px-4 pb-2">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search destinations..."
            />
            <FilterBar onFilter={handleFilter} />
          </div>

          <div className="max-w-[1400px] mx-auto px-4 pb-8">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center min-h-[30vh] gap-4 text-gray-400">
                <div className="w-9 h-9 border-3 border-white/10 border-t-indigo-600 rounded-full animate-spin" />
                <p>Loading travel plans...</p>
              </div>
            ) : travelPlans.length === 0 ? (
              <div className="text-center py-12 px-8 bg-white/[0.04] border border-dashed border-white/15 rounded-2xl">
                <p className="text-white/70">No travel plans available yet.</p>
                <p className="text-white/50 text-sm">Be the first to create one!</p>
              </div>
            ) : (
              <TravelPlanList
                plans={travelPlans}
                currentUserId={currentUser?.id}
                onRequestJoin={handleRequestJoin}
                onViewDetails={handleViewDetails}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

const TravelPlanDetailView = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useKäyttäjä();
  const { state } = useLocation();

  const plan = (state as { plan?: TravelPlanWithUser } | null)?.plan ?? null;

  if (!plan) {
    return (
      <div className="p-4 text-center text-stone-300">
        <p>No travel plan to display.</p>
        <button onClick={() => navigate(-1)} className="mt-2 underline">Go back</button>
      </div>
    );
  }

  const startDate = new Date(plan.suunniteltu_alku_pvm).toLocaleDateString('fi-FI');
  const endDate = new Date(plan.suunniteltu_loppu_pvm).toLocaleDateString('fi-FI');
  const activities = toArray(plan.aktiviteetit);
  const budgetArr = toArray(plan.budjetti);

  return (
    <div className="min-h-screen bg-black/60 p-4">
      <button
        className="mb-4 flex items-center gap-1 text-stone-200 hover:text-white transition-colors"
        onClick={() => navigate(-1)}
      >
        <RiArrowGoBackLine /> Go back
      </button>

      <article className="mx-auto w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-md bg-stone-600 text-stone-50">

        {/* ---- Destination header ---- */}
        <div className="relative w-full bg-gradient-to-br from-indigo-600/40 to-purple-600/30 flex flex-col items-center justify-center p-8">
          <span className="text-5xl mb-3">🌍</span>
          <h1 className="text-3xl font-extrabold text-white text-center">{plan.kohde}</h1>
          <p className="text-white/60 text-sm mt-2 flex items-center gap-1">
            <FaCalendarAlt /> {startDate} – {endDate}
          </p>
        </div>

        {/* ---- Body ---- */}
        <div className="p-4">

          {/* Creator info */}
          {plan.user && (
            <div className="flex items-center gap-3 mb-4 py-3 border-b border-stone-500">
              <img
                src={plan.user.profile_picture_url || DEFAULT_AVATAR}
                alt={plan.user.käyttäjäTunnus}
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <p className="text-xs text-stone-400">Organized by</p>
                <p className="text-sm font-semibold">
                  {plan.user.etunimi} {plan.user.sukunimi}
                  <span className="text-stone-300 font-normal ml-1">@{plan.user.käyttäjäTunnus}</span>
                </p>
              </div>
            </div>
          )}

          {/* About */}
          <section className="mb-4">
            <h3 className="text-lg font-bold mb-1">About this trip</h3>
            <p className="text-stone-200">{plan.kuvaus || 'No description provided.'}</p>
          </section>

          {/* Activities */}
          {activities.length > 0 && (
            <section className="mb-4">
              <h3 className="text-lg font-bold mb-2">Activities</h3>
              <div className="flex flex-wrap gap-2">
                {activities.map((a, i) => (
                  <span key={i} className="px-3 py-1 rounded-full text-xs bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                    {a}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Budget */}
          {budgetArr.length > 0 && (
            <section className="mb-4">
              <h3 className="text-lg font-bold mb-1">Budget</h3>
              <p className="text-stone-200">{budgetArr.join(', ')}</p>
            </section>
          )}

          {/* Info box summary */}
          <div className="my-2 rounded-md border border-stone-400 p-2 text-sm">
            <p>
              <span className="text-stone-400">Destination:</span> {plan.kohde}
            </p>
            <p>
              <span className="text-stone-400">Dates:</span> {startDate} – {endDate}
            </p>
            {plan.participantsCount !== undefined && (
              <p>
                <span className="text-stone-400">Participants:</span> {plan.participantsCount}
              </p>
            )}
            {plan.user && (
              <p>
                <span className="text-stone-400">Created by:</span> @{plan.user.käyttäjäTunnus}
              </p>
            )}
          </div>

          {/* Request to join / own plan indicator */}
          {currentUser && plan.userId === currentUser.id ? (
            <div className="mt-4 block w-full rounded bg-white/10 p-2 text-center text-white/70 font-semibold">
              This is your published plan
            </div>
          ) : (
            <button
              className="mt-4 block w-full rounded bg-indigo-600 p-2 text-center text-white font-semibold transition-all duration-300 hover:bg-indigo-700"
              onClick={async () => {
                try {
                  await api.buddyRequest.sendBuddyRequest(plan.id, 'Request to join this trip.');
                  alert('Join request sent successfully!');
                } catch (err) {
                  console.error('Request join error:', err);
                  alert('Failed to send join request');
                }
              }}
            >
              Request to Join This Trip
            </button>
          )}
        </div>
      </article>
    </div>
  );
};

export { TravelPlansView, TravelPlanDetailView };
