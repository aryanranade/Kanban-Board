export default function SearchBar({ value, onChange }) {
    return (
        <div className="search-bar">
            <span className="search-bar__icon">🔍</span>
            <input
                className="search-bar__input"
                type="text"
                placeholder="Search tasks…"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                id="search-input"
                aria-label="Search tasks"
            />
        </div>
    );
}
