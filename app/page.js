"use client";
import { useState } from "react";

export default function Home() {
  const [origins, setOrigins] = useState("");
  const [destination, setDestination] = useState("");
  const [depart, setDepart] = useState("");
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({});

  function validate() {
    const err = {};

    const list = origins
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

  function onSubmit(e) {
    e.preventDefault();
    const list = validate();
    if (!list) return;

    const payload = {
      origins: list,
      destination: destination.trim().toUpperCase(),
      depart,
    };

    console.log("SEARCH:", payload);
    setResults(payload);
  }

  return (
    <main className="min-h-screen p-8 sm:p-20 text-white bg-black">
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
            value={origins}
            onChange={(e) => setOrigins(e.target.value)}
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
          disabled={!origins || !destination}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded"
        >
          Search Flights
        </button>
      </form>

      {results && (
        <div className="mt-6 p-4 bg-white/10 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Search Summary</h2>
          <p>
            <span className="font-bold">Origins:</span>{" "}
            {results.origins.join(", ")}
          </p>
          <p>
            <span className="font-bold">Destination:</span>{" "}
            {results.destination}
          </p>
          <p>
            <span className="font-bold">Depart:</span>{" "}
            {results.depart || "(none)"}
          </p>
        </div>
      )}
    </main>
  );
}
