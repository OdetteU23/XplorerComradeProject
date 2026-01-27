import { Link, Outlet } from "react-router-dom";

//Main app wrapper with routing links

const Layout = () => {
  return (
    <div>
      <nav>
        <ul>
          {/* HomeView link */}
          <li>
            <Link to= "/">Home</Link>
          </li>

          {/* ProfileView link */}

          <li>
            <Link to= "/ProfileView">Profile</Link>
          </li>

          {/* UploadView link */}
          <li>
            <Link to= "/UploadView">Upload</Link>
          </li>
          {/* MessagesView link */}
          <li>
            <Link to= "/MessagesView">Messages</Link>
          </li>
          {/* Register & loginView link */}
          <li>
            <Link to= "/Register&LoginView">Register / Login</Link>
          </li>
          {/* TravelPlansView link */}
          <li>
            <Link to= "/TravelPlansView">Travel Plans</Link>
          </li>
          {/* UploadView link  */}
          <li>
            <Link to= "/UploadView">Upload</Link>
          </li>
        </ul>
      </nav>
      <main>
        <Outlet />
      </main>

      </div>
  );
}

export default Layout;
