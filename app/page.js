"use client";
import { useState } from "react";

export default function Home() {
  const [origins, useOrigins] = useState("");
  const [destination, setDestinations] = useState("");
  const [depart, setDepart] = useState("");
  function onSubmit(e) {
    e.preventDefault();
    const payload = {
      origins: origins
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean),
      destination: destination.trim().toUpperCase(),
      depart,
    };
    console.log("SEARCH:", payload);
    alert(
      `Saved search\nOrigins: ${payload.origins.join(", ")}\nDestination: ${
        payload.destination
      }\nDepart: ${payload.depart || "(none)"}`
    );
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

          <input
            type="date"
            value={depart}
            onChange={(e) => setDepart(e.target.value)}
            className="w-full p-2 rounded bg-white text-black"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
        >
          Search Flights
        </button>
      </form>
    </main>
  );
}
