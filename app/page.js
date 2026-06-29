"use client";
import { useEffect, useState } from "react";

const iata = /^[A-Z]{3}$/;

function parseAirportCodes(value) {
  return value
    .toUpperCase()
    .split(/[\s,]+/)
    .map((code) => code.trim())
    .filter(Boolean);
}

function uniqueCodes(codes) {
  return [...new Set(codes)];
}

export default function Home() {
  const [origins, setOrigins] = useState([]);
  const [destination, setDestination] = useState("");
  const [depart, setDepart] = useState("");
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({});
  const [originInput, setOriginInput] = useState("");
  const [history, setHistory] = useState([]);

  const [step, setStep] = useState("welcome");
  const [menuOpen, setMenuOpen] = useState(false);

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    birthday: "",
    address: "",
  });
  const [homeAirport, setHomeAirport] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("multi-airport-user-profile-v1");
      if (!raw) return;

      const saved = JSON.parse(raw);

      if (saved.profile) setProfile(saved.profile);
      if (saved.homeAirport) setHomeAirport(saved.homeAirport);
      if (Array.isArray(saved.origins)) setOrigins(saved.origins);

      if (
        saved.profile &&
        Array.isArray(saved.origins) &&
        saved.origins.length > 0
      ) {
        setStep("search");
      }
    } catch (err) {
      console.log("Profile load failed:", err);
    }
  }, []);

  useEffect(() => {
    try {
      const saved = {
        profile,
        homeAirport,
        origins,
      };

      localStorage.setItem(
        "multi-airport-user-profile-v1",
        JSON.stringify(saved),
      );
    } catch (err) {
      console.log("Profile save failed:", err);
    }
  }, [profile, homeAirport, origins]);

  function validate() {
    const err = {};

    const list = uniqueCodes([...origins, ...parseAirportCodes(originInput)]);

    if (list.length < 2 || list.length > 5) {
      err.origins = "Enter 2 to 5 origin airports.";
    }

    if (list.some((code) => !iata.test(code))) {
      err.origins = "Use 3-letter IATA codes only.";
    }

    if (!iata.test(destination.trim().toUpperCase())) {
      err.destination = "Destination must be a 3-letter IATA code.";
    }

    setErrors(err);

    return Object.keys(err).length === 0 ? list : null;
  }
  function addOrigin() {
    const codes = parseAirportCodes(originInput);
    if (codes.length === 0) return;

    if (codes.some((code) => !iata.test(code))) {
      setErrors((prev) => ({
        ...prev,
        origins: "Use 3-letter IATA codes only.",
      }));
      return;
    }

    const nextOrigins = uniqueCodes([...origins, ...codes]);

    if (nextOrigins.length > 5) {
      setErrors((prev) => ({
        ...prev,
        origins: "Enter 2 to 5 origin airports.",
      }));
      return;
    }

    setOrigins(nextOrigins);
    setOriginInput("");
    setErrors((prev) => ({ ...prev, origins: undefined }));
  }

  function removeOrigin(code) {
    setOrigins((prev) => prev.filter((x) => x !== code));
  }
  function onSubmit(e) {
    e.preventDefault();
    const list = validate();
    if (!list) return;
    setOrigins(list);
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
    setErrors({});
  }

  function loadSearch(item) {
    setOrigins(item.origins);
    setDestination(item.destination);
    setDepart(item.depart);
    setResults(item);
    setOriginInput("");
    setErrors({});
  }
  function Navbar() {
    return (
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <button
          type="button"
          onClick={() => setStep("welcome")}
          className="font-bold text-lg"
        >
          Multi-Airport
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-2xl"
            aria-label="Open navigation menu"
          >
            ☰
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-zinc-900 border border-white/10 rounded-lg shadow-lg p-2 z-10">
              <button
                type="button"
                onClick={() => {
                  setStep("profile");
                  setMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded hover:bg-white/10"
              >
                Profile
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("search");
                  setMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded hover:bg-white/10"
              >
                Search
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded hover:bg-white/10"
              >
                Settings
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
  if (step === "welcome") {
    return (
      <section className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="mx-auto max-w-2xl px-6 py-16">
          <h1 className="text-4xl font-bold">Multi-Airport Flight App</h1>

          <p className="mt-4 text-lg opacity-80">
            Find better flight options by searching from multiple nearby
            airports at once.
          </p>

          <div className="mt-8 bg-white/5 rounded-2xl p-6 ring-1 ring-white/10">
            <h2 className="text-2xl font-semibold">Why this app exists</h2>

            <p className="mt-3 opacity-80">
              Flight prices change a lot between nearby airports. This app helps
              you save time by remembering your home airport and nearby airports
              so you do not have to enter them every search.
            </p>

            <p className="mt-3 opacity-80">
              First, you will create a simple profile. Then you will set your
              home airport and add up to four more airports.
            </p>

            <button
              type="button"
              onClick={() => setStep("profile")}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded"
            >
              Get Started
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (step === "profile") {
    return (
      <section className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="mx-auto max-w-2xl px-6 py-16">
          <h1 className="text-3xl font-bold">Your Profile</h1>

          <p className="mt-2 text-sm opacity-80">
            We will use this to set up your home airport and nearby airport
            options.
          </p>

          <form className="mt-8 w-full max-w-xl bg-white/5 rounded-2xl p-6 shadow-lg ring-1 ring-white/10 flex flex-col gap-4">
            <div>
              <label className="block mb-1 text-sm">First Name</label>
              <input
                type="text"
                value={profile.firstName}
                onChange={(e) =>
                  setProfile({ ...profile, firstName: e.target.value })
                }
                className="w-full p-2 rounded bg-white text-black"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm">Last Name</label>
              <input
                type="text"
                value={profile.lastName}
                onChange={(e) =>
                  setProfile({ ...profile, lastName: e.target.value })
                }
                className="w-full p-2 rounded bg-white text-black"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm">Birthday</label>
              <input
                type="date"
                value={profile.birthday}
                onChange={(e) =>
                  setProfile({ ...profile, birthday: e.target.value })
                }
                className="w-full p-2 rounded bg-white text-black"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm">Home Address</label>
              <input
                type="text"
                value={profile.address}
                onChange={(e) =>
                  setProfile({ ...profile, address: e.target.value })
                }
                placeholder="Start typing your address"
                className="w-full p-2 rounded bg-white text-black"
              />
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <h2 className="text-lg font-semibold">Saved Airports</h2>

              <p className="mt-2 text-sm opacity-80">
                Home Airport: {homeAirport || "Not set"}
              </p>

              <p className="mt-1 text-sm opacity-80">
                Search Airports:{" "}
                {origins.length > 0 ? origins.join(", ") : "None saved"}
              </p>

              <button
                type="button"
                onClick={() => setStep("airports")}
                className="mt-4 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded"
              >
                Edit Airports
              </button>
            </div>

            <button
              type="button"
              onClick={() => setStep("search")}
              disabled={origins.length === 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded"
            >
              Save Profile
            </button>
          </form>
        </div>
      </section>
    );
  }
  if (step === "airports") {
    return (
      <section className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="mx-auto max-w-2xl px-6 py-16">
          <h1 className="text-3xl font-bold">Set Your Airports</h1>

          <p className="mt-2 text-sm opacity-80">
            Add your home airport first. Then add up to four nearby airports.
          </p>

          <form className="mt-8 w-full max-w-xl bg-white/5 rounded-2xl p-6 shadow-lg ring-1 ring-white/10 flex flex-col gap-4">
            <div>
              <label className="block mb-1 text-sm">Home Airport</label>
              <input
                type="text"
                value={homeAirport}
                onChange={(e) => setHomeAirport(e.target.value.toUpperCase())}
                placeholder="e.g. IND"
                maxLength={3}
                className="w-full p-2 rounded bg-white text-black"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm">Nearby Airports</label>
              <input
                type="text"
                value={originInput}
                onChange={(e) => setOriginInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addOrigin();
                  }
                }}
                placeholder="e.g. ORD, MDW, CVG, SDF"
                className="w-full p-2 rounded bg-white text-black"
              />

              <button
                type="button"
                onClick={addOrigin}
                className="mt-2 bg-white/10 hover:bg-white/20 text-sm px-3 py-1 rounded"
              >
                Add Nearby Airport
              </button>

              <div className="flex flex-wrap gap-2 mt-3">
                {origins.map((code) => (
                  <div
                    key={code}
                    className="flex items-center gap-2 bg-blue-600 px-3 py-1 rounded-full text-sm"
                  >
                    {code}
                    <button
                      type="button"
                      onClick={() => removeOrigin(code)}
                      className="text-xs opacity-80 hover:opacity-100"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>

              {errors.origins && (
                <p className="mt-1 text-red-400 text-sm">{errors.origins}</p>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                const savedAirports = uniqueCodes([homeAirport, ...origins]);
                setOrigins(savedAirports);
                setStep("profile");
              }}
              disabled={!iata.test(homeAirport) || origins.length > 4}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded"
            >
              Save Airports
            </button>
          </form>
        </div>
      </section>
    );
  }
  if (step === "search") {
    return (
      <section className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="mx-auto max-w-2xl px-6 py-10">
          <h1 className="text-3xl font-bold">Multi-Airport Flight App</h1>
          <p className="mt-2 text-sm opacity-80">Clean slate. We start here.</p>

          <form
            onSubmit={onSubmit}
            className="mt-8 w-full max-w-xl bg-white/5 rounded-2xl p-6 shadow-lg ring-1 ring-white/10 flex flex-col gap-4"
          >
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-sm opacity-80">Searching from</p>
              <p className="font-semibold">
                {origins.length > 0
                  ? origins.join(", ")
                  : "No airports saved yet"}
              </p>
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
                <p className="mt-1 text-red-400 text-sm">
                  {errors.destination}
                </p>
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
              disabled={origins.length === 0 || !destination}
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
                  <li key={idx}>
                    <button
                      type="button"
                      onClick={() => loadSearch(item)}
                      className="w-full text-left p-3 bg-white/10 hover:bg-white/20 rounded-lg"
                    >
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
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    );
  }
}
