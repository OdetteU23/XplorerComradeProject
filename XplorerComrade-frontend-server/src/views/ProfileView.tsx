const ProfileView = () => {
  return (
    <>
      <h2>Profile View</h2>
      <p>Welcome to your profile!
        Explore your personal data.
        (Content coming here:
        {/* -->  User profile display
          (userProfile, user's posts, followers/following)
        */}
         )
      </p>
    </>
  );
};
const FollowingView = () => {
  return (
    <>
      <h2>Following View</h2>
      <p>
        Content coming here:
        {/* -->  List of following/followers (seuranta)
        */}
      </p>
    </>
  );
};
const BuddyRequestsView = () => {
  return (
    <>
      <h2>Buddy Requests View</h2>
      <p>
        Content coming here:
        {/* -->  Manage travel buddy requests
        (friendRequest)
        --> to be combined with NotificationsView?
        */}
      </p>
    </>
  );
};
const MyTripsView = () => {
  return (
    <>
      <h2>My Trips View</h2>
      <p>
        Content coming here:
        {/* -->  User's own travel plans
        - to be combined with ProfileView/TravelPlansView?
        - (matkaAikeet) */}
      </p>
    </>
  );
};
export { FollowingView, ProfileView, BuddyRequestsView, MyTripsView };
