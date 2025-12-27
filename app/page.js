"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [origins, setOrigins] = useState("");
  const [destination, setDestination] = useState("");
  const [depart, setDepart] = useState("");
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({});
  const [originInput, setOriginInput] = useState("");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("multi-airport-history-v1");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setHistory(parsed);
      }
    } catch (err) {
      console.log("History load failed:", err);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("multi-airport-history-v1", JSON.stringify(history));
    } catch (err) {
      console.log("History save failed:", err);
    }
  }, [history]);

  function validate() {
    const err = {};
    const originsText = [origins, originInput].filter(Boolean).join(",");

    const list = originsText
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    if (list.length < 2 || list.length > 5) {
      err.origins = "Enter 2 to 5 origin airports, comma separated.";
    }

    const iata = /^[A-Z]{3}$/;

    if (list.some((code) => !iata.test(code))) {
      err.origins = "Use 3-letter IATA codes only, like JFK or LGA.";
    }

    if (!iata.test(destination.trim().toUpperCase())) {
      err.destination = "Destination must be a 3-letter IATA code.";
    }

    setErrors(err);
    return Object.keys(err).length === 0 ? list : null;
  }
  function addOrigin() {
    const code = originInput.trim().toUpperCase();
    if (!code) return;
    ins((prev) => (prev ? `${prev}, ${code}` : code));
    setOriginInput("");
  }
  function onSubmit(e) {
    e.preventDefault();
    const list = validate();
    if (!list) return;
    setOrigins(list.join(", "));
    setOriginInput("");

    const payload = {
      origins: list,
      destination: destination.trim().toUpperCase(),
      depart,
    };

    console.log("SEARCH:", payload);
    setResults(payload);
    setHistory((prev) => [payload, ...prev].slice(0, 5));
  }
  function clearHistory() {
    setHistory([]);
    setResults(null);
    setErrors([]);
  }

  return (
    <section className="min-h-screen p-8 sm:p-20 text-white bg-black">
      <h1 className="text-3xl font-bold">Multi-Airport Flight App</h1>
      <p className="mt-2 text-sm opacity-80">Clean slate. We start here.</p>

      <form
        onSubmit={onSubmit}
        className="mt-8 w-full max-w-xl bg-white/5 rounded-2xl p-6 shadow-lg ring-1 ring-white/10 flex flex-col gap-4"
      >
        <div>
          <label className="block mb-1 text-sm">Origins Airports</label>
          <input
            type="text"
            value={originInput}
            onChange={(e) => setOriginInput(e.target.value)}
            placeholder="e.g. JFK, LGA, EWR"
            className="w-full p-2 rounded bg-white text-black"
          />
          {errors.origins && (
            <p className="mt-1 text-red-400 text-sm">{errors.origins}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 text-sm">Destination Airport</label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g. LAX"
            className="w-full p-2 rounded bg-white text-black"
          />
          {errors.destination && (
            <p className="mt-1 text-red-400 text-sm">{errors.destination}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 text-sm">Departure date</label>
          <input
            type="date"
            value={depart}
            onChange={(e) => setDepart(e.target.value)}
            className="w-full p-2 rounded bg-white text-black"
          />
        </div>

        <button
          type="submit"
          disabled={!(origins || originInput) || !destination}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded"
        >
          Search Flights
        </button>
        <button
          type="button"
          onClick={clearHistory}
          className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded"
        >
          Clear History
        </button>
      </form>

      {results && (
        <div className="mt-6 w-full max-w-xl p-4 bg-white/10 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Search Summary</h2>

          <p className="text-sm">
            <span className="font-bold">Origins:</span>{" "}
            {results.origins.join(", ")}
          </p>

          <p className="text-sm">
            <span className="font-bold">Destination:</span>{" "}
            {results.destination}
          </p>

          <p className="text-sm">
            <span className="font-bold">Depart:</span>{" "}
            {results.depart || "(none)"}
          </p>
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-6 w-full max-w-xl">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Recent Searches</h2>

            <button
              type="button"
              onClick={() => setHistory([])}
              className="text-sm underline opacity-80 hover:opacity-100"
            >
              Clear
            </button>
          </div>

          <ul className="space-y-2">
            {history.map((item, idx) => (
              <li key={idx} className="p-3 bg-white/10 rounded-lg">
                <div className="text-sm">
                  <span className="font-bold">Origins:</span>{" "}
                  {item.origins.join(", ")}
                </div>
                <div className="text-sm">
                  <span className="font-bold">Destination:</span>{" "}
                  {item.destination}
                </div>
                <div className="text-sm">
                  <span className="font-bold">Depart:</span>{" "}
                  {item.depart || "(none)"}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
