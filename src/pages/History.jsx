import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // 🔐 Redirect only if not logged in
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchHistory = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/result/history",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        const data = await res.json();
        setHistory(data);
      } catch (err) {
        console.error("History fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [navigate]);

  return (
    <div className="flex justify-center min-h-screen pt-10">
      <div className="w-full max-w-lg p-6 bg-white rounded shadow">
        <h2 className="mb-4 text-xl font-semibold text-center">
          Result History
        </h2>

        {loading ? (
          <p className="text-center text-gray-500">Loading history...</p>
        ) : history.length === 0 ? (
          <p className="text-center text-gray-500">No history found</p>
        ) : (
          history.map((item) => (
            <div
              key={item._id}
              className="p-3 mb-3 border rounded"
            >
              <p className="mb-1 text-xs text-gray-500">
                {new Date(item.createdAt).toLocaleString()}
              </p>

              {item.mergedResult.map((r, i) => (
                <p key={i}>{r}</p>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
