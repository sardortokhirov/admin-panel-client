import React, { useState, useEffect } from "react";
import { dashboardService } from "../api/dashboardService";
import Loader from "../components/common/Loader";
import { subDays, format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Import Chart.js and React wrapper
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Title,
} from "chart.js";
import { Doughnut, Bar, Line } from "react-chartjs-2";
import { setAuthHeader } from "../api/apiService";
import {
  FiTrendingUp,
  FiArrowUpCircle,
  FiArrowDownCircle,
  FiUsers,
  FiAward,
  FiHeart
} from "react-icons/fi";
import { STATUS_MAP } from "../constants/statusConstants";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Title
);

// Reusable Stat Card component
const StatCard = ({ icon, title, value, detail, color }) => (
  <div className="stat-card-v2" style={{ borderBottomColor: color }}>
    <div className="stat-card-v2__icon" style={{ color }}>
      {icon}
    </div>
    <div className="stat-card-v2__info">
      <span className="stat-card-v2__title">{title}</span>
      <span className="stat-card-v2__value">{value}</span>
      {detail && <span className="stat-card-v2__detail">{detail}</span>}
    </div>
  </div>
);

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [toggleState, setToggleState] = useState(false);

  // Date filter state
  const [filterPeriod, setFilterPeriod] = useState("30d");
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;



  const fetchData = async () => {
    setIsLoading(true);
    setError("");

    let params = {};
    if (filterPeriod === "custom" && startDate && endDate) {
      params = {
        startDate: format(startDate, "yyyy-MM-dd'T'00:00:00"),
        endDate: format(endDate, "yyyy-MM-dd'T'23:59:59"),
      };
    } else if (filterPeriod !== "all" && filterPeriod !== "custom") {
      const days = parseInt(filterPeriod.replace("d", ""));
      params = {
        startDate: format(subDays(new Date(), days), "yyyy-MM-dd'T'00:00:00"),
      };
    }

    try {
      const [statsResponse, bonusResponse, walletResponse] = await Promise.all([
        dashboardService.getDashboardStats(params),
        dashboardService.getTotalApprovedBonusAmount(params),
        dashboardService.getWalletBalances().catch(() => ({ data: { totalWalletMoney: 0, userBalances: [] } })),
      ]);

      const combinedStats = {
        ...statsResponse.data,
        totalApprovedBonusAmount: bonusResponse.data,
        walletBalances: walletResponse.data,
      };

      setStats(combinedStats);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError("Ma'lumotlarni yuklashda xatolik yuz berdi.");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    const storedAuth = localStorage.getItem("authData");
    if (storedAuth) {
      const { token } = JSON.parse(storedAuth);
      setAuthHeader(token);
    } else {
      setError("No authentication token found. Please log in.");
    }
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [filterPeriod, dateRange]);

  const getToggles = async () => {
    setIsLoading(true);
    try {
      const res = await dashboardService.GetToggles(); // query param

      console.log("RESINNER", res);

      // axios returns { data: ... }
      // setAccounts(res.data ?? []);
    } catch (err) {
      console.error("toggle  error:", err);
      // setNotificationError(
      //   err.response?.data?.detail || err.message || "Noma'lum xato"
      // );
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    (async () => {
      const toggles = await dashboardService.GetToggles();

      console.log("togglestoggles", toggles);

      setToggleState({
        ...toggles,
        payEnabled: toggles.payToggleEnabled !== undefined ? toggles.payToggleEnabled : toggles.payEnabled,
        promoEnabled: toggles.promoEnabled,
        walletEnabled: toggles.walletEnabled
      });
    })();
  }, []);

  const changeTogle = async (key, value) => {
    // topUpEnabled,withdrawEnabled,bonusEnabled

    setIsLoading(1);
    let res;
    if (key === "topUpEnabled") {
      res = await dashboardService?.ToggleController?.toggleTopUp(!value);
    } else if (key === "withdrawEnabled") {
      res = await dashboardService?.ToggleController?.toggleWithdraw(!value);
    } else if (key === "bonusEnabled") {
      res = await dashboardService?.ToggleController?.toggleBonus(!value);
    } else if (key === "promoEnabled") {
      res = await dashboardService?.ToggleController?.togglePromo(!value);
    } else if (key === "bonusLimitEnabled") {
      res = await dashboardService?.ToggleController?.toggleBonusLimit(!value);
    } else if (key === "payEnabled") {
      res = await dashboardService?.ToggleController?.togglePay(!value);
    } else if (key === "walletEnabled") {
      res = await dashboardService?.ToggleController?.toggleWallet(!value);
    } else if (key === "bonusAutoApproveEnabled") {
      res = await dashboardService?.ToggleController?.toggleBonusAutoApprove(!value);
    }
    const toggles = await dashboardService.GetToggles();

    console.log("togglestoggles", toggles);
    console.log("togglestogglesRes", res);

    setToggleState({
      ...toggles,
      payEnabled: toggles.payToggleEnabled !== undefined ? toggles.payToggleEnabled : toggles.payEnabled,
      promoEnabled: toggles.promoEnabled,
      walletEnabled: toggles.walletEnabled
    });
    setIsLoading(0);
  };

  const handleFilterChange = (period) => {
    setFilterPeriod(period);
    if (period !== "custom") setDateRange([null, null]);
  };

  // Chart Configurations
  const requestsByDateChartData = {
    labels: stats?.requestsByDate
      ? Object.keys(stats.requestsByDate).sort()
      : [],
    datasets: [
      {
        label: "So'rovlar",
        data: stats?.requestsByDate
          ? Object.keys(stats.requestsByDate)
            .sort()
            .map((key) => stats.requestsByDate[key])
          : [],
        borderColor: "#e94560",
        backgroundColor: "rgba(233, 69, 96, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const platformGraphLabels = stats?.platformGraphData
    ? Object.keys(stats.platformGraphData)
    : [];
  const platformGraphData = {
    labels: platformGraphLabels,
    datasets: [
      {
        label: "To'ldirilgan (Top-up)",
        data: platformGraphLabels.map(
          (p) => stats.platformGraphData[p]["top_up"] || 0
        ),
        backgroundColor: "#53bf9d",
      },
      {
        label: "Yechib olingan (Withdrawal)",
        data: platformGraphLabels.map(
          (p) => stats.platformGraphData[p]["withdrawal"] || 0
        ),
        backgroundColor: "#e94560",
      },
    ],
  };


  const statusLabels = stats?.statusDistribution
    ? Object.keys(stats.statusDistribution)
    : [];

  const statusChartData = {
    labels: statusLabels.map(s => STATUS_MAP[s]?.label || s),
    datasets: [
      {
        data: statusLabels.map((label) => stats.statusDistribution[label]),
        backgroundColor: statusLabels.map(
          (status) => STATUS_MAP[status]?.color || "#16213e"
        ),
        borderColor: "#1a1a2e",
        borderWidth: 4,
        hoverOffset: 10,
      },
    ],
  };

  const chartOptions = (title) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top", labels: { color: "#e0e0e0" } },
      title: {
        display: true,
        text: title,
        color: "#e0e0e0",
        font: { size: 16 },
      },
    },
    scales: {
      y: {
        stacked: true,
        ticks: { color: "#a0a0a0" },
        grid: { color: "#333" },
      },
      x: {
        stacked: true,
        ticks: { color: "#a0a0a0" },
        grid: { color: "transparent" },
      },
    },
  });

  const donutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: "Statuslar Taqsimoti",
        color: "#e0e0e0",
        font: { size: 20, weight: "bold" },
      },
      legend: {
        position: "bottom",
        labels: { color: "#e0e0e0", padding: 20, font: { size: 14 } },
      },
    },
    cutout: "60%",
  };

  if (isLoading) return <Loader />;
  if (error) return <p className="error-message">{error}</p>;
  if (!stats) return <p>Ma'lumotlar topilmadi.</p>;

  return (
    <div className="page-container dashboard-v2">
      <div className="ToggleContainer">
        <div className="toggle-element" onClick={() => changeTogle("bonusEnabled", toggleState.bonusEnabled)}>
          <p><FiAward /> Bonus Tizimi:</p>
          <div className="toggle-switch">
            <div className={`toggle-slider ${toggleState.bonusEnabled ? "on" : "off"}`}>
              <span className="toggle-knob"></span>
            </div>
          </div>
        </div>
        <div className="toggle-element" onClick={() => changeTogle("withdrawEnabled", toggleState.withdrawEnabled)}>
          <p><FiArrowUpCircle /> Pul Yechish:</p>
          <div className="toggle-switch">
            <div className={`toggle-slider ${toggleState.withdrawEnabled ? "on" : "off"}`}>
              <span className="toggle-knob"></span>
            </div>
          </div>
        </div>
        <div className="toggle-element" onClick={() => changeTogle("topUpEnabled", toggleState.topUpEnabled)}>
          <p><FiArrowDownCircle /> Hisob To'ldirish:</p>
          <div className="toggle-switch">
            <div className={`toggle-slider ${toggleState.topUpEnabled ? "on" : "off"}`}>
              <span className="toggle-knob"></span>
            </div>
          </div>
        </div>
        <div className="toggle-element" onClick={() => changeTogle("promoEnabled", toggleState.promoEnabled)}>
          <p><FiTrendingUp /> Promo Rejim:</p>
          <div className="toggle-switch">
            <div className={`toggle-slider ${toggleState.promoEnabled ? "on" : "off"}`}>
              <span className="toggle-knob"></span>
            </div>
          </div>
        </div>
        <div className="toggle-element" onClick={() => changeTogle("bonusLimitEnabled", toggleState.bonusLimitEnabled)}>
          <p><FiUsers /> Bonus Limiti:</p>
          <div className="toggle-switch">
            <div className={`toggle-slider ${toggleState.bonusLimitEnabled ? "on" : "off"}`}>
              <span className="toggle-knob"></span>
            </div>
          </div>
        </div>
        <div className="toggle-element" onClick={() => changeTogle("payEnabled", toggleState.payEnabled)}>
          <p><FiTrendingUp /> Pay Tizimi:</p>
          <div className="toggle-switch">
            <div className={`toggle-slider ${toggleState.payEnabled ? "on" : "off"}`}>
              <span className="toggle-knob"></span>
            </div>
          </div>
        </div>
        <div className="toggle-element" onClick={() => changeTogle("walletEnabled", toggleState.walletEnabled)}>
          <p><FiUsers /> Hamyon Tizimi:</p>
          <div className="toggle-switch">
            <div className={`toggle-slider ${toggleState.walletEnabled ? "on" : "off"}`}>
              <span className="toggle-knob"></span>
            </div>
          </div>
        </div>
        <div className="toggle-element" onClick={() => changeTogle("bonusAutoApproveEnabled", toggleState.bonusAutoApproveEnabled)}>
          <p><FiAward /> Bonus avto tasdiq:</p>
          <div className="toggle-switch">
            <div className={`toggle-slider ${toggleState.bonusAutoApproveEnabled ? "on" : "off"}`}>
              <span className="toggle-knob"></span>
            </div>
          </div>
        </div>
      </div>
      <header className="dashboard-header">
        <h1>Boshqaruv Paneli</h1>
        <div className="filter-controls">
          <button
            onClick={() => handleFilterChange("7d")}
            className={filterPeriod === "7d" ? "active" : ""}
          >
            7 Kun
          </button>
          <button
            onClick={() => handleFilterChange("30d")}
            className={filterPeriod === "30d" ? "active" : ""}
          >
            30 Kun
          </button>
          <button
            onClick={() => handleFilterChange("90d")}
            className={filterPeriod === "90d" ? "active" : ""}
          >
            90 Kun
          </button>
          <DatePicker
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => {
              setDateRange(update);
              setFilterPeriod("custom");
            }}
            isClearable={true}
            placeholderText="Maxsus oraliq"
            className={`custom-datepicker ${filterPeriod === "custom" ? "active" : ""
              }`}
          />
        </div>
      </header>
      <div className="stats-grid">
        <StatCard
          icon={<FiArrowDownCircle />}
          title="Jami Yechilgan"
          value={`${stats.totalApprovedWithdrawalAmount?.toLocaleString("uz-UZ") || 0
            } so'm`}
          detail="Tasdiqlangan"
          color="#e94560"
        />
        <StatCard
          icon={<FiArrowUpCircle />}
          title="Jami To'ldirilgan"
          value={`${stats.totalApprovedTopUpAmount?.toLocaleString("uz-UZ") || 0
            } so'm`}
          detail="Tasdiqlangan"
          color="#53bf9d"
        />
        <StatCard
          icon={<FiAward />}
          title="Jami Bonus"
          value={`${stats.totalApprovedBonusAmount?.toLocaleString("uz-UZ") || 0
            } so'm`}
          detail="Tasdiqlangan Bonus"
          color="#9b59b6"
        />
        <StatCard
          icon={<FiHeart />}
          title="Jami Bot Rivoji"
          value={`${stats.totalApprovedTipAmount?.toLocaleString("uz-UZ") || 0
            } so'm`}
          detail="Bot rivojiga qilingan hissa"
          color="#f39c12"
        />
        <StatCard
          icon={<FiTrendingUp />}
          title="Jami So'rovlar"
          value={stats.totalRequests?.toLocaleString() || 0}
          detail={`${stats.approvedRequests?.toLocaleString() || 0
            } tasdiqlangan`}
          color="#3498db"
        />
        <StatCard
          icon={<FiUsers />}
          title="Top Foydalanuvchi"
          value={`${Object.keys(stats.topUsers || {})[0] || "N/A"}`}
          detail={`${Object.values(stats.topUsers || {})[0] || 0} so'rov bilan`}
          color="#fca130"
        />
        <StatCard
          icon={<FiArrowUpCircle />}
          title="Jami Hamyonlar"
          value={`${(stats.walletBalances?.totalWalletMoney || 0).toLocaleString("uz-UZ")} so'm`}
          detail="Barcha foydalanuvchilar qolgan ballari"
          color="#10b981"
        />
      </div>
      <div className="dashboard-main-content-grid">
        <div className="main-column">
          <div className="chart-container-v2 area-chart">
            <Line
              options={{
                ...chartOptions("Vaqt Bo'yicha Faollik"),
                plugins: { legend: { display: false } },
              }}
              data={requestsByDateChartData}
            />
          </div>
          <div className="chart-container-v2 stacked-bar-chart">
            <Bar
              options={chartOptions("Platforma Bo'yicha Moliya")}
              data={platformGraphData}
            />
          </div>
        </div>
        <div className="sidebar-column">
          <div className="chart-container-v2 donut-hero-chart">
            <Doughnut data={statusChartData} options={donutChartOptions} />
          </div>
          <div className="table-container-v2">
            <h3>Eng Faol Foydalanuvchilar</h3>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Foydalanuvchi ID</th>
                    <th>So'rovlar</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topUsers ? (
                    Object.entries(stats.topUsers)
                      .slice(0, 5)
                      .map(([userId, count]) => (
                        <tr key={userId}>
                          <td>{userId}</td>
                          <td>{count}</td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan="2">Ma'lumot yo'q</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="table-container-v2" style={{ marginTop: '2rem' }}>
            <h3>Hamyon Balanslari</h3>
            <div className="table-wrapper">
              <table className="wallet-balances-table">
                <thead>
                  <tr>
                    <th>Foydalanuvchi ID</th>
                    <th>Balans</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.walletBalances?.userBalances?.length > 0 ? (
                    stats.walletBalances.userBalances
                      .sort((a, b) => b.walletBalance - a.walletBalance)
                      .slice(0, 10)
                      .map((user) => (
                        <tr key={user.chatId}>
                          <td>{user.chatId}</td>
                          <td style={{ color: '#53bf9d', fontWeight: 'bold' }}>
                            {user.walletBalance.toLocaleString("uz-UZ")}
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan="2">Ma'lumot topilmadi</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
