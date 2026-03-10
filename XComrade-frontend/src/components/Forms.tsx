import { useState } from 'react';
import { CiSearch } from "react-icons/ci";

/* Form Components:
- SearchBar --> Search functionality
- FilterBar --> Filter posts/plans by criteria
  (Login & Register forms live in Login&RegisterForms.tsx)
*/

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
      <button type="submit"> <CiSearch/> </button>
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

export { SearchBar, FilterBar };
