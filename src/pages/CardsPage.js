// src/pages/CardsPage.js

import React, { useState, useEffect, useCallback } from "react";
import { cardService } from "../api/cardService";
import { setAuthHeader } from "../api/apiService";
import { dashboardService } from "../api/dashboardService"; // Added for toggle functionality
import { osonConfigService } from "../api/osonConfigService"; // We need this for the "Add Card" modal
import Loader from "../components/common/Loader";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import {
  FiCreditCard,
  FiUser,
  FiDollarSign,
  FiStar,
  FiEdit,
  FiTrash2,
  FiPlusCircle,
  FiServer,
  FiSend,
  FiSmartphone,
  FiSearch,
} from "react-icons/fi";


const CardsPage = () => {
  // State for data
  const [cards, setCards] = useState([]);
  const [osonConfigs, setOsonConfigs] = useState([]); // For the dropdown in the modal

  // State for UI
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // State for Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCard, setCurrentCard] = useState(null);
  const [selectedOsonConfigId, setSelectedOsonConfigId] = useState("");

  const [toggleState, setToggleState] = useState({ humoEnabled: true });
  const [isToggling, setIsToggling] = useState(false);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch BOTH cards and oson configs when the page loads
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      // Use Promise.all to fetch both sets of data concurrently for better performance
      const [cardsResponse, configsResponse] = await Promise.all([
        cardService.getCards(),
        osonConfigService.getAllConfigs(),
      ]);
      setCards(cardsResponse.data);
      setOsonConfigs(configsResponse.data);
    } catch (err) {
      setError(
        "Failed to load page data. Please check your connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchToggleState = useCallback(async () => {
    try {
      const toggles = await dashboardService.GetToggles();
      console.log("Fetched toggles:", toggles); // Debugging
      if (toggles && typeof toggles.humoEnabled !== 'undefined') {
        setToggleState(prev => ({ ...prev, humoEnabled: toggles.humoEnabled }));
      }
    } catch (err) {
      console.error("Failed to fetch toggle state:", err);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchToggleState();
  }, [fetchData, fetchToggleState]);

  const handleToggleHumo = async () => {
    setIsToggling(true);
    try {
      const newValue = !toggleState.humoEnabled;
      await dashboardService.ToggleController.toggleHumo(newValue);
      // Update local state immediately for better UX, or wait for fetch
      setToggleState(prev => ({ ...prev, humoEnabled: newValue }));

      // Optionally refetch to ensure sync
      fetchToggleState();
    } catch (err) {
      console.error("Failed to toggle Humo:", err);
      setError("Failed to update Humo toggle.");
    } finally {
      setIsToggling(false);
    }
  };

  const handleOpenModal = (card = null) => {
    if (card) {
      // Editing an existing card
      setCurrentCard(card);
      setSelectedOsonConfigId(card.osonConfig.id); // Pre-select its current config
    } else {
      // Adding a new card
      setCurrentCard({
        cardNumber: "",
        ownerName: "",
        paymentSystem: "HUMO",
        uzcardRail: "OSON",
        balance: 0,
      });
      // Set default selection to the first available config, if any
      if (osonConfigs.length > 0) {
        setSelectedOsonConfigId(osonConfigs[0].id);
      }
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentCard(null);
    setSelectedOsonConfigId("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentCard((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentCard.id) {
        // This is an update
        await cardService.updateCard(currentCard.id, currentCard);
      } else {
        // This is a new card
        if (!selectedOsonConfigId) {
          alert("Please select an Oson Account for the new card.");
          return;
        }
        console.log("currentCard", currentCard);

        await cardService.createCard(selectedOsonConfigId, currentCard);
      }
      fetchData(); // Refetch all data to show the changes
      handleCloseModal();
    } catch (err) {
      setError(
        "Failed to save the card. Please check the details and try again."
      );
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this card?")) {
      try {
        await cardService.deleteCard(id);
        fetchData(); // Refetch to remove the card from the list
      } catch (err) {
        // Display the specific error from the backend (e.g., "Cannot delete last card")
        alert(
          err.response?.data?.error ||
          "An unknown error occurred during deletion."
        );
      }
    }
  };

  const filteredCards = cards
    .filter((card) => {
      const searchLow = searchQuery.toLowerCase();
      const cardNumber = card.cardNumber || "";
      const ownerName = card.ownerName?.toLowerCase() || "";
      return cardNumber.includes(searchLow) || ownerName.includes(searchLow);
    })
    .sort((a, b) => {
      const nameA = a.osonConfig.deviceName || "";
      const nameB = b.osonConfig.deviceName || "";
      
      const isA = nameA.includes("Дониёр");
      const isB = nameB.includes("Дониёр");

      if (isA && !isB) return -1;
      if (!isA && isB) return 1;
      return nameA.localeCompare(nameB);
    });

  if (isLoading) return <Loader />;

  return (
    <div className="page-container cards-management-page">
      <div className="page-header custom-cards-header">
        <div className="header-title-section">
          <h1>All Admin Cards</h1>
          <span className="cards-count-badge">{filteredCards.length} Cards</span>
        </div>
        
        <div className="header-actions-group">
          {/* Search Bar */}
          <div className="search-bar-container">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by name or card number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="custom-search-input"
            />
            {searchQuery && (
              <button className="clear-search" onClick={() => setSearchQuery("")}>&times;</button>
            )}
          </div>

          <div className="toggle-and-add">
            {/* Humo Toggle UI */}
            <div className="toggle-element" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 10px' }}>
              <span className="toggle-label">Humo:</span>
              <div
                className="toggle-switch"
                style={{
                  margin: 0,
                  position: 'relative',
                  width: '50px',
                  height: '26px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  backgroundColor: toggleState.humoEnabled ? '#53bf9d' : '#e94560'
                }}
                onClick={() => !isToggling && handleToggleHumo()}
              >
                <div
                  className="toggle-knob"
                  style={{
                    position: 'absolute',
                    top: '3px',
                    left: '3px',
                    width: '20px',
                    height: '20px',
                    backgroundColor: '#fff',
                    borderRadius: '50%',
                    transition: 'transform 0.3s',
                    transform: toggleState.humoEnabled ? 'translateX(24px)' : 'translateX(0)'
                  }}
                ></div>
              </div>
            </div>

            <Button primary onClick={() => handleOpenModal()} className="add-card-btn">
              <FiPlusCircle /> <span>Add New Card</span>
            </Button>
          </div>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="cards-grid">
        {filteredCards.map((card) => (
          <div
            key={card.id}
            className={`admin-card ${card.osonConfig.primaryConfig ? "primary-account" : ""}`}
          >
            {card.osonConfig.primaryConfig && (
              <div className="primary-indicator">
                <FiStar /> Primary Account Card
              </div>
            )}

            <div className="admin-card-body">
              <div className="card-info-item">
                <FiCreditCard />
                <div className="card-info-text">
                  <span>Card Number</span>
                  <p>{card.cardNumber.replace(/(\d{4})/g, "$1 ").trim()}</p>
                </div>
              </div>
              <div className="card-info-item">
                <FiUser />
                <div className="card-info-text">
                  <span>Owner Name</span>
                  <p>{card.ownerName || "N/A"}</p>
                </div>
              </div>
              <div className="card-info-item">
                <FiDollarSign />
                <div className="card-info-text">
                  <span>Balance</span>
                  <p>{card.balance.toLocaleString("en-US")}</p>
                </div>
              </div>
              <div className="card-info-item">
                <div className="card-info-text">
                  <span>Verification / Channel</span>
                  <p style={{ 
                    fontWeight: 'bold', 
                    color: card.paymentSystem === 'HUMO' ? '#0088cc' : (card.uzcardRail === 'CARDXABAR' ? '#e94560' : '#53bf9d')
                  }}>
                    {card.paymentSystem === 'HUMO' ? 'Humo' : 
                     (card.uzcardRail === 'CARDXABAR' ? 'CardXabar' : 'Oson API')}
                  </p>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                  {card.paymentSystem === "HUMO" ? (
                    <FiSend size={32} title="TELEGRAM" color="#0088cc" />
                  ) : (
                    <FiSmartphone size={32} title="OSON" style={{ color: card.uzcardRail === 'CARDXABAR' ? '#e94560' : '#53bf9d' }} />
                  )}
                </div>
              </div>
            </div>

            <div className="admin-card-footer">
              <div className="account-info">
                <FiServer />
                <span>
                  Belongs to: <strong>{card.osonConfig.deviceName}</strong>
                </span>
              </div>
              <div className="card-actions">
                <Button onClick={() => handleOpenModal(card)}>
                  <FiEdit size={14} />
                </Button>
                <Button danger onClick={() => handleDelete(card.id)}>
                  <FiTrash2 size={14} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Admin Card Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <h2>{currentCard?.id ? "Edit Card" : "Add New Card"}</h2>
        <form onSubmit={handleSubmit} className="form modal-form">
          {/* Oson Account Selector (only for new cards) */}

          {!currentCard?.id && (
            <div className="form__group">
              <label htmlFor="osonConfig">Oson Account</label>
              <select
                id="osonConfig"
                value={selectedOsonConfigId}
                onChange={(e) => setSelectedOsonConfigId(e.target.value)}
                required
              >
                {osonConfigs.map((config) => (
                  <option key={config.id} value={config.id}>
                    {config.deviceName} {config.primaryConfig && "(Primary)"}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Step 1: Channel */}
          <div className="form__group">
            <label htmlFor="channel_selector">Kanal (Channel)</label>
            <select
              id="channel_selector"
              value={currentCard?.paymentSystem === 'UZCARD' && currentCard?.uzcardRail === 'OSON' ? 'OSON' : 'TELEGRAM'}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'OSON') {
                  setCurrentCard({
                    ...currentCard,
                    paymentSystem: 'UZCARD',
                    uzcardRail: 'OSON'
                  });
                } else {
                  // Default to HUMO when switching to Telegram
                  setCurrentCard({
                    ...currentCard,
                    paymentSystem: 'HUMO',
                    uzcardRail: null
                  });
                }
              }}
              required
            >
              <option value="OSON">Oson</option>
              <option value="TELEGRAM">Telegram</option>
            </select>
          </div>

          {/* Step 2: Verification Path (Only for Telegram) */}
          {!(currentCard?.paymentSystem === 'UZCARD' && currentCard?.uzcardRail === 'OSON') && (
            <div className="form__group">
              <label htmlFor="telegram_mode_selector">Tizim (Verification Path)</label>
              <select
                id="telegram_mode_selector"
                value={currentCard?.paymentSystem === 'HUMO' ? 'HUMO' : 'CARDXABAR'}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'HUMO') {
                    setCurrentCard({
                      ...currentCard,
                      paymentSystem: 'HUMO',
                      uzcardRail: null
                    });
                  } else {
                    setCurrentCard({
                      ...currentCard,
                      paymentSystem: 'UZCARD',
                      uzcardRail: 'CARDXABAR'
                    });
                  }
                }}
                required
              >
                <option value="HUMO">Humo</option>
                <option value="CARDXABAR">CardXabar</option>
              </select>
            </div>
          )}

          <div className="form__group">
            <label htmlFor="cardNumber">Card Number (16 digits)</label>
            <input
              type="text"
              id="cardNumber"
              name="cardNumber"
              value={currentCard?.cardNumber || ""}
              onChange={handleInputChange}
              required
              pattern="\d{16}"
              maxLength="16"
            />
          </div>
          <div className="form__group">
            <label htmlFor="ownerName">Owner Name</label>
            <input
              type="text"
              id="ownerName"
              name="ownerName"
              value={currentCard?.ownerName || ""}
              onChange={handleInputChange}
            />
          </div>
          <Button type="submit" primary>
            {currentCard?.id ? "Save Changes" : "Add Card"}
          </Button>
        </form>
      </Modal>

      <style>{`
        .custom-cards-header {
          display: flex;
          flex-direction: column;
          gap: 20px;
          align-items: flex-start;
          width: 100%;
          margin-bottom: 30px;
        }

        .header-title-section {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .cards-count-badge {
          background: rgba(83, 191, 157, 0.1);
          color: #53bf9d;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .header-actions-group {
          display: flex;
          width: 100%;
          gap: 20px;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
        }

        .search-bar-container {
          position: relative;
          flex: 1;
          min-width: 250px;
          max-width: 450px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          border-radius: 12px;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #a0a0a0;
          pointer-events: none;
        }

        .custom-search-input {
          width: 100%;
          padding: 12px 16px 12px 46px;
          background: #1a1a2e;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #fff;
          font-size: 0.95rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .custom-search-input:focus {
          border-color: #0088cc;
          box-shadow: 0 0 0 3px rgba(0, 136, 204, 0.1);
          outline: none;
        }

        .clear-search {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #a0a0a0;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 0;
        }

        .toggle-and-add {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .toggle-label {
           font-weight: 600;
           color: #fff;
        }

        @media (max-width: 768px) {
          .header-actions-group {
            flex-direction: column;
            align-items: stretch;
          }

          .search-bar-container {
            max-width: none;
            min-width: 0;
          }

          .toggle-and-add {
            justify-content: space-between;
          }

          .add-card-btn span {
            display: none;
          }
          
          .add-card-btn {
            padding: 12px;
            border-radius: 50%;
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default CardsPage;
