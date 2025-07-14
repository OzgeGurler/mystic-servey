import React, { useState } from "react";
import "../css/AdminPage.css";
import { Users, FileText, BarChart2, Settings, LogOut } from "lucide-react";
import UsersTab from "./UsersTab";
import SurveysTab from "./SurveysTab";

/*
const UsersTab = () => (
    <div className="tab-content">
        <h2> Kullanıcı Yönetimi</h2>
        <p> Kullanıcı ekle veya sil.</p>
    </div>
);
*/

/* 
const SurveysTab = () => (
    <div className="tab-content">
        <h2>Anket Yönetimi</h2>
        <p>Anket yönet</p>
    </div>
);
 */

const StatsTab = () => (
    <div className="tab-content">
        <h2>İstatistikler</h2>
        <p>İstatistikleri Gör</p>
    </div>
);

const SettingsTab = () => (
    <div className="tab-content">
        <h2>Ayarlar</h2>
        <p>Admin ayarlarını görüntüle</p>
    </div>
);


export default function AdminPage() {
    const [activeTab, setActiveTab] = useState("users");

    const renderActiveTab = () => {
        switch (activeTab) {
            case "users":
                return <UsersTab />;
            case "surveys":
                return <SurveysTab />;
            case "stats":
                return <StatsTab />;
            case "settings":
                return <SettingsTab />;
            default:
                return <UsersTab />;
        }
    };

    const handleLogout=()=>{
        if(window.confirm('Çıkış Yapmak İstediğinizden Emin Misiniz?')){
            alert('Çıkış Yapıldı');
        }
    };

    return (

        <div className="admin-container">

            <div className="admin-header">
                <h1>Admin Paneli</h1>
                <button className="logout-btn" onClick={handleLogout}>
                    <LogOut className="icon" />
                    Çıkış
                </button>
            </div>

            <div className="tab-buttons">
                <button
                    onClick={() => setActiveTab("users")}
                    className={activeTab === "users" ? "tab active" : "tab"}
                >
                    <Users className="icon" />
                    Kullanıcılar
                </button>
                <button
                    onClick={() => setActiveTab("surveys")}
                    className={activeTab === "surveys" ? "tab active" : "tab"}
                >
                    <FileText className="icon" />
                    Anketler
                </button>
                <button
                    onClick={() => setActiveTab("stats")}
                    className={activeTab === "stats" ? "tab active" : "tab"}
                >
                    <BarChart2 className="icon" />
                    İstatistikler
                </button>
                <button
                    onClick={() => setActiveTab("settings")}
                    className={activeTab === "settings" ? "tab active" : "tab"}
                >
                    <Settings className="icon" />
                    Ayarlar
                </button>
            </div>

            <div className="tab-content-wrapper">{renderActiveTab()}</div>
        </div>

    );
}