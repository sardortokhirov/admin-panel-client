// src/pages/CardsPage.js

import React, { useState, useEffect, useCallback } from "react";
import { cardService } from "../api/cardService";
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
} from "react-icons/fi";

import HumoLogo from "../assets/humo.webp";
import UzcardLogo from "../assets/uzcard.png";

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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  if (isLoading) return <Loader />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>All Admin Cards</h1>
        <Button primary onClick={() => handleOpenModal()}>
          <FiPlusCircle /> Add New Card
        </Button>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="cards-grid">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`admin-card ${
              card.osonConfig.primaryConfig ? "primary-account" : ""
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
                  <span>Karta turi</span>
                  <p>
                    {card.paymentSystem}
                    {card.paymentSystem === "UZCARD" && card.uzcardRail
                      ? ` / ${card.uzcardRail}`
                      : ""}
                  </p>
                </div>
                <img
                  className="cardType"
                  src={card.paymentSystem === "HUMO" ? HumoLogo : UzcardLogo}
                  alt=""
                />
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

          {!currentCard?.id && (
            <div className="form__group">
              <label htmlFor="osonConfig">Humo/Uzcard</label>
              <select
                id="osonConfig"
                value={currentCard?.paymentSystem}
                onChange={(e) =>
                  setCurrentCard({
                    ...currentCard,
                    paymentSystem: e.target.value,
                  })
                }
                required
              >
                {/* {osonConfigs.map((config) => (
                  <option key={config.id} value={config.id}>
                    {config.deviceName} {config.primaryConfig && "(Primary)"}
                  </option>
                ))} */}

                <option key={1} value={"HUMO"}>
                  HUMO
                </option>
                <option key={2} value={"UZCARD"}>
                  UZCARD
                </option>
              </select>
            </div>
          )}

          {currentCard?.paymentSystem === "UZCARD" && (
            <div className="form__group">
              <label htmlFor="uzcardRail">UZCARD tekshiruv yo'li</label>
              <select
                id="uzcardRail"
                name="uzcardRail"
                value={currentCard?.uzcardRail || "OSON"}
                onChange={(e) =>
                  setCurrentCard({
                    ...currentCard,
                    uzcardRail: e.target.value,
                  })
                }
              >
                <option value="OSON">OSON</option>
                <option value="CARDXABAR">CARDXABAR</option>
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
    </div>
  );
};

export default CardsPage;
