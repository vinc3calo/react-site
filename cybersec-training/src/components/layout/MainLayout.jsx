import Navbar from "../Navbar";
import Sidebar from "../Sidebar"; // 👈 ADD

export default function MainLayout({ children }) {
  return (
    <div className="app">
        <Navbar />
        <div className="content" style={{ flex: 1 }}>
          {children}
        </div>
    </div>
  );
}