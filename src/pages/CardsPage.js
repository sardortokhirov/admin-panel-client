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

  // State for Toggle
  const [toggleState, setToggleState] = useState({ humoEnabled: true });
  const [isToggling, setIsToggling] = useState(false);

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

  if (isLoading) return <Loader />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>All Admin Cards</h1>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          {/* Humo Toggle UI */}
          <div className="toggle-element" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 10px' }}>
            <span style={{ margin: 0, fontWeight: '600', color: 'inherit' }}>Humo:</span>
            <div
              className="toggle-switch"
              style={{
                margin: 0, // Override global margin
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

          <Button primary onClick={() => handleOpenModal()}>
            <FiPlusCircle /> Add New Card
          </Button>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="cards-grid">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`admin-card ${card.osonConfig.primaryConfig ? "primary-account" : ""
              }`}
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
                  <span>Payment System</span>
                  <p>{card.paymentSystem === "HUMO" ? "TELEGRAM" : "OSON"}</p>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', color: '#0088cc' }}>
                  {card.paymentSystem === "HUMO" ? (
                    <FiSend size={32} title="TELEGRAM" />
                  ) : (
                    <FiSmartphone size={32} title="OSON" style={{ color: '#53bf9d' }} />
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

      {/* --- Add/Edit Card Modal --- */}
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

          <div className="form__group">
            <label htmlFor="paymentSystem">Payment System (Oson/Telegram)</label>
            <select
              id="paymentSystem"
              value={currentCard?.paymentSystem}
              onChange={(e) =>
                setCurrentCard({
                  ...currentCard,
                  paymentSystem: e.target.value,
                })
              }
              required
            >
              <option key={1} value={"HUMO"}>
                TELEGRAM
              </option>
              <option key={2} value={"UZCARD"}>
                OSON
              </option>
            </select>
          </div>

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
    </div>
  );
};

export default CardsPage;
