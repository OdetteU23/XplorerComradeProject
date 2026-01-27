const HomeView = () => {
  return (
    <>
      <h2>Home View</h2>
      <p>Welcome to XplorerComrade!
        Explore the world with us.
        (Content coming here:
        {/*-->Feed of posts kuten:*/}
         -julkaisuja
         - julkaisuwithRelations)
      </p>
    </>
  );
};

const SearchView = () => {
  return (
    <>
      <h2>Search View</h2>
      <p>
        Content coming here:
        {/* --> Discover users and destinations (userProfile, julkaisu) */}
      </p>
    </>
  );
};
const ExploreView = () => {
  return (
    <>
      <h2>Explore View</h2>
      <p>
        Content coming here:
        {/* --> Trending posts and destinations (trendingPosts, popularDestinations) */}
      </p>
    </>
  );
};

const SettingsView = () => {
  return (
    <>
      <h2>Settings View</h2>
      <p>
        Content coming here:
        {/* --> User account settings (userProfile updates) */}
      </p>
    </>
  );
}

export {HomeView, SearchView, ExploreView, SettingsView };
