import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaFileAlt,
  FaClipboardList,
  FaBuilding,
  FaCalculator,
  FaGavel,
  FaMoon,
  FaSun,
  FaTimes,
  FaArrowRight,
  FaShieldAlt,
  FaQuestionCircle,
} from "react-icons/fa";
import "./CommandPalette.css";

const QUICK_ACTIONS = [
  {
    id: "file-case",
    title: "File a New Grievance Docket",
    category: "Action",
    icon: FaFileAlt,
    path: "/register",
    keywords: "file register dispute complaint claim new",
  },
  {
    id: "track-case",
    title: "Track Case by Docket ID",
    category: "Action",
    icon: FaSearch,
    path: "/track",
    keywords: "track lookup find search case docket status",
  },
  {
    id: "my-cases",
    title: "My Grievances Dashboard",
    category: "Navigation",
    icon: FaClipboardList,
    path: "/my-complaints",
    keywords: "my complaints grievances dashboard cases history",
  },
  {
    id: "brands-matrix",
    title: "Brand Escalation Matrix & Leaderboard",
    category: "Navigation",
    icon: FaBuilding,
    path: "/leaderboard",
    keywords: "brands enterprise company leaderboard grievance officers nodal email amazon flipkart sbi",
  },
  {
    id: "class-action",
    title: "Collective Class Action Hub",
    category: "Navigation",
    icon: FaShieldAlt,
    path: "/class-actions",
    keywords: "class action collective petition group",
  },
  {
    id: "file-amazon",
    title: "File Dispute: Amazon India",
    category: "Quick File",
    icon: FaBuilding,
    path: "/register?company=Amazon%20India",
    keywords: "amazon refund return seller delivery",
  },
  {
    id: "file-flipkart",
    title: "File Dispute: Flipkart",
    category: "Quick File",
    icon: FaBuilding,
    path: "/register?company=Flipkart",
    keywords: "flipkart grocery defective electronics order",
  },
  {
    id: "file-sbi",
    title: "File Dispute: State Bank of India (SBI)",
    category: "Quick File",
    icon: FaBuilding,
    path: "/register?company=State%20Bank%20of%20India%20(SBI)",
    keywords: "sbi bank upi chargeback unauthorized transaction atm",
  },
  {
    id: "file-phonepe",
    title: "File Dispute: PhonePe / UPI",
    category: "Quick File",
    icon: FaBuilding,
    path: "/register?company=PhonePe%20(UPI%20%26%20Payments)",
    keywords: "phonepe upi transaction pending failed qr",
  },
  {
    id: "file-indigo",
    title: "File Dispute: IndiGo Airlines",
    category: "Quick File",
    icon: FaBuilding,
    path: "/register?company=IndiGo%20Airlines",
    keywords: "indigo flight delay cancellation lost baggage refund",
  },
  {
    id: "charter",
    title: "Citizen Redressal Charter",
    category: "Policy",
    icon: FaQuestionCircle,
    path: "/charter",
    keywords: "charter rights citizen consumer protection act 2019",
  },
  {
    id: "methodology",
    title: "Brand Benchmark Methodology",
    category: "Policy",
    icon: FaShieldAlt,
    path: "/methodology",
    keywords: "methodology takedown enterprise ranking",
  },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Global Keyboard Listener for Ctrl+K / Cmd+K and Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };

    const handleCustomOpen = () => setOpen(true);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("openCommandPalette", handleCustomOpen);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("openCommandPalette", handleCustomOpen);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setSearch("");
    }
  }, [open]);

  const filteredActions = QUICK_ACTIONS.filter((item) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase().trim();
    return (
      item.title.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.keywords.toLowerCase().includes(query)
    );
  });

  const handleSelect = (item) => {
    setOpen(false);
    navigate(item.path);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredActions.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredActions.length) % Math.max(1, filteredActions.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredActions[selectedIndex]) {
        handleSelect(filteredActions[selectedIndex]);
      } else if (search.trim().startsWith("CT-") || search.trim().startsWith("#CT-")) {
        setOpen(false);
        const docket = search.trim().replace("#", "").toUpperCase();
        navigate(`/track?id=${docket}`);
      }
    }
  };

  if (!open) return null;

  return (
    <div className="cmd-palette-overlay" onClick={() => setOpen(false)}>
      <div className="cmd-palette-modal" onClick={(e) => e.stopPropagation()}>
        {/* Search Input Bar */}
        <div className="cmd-input-wrap">
          <FaSearch className="cmd-search-icon" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search (e.g. Amazon, Track #CT-2026, Court Fee)..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleSearchKeyDown}
            className="cmd-input-field"
          />
          <button
            type="button"
            className="cmd-esc-tag"
            onClick={() => setOpen(false)}
            title="Close (Esc)"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="cmd-results-list">
          {filteredActions.length === 0 ? (
            <div className="cmd-empty-state">
              <span>No direct command found for "{search}"</span>
              {search.trim().length > 3 && (
                <button
                  type="button"
                  className="cmd-docket-jump-btn"
                  onClick={() => {
                    setOpen(false);
                    navigate(`/track?id=${encodeURIComponent(search.trim().toUpperCase())}`);
                  }}
                >
                  <FaSearch /> Search Docket "#{search.trim().toUpperCase()}" in Registry
                </button>
              )}
            </div>
          ) : (
            filteredActions.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className={`cmd-item ${idx === selectedIndex ? "selected" : ""}`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div className="cmd-item-left">
                    <div className="cmd-icon-box">
                      <Icon />
                    </div>
                    <div className="cmd-item-text">
                      <span className="cmd-item-title">{item.title}</span>
                      <span className="cmd-item-category">{item.category}</span>
                    </div>
                  </div>
                  <FaArrowRight className="cmd-item-arrow" />
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div className="cmd-footer-hints">
          <div className="hint-item">
            <kbd>↑</kbd> <kbd>↓</kbd> <span>Navigate</span>
          </div>
          <div className="hint-item">
            <kbd>↵</kbd> <span>Select</span>
          </div>
          <div className="hint-item">
            <kbd>ESC</kbd> <span>Close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
