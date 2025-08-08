import React from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

function IletisimPage() {
    return (
        <>
            <Header />
            <div className="comm-body">
                <div style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1rem', color: '#e2e8f0' }}>
                    <h1 style={{ marginBottom: '1rem' }}>İletişim</h1>
                    <p>Bizimle iletişime geçmek için lütfen aşağıdaki kanalları kullanın.</p>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default IletisimPage;