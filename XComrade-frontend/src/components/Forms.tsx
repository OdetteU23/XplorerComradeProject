import { loginInfo, registeringInfo } from '@xcomrade/types-server';
import { useState } from 'react';

/* Form Components:
- LoginForm --> Login form (loginInfo)
- RegisterForm --> Registration form (registeringInfo)
- SearchBar --> Search functionality
- FilterBar --> Filter posts/plans by criteria
- DateRangePicker --> Select travel dates
*/

interface LoginFormProps {
  onSubmit: (credentials: loginInfo) => void;
  isLoading?: boolean;
}

const LoginForm = ({ onSubmit, isLoading }: LoginFormProps) => {
  const [credentials, setCredentials] = useState<loginInfo>({
    käyttäjäTunnus: '',
    salasana: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(credentials);
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <h2>Login to XplorerComrade</h2>
      <div className="form-group">
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          value={credentials.käyttäjäTunnus}
          onChange={(e) => setCredentials({ ...credentials, käyttäjäTunnus: e.target.value })}
          required
          placeholder="Enter your username"
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={credentials.salasana}
          onChange={(e) => setCredentials({ ...credentials, salasana: e.target.value })}
          required
          placeholder="Enter your password"
        />
      </div>
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

interface RegisterFormProps {
  onSubmit: (data: registeringInfo) => void;
  isLoading?: boolean;
}

const RegisterForm = ({ onSubmit, isLoading }: RegisterFormProps) => {
  const [formData, setFormData] = useState<registeringInfo>({
    käyttäjäTunnus: '',
    etunimi: '',
    sukunimi: '',
    sahkoposti: '',
    salasana: '',
    profile_picture_url: '',
    bio: '',
    location: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form className="register-form" onSubmit={handleSubmit}>
      <h2>Join XplorerComrade</h2>
      <div className="form-group">
        <label htmlFor="username">Username *</label>
        <input
          id="username"
          type="text"
          value={formData.käyttäjäTunnus}
          onChange={(e) => setFormData({ ...formData, käyttäjäTunnus: e.target.value })}
          required
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="firstname">First Name *</label>
          <input
            id="firstname"
            type="text"
            value={formData.etunimi}
            onChange={(e) => setFormData({ ...formData, etunimi: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="lastname">Last Name *</label>
          <input
            id="lastname"
            type="text"
            value={formData.sukunimi}
            onChange={(e) => setFormData({ ...formData, sukunimi: e.target.value })}
            required
          />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="email">Email *</label>
        <input
          id="email"
          type="email"
          value={formData.sahkoposti}
          onChange={(e) => setFormData({ ...formData, sahkoposti: e.target.value })}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">Password *</label>
        <input
          id="password"
          type="password"
          value={formData.salasana}
          onChange={(e) => setFormData({ ...formData, salasana: e.target.value })}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="location">Location</label>
        <input
          id="location"
          type="text"
          value={formData.location || ''}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="e.g., Helsinki, Finland"
        />
      </div>
      <div className="form-group">
        <label htmlFor="bio">Bio</label>
        <textarea
          id="bio"
          value={formData.bio || ''}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          placeholder="Tell us about yourself..."
        />
      </div>
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
};

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const SearchBar = ({ onSearch, placeholder = 'Search...' }: SearchBarProps) => {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form className="search-bar" onSubmit={handleSearch}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
      />
      <button type="submit">🔍</button>
    </form>
  );
};

interface FilterBarProps {
  onFilter: (filters: FilterOptions) => void;
}

interface FilterOptions {
  destination?: string;
  activities?: string[];
  dateRange?: { start?: Date; end?: Date };
}

const FilterBar = ({ onFilter }: FilterBarProps) => {
  const [filters, setFilters] = useState<FilterOptions>({});

  const handleApplyFilters = () => {
    onFilter(filters);
  };

  return (
    <div className="filter-bar">
      <input
        type="text"
        placeholder="Filter by destination"
        value={filters.destination || ''}
        onChange={(e) => setFilters({ ...filters, destination: e.target.value })}
      />
      <button onClick={handleApplyFilters}>Apply Filters</button>
    </div>
  );
};

interface DateRangePickerProps {
  onDateChange: (start: Date, end: Date) => void;
}

const DateRangePicker = ({ onDateChange }: DateRangePickerProps) => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const handleDateChange = () => {
    if (startDate && endDate) {
      onDateChange(new Date(startDate), new Date(endDate));
    }
  };

  return (
    <div className="date-range-picker">
      <input
        type="date"
        value={startDate}
        onChange={(e) => {
          setStartDate(e.target.value);
          handleDateChange();
        }}
      />
      <span>to</span>
      <input
        type="date"
        value={endDate}
        onChange={(e) => {
          setEndDate(e.target.value);
          handleDateChange();
        }}
      />
    </div>
  );
};

export { LoginForm, RegisterForm, SearchBar, FilterBar, DateRangePicker };
export default { LoginForm, RegisterForm, SearchBar, FilterBar, DateRangePicker };
