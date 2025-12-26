import "../components/search.css";

const SearchScreen = () => {
  return (
    
    
    <div className="search-page">

      {/* Background Image */}
      <div className="bg-image"></div>

      {/* Foreground Content */}
      <div className="content">

        {/* Top Right Buttons */}
        <div className="top-right">
          <button className="nav-btn">Dashboard</button>
          <button className="nav-btn">Account</button>
        </div>

        {/* Center Content */}
        <div className="center-content">
          <input
            type="text"
            placeholder="Paste your link here..."
            className="link-input"
          />
          <button className="search-btn">Search</button>
        </div>

      </div>
    </div>
        
  );
};

export default SearchScreen;
