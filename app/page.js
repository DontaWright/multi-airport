"use client";
import { useEffect, useState } from "react";
// ---------- Airport Helper Functions ----------
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
// ---------- Main Navora Component ----------
export default function Home() {
  // ---------- Flight Search State ----------
  const [origins, setOrigins] = useState([]);
  const [destination, setDestination] = useState("");
  const [depart, setDepart] = useState("");
  const [results, setResults] = useState(null);
  const [flightOptions, setFlightOptions] = useState([]);
  const [sortBy, setSortBy] = useState("price");
  const [errors, setErrors] = useState({});
  const [originInput, setOriginInput] = useState("");
  const [history, setHistory] = useState([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  // ---------- Trip Details State ----------
  const [tripType, setTripType] = useState("round-trip");
  const [returnDate, setReturnDate] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [cabinClass, setCabinClass] = useState("economy");
  // ---------- Navigation State ----------
  const [step, setStep] = useState("welcome");
  const [menuOpen, setMenuOpen] = useState(false);
  // ---------- User Profile State ----------
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    birthday: "",
    address: "",
  });
  const [homeAirport, setHomeAirport] = useState("");
  // ---------- Load Saved Profile and Search History ----------
  useEffect(() => {
    try {
      const profileRaw = localStorage.getItem("multi-airport-user-profile-v1");

      if (profileRaw) {
        const saved = JSON.parse(profileRaw);

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
      }

      const historyRaw = localStorage.getItem("navora-search-history-v1");

      if (historyRaw) {
        const savedHistory = JSON.parse(historyRaw);

        if (Array.isArray(savedHistory)) {
          setHistory(savedHistory);
        }
      }
    } catch (err) {
      console.log("Saved data load failed:", err);
    } finally {
      setHistoryLoaded(true);
    }
  }, []);

  // ---------- Save Profile Changes ----------
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

  // ---------- Save Search History ----------
  useEffect(() => {
    if (!historyLoaded) return;

    try {
      localStorage.setItem("navora-search-history-v1", JSON.stringify(history));
    } catch (err) {
      console.log("Search history save failed:", err);
    }
  }, [history, historyLoaded]);

  // ---------- Search Validation ----------

  function validate() {
    const err = {};

    const list = uniqueCodes([...origins, ...parseAirportCodes(originInput)]);

    if (list.length < 1 || list.length > 5) {
      err.origins = "Save 1 to 5 origin airports.";
    }

    if (list.some((code) => !iata.test(code))) {
      err.origins = "Use 3-letter IATA codes only.";
    }

    if (!iata.test(destination.trim().toUpperCase())) {
      err.destination = "Destination must be a 3-letter IATA code.";
    }

    if (!depart) {
      err.depart = "Select a departure date.";
    }

    if (tripType === "round-trip" && !returnDate) {
      err.returnDate = "Select a return date.";
    }

    if (
      tripType === "round-trip" &&
      depart &&
      returnDate &&
      returnDate < depart
    ) {
      err.returnDate = "Return date cannot be before departure.";
    }

    setErrors(err);

    return Object.keys(err).length === 0 ? list : null;
  }
  // ---------- Airport Management ----------
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
  // ---------- Flight Search Submission ----------
  function onSubmit(e) {
    e.preventDefault();

    const list = validate();
    if (!list) return;

    setOrigins(list);
    setOriginInput("");

    const payload = {
      origins: list,
      destination: destination.trim().toUpperCase(),
      tripType,
      depart,
      returnDate: tripType === "round-trip" ? returnDate : "",
      passengers,
      cabinClass,
    };

    // ---------- Temporary Mock Flight Results ----------
    const airlines = [
      "Delta",
      "American Airlines",
      "United Airlines",
      "Southwest",
    ];

    const mockFlights = list.flatMap((origin, originIndex) => [
      {
        id: `${origin}-1`,
        airline: airlines[originIndex % airlines.length],
        origin,
        destination: payload.destination,
        departureTime: "8:15 AM",
        arrivalTime: "11:05 AM",
        duration: "2h 50m",
        stops: "Nonstop",
        price: 189 + originIndex * 35,
      },
      {
        id: `${origin}-2`,
        airline: airlines[(originIndex + 1) % airlines.length],
        origin,
        destination: payload.destination,
        departureTime: "1:40 PM",
        arrivalTime: "5:25 PM",
        duration: "3h 45m",
        stops: "1 stop",
        price: 149 + originIndex * 30,
      },
    ]);

    console.log("SEARCH:", payload);

    setResults(payload);
    setFlightOptions(mockFlights);
    setHistory((prev) => [payload, ...prev].slice(0, 5));
  }

  // ---------- Search History ----------
  function clearHistory() {
    setHistory([]);
    setResults(null);
    setErrors({});
  }

  function loadSearch(item) {
    setOrigins(item.origins);
    setDestination(item.destination);
    setTripType(item.tripType || "round-trip");
    setDepart(item.depart);
    setReturnDate(item.returnDate || "");
    setPassengers(item.passengers || 1);
    setCabinClass(item.cabinClass || "economy");
    setResults(item);
    setOriginInput("");
    setErrors({});
  }
  // ---------- Navigation Bar ----------
  function Navbar() {
    return (
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <button
          type="button"
          onClick={() => setStep("welcome")}
          className="font-bold text-lg"
        >
          Navora
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
  // ---------- Welcome Page ----------
  if (step === "welcome") {
    return (
      <section className="min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-black text-white">
        <Navbar />

        <div className="mx-auto flex min-h-[calc(100vh-65px)] max-w-5xl flex-col justify-between px-6 py-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-300">
              Smarter flight search
            </p>

            <h1 className="mt-6 text-5xl font-bold tracking-tight sm:text-6xl">
              Welcome to Navora
            </h1>

            <p className="mt-5 text-2xl font-semibold text-blue-200">
              Search once. Fly smarter.
            </p>

            <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-slate-300">
              Navora helps you search flights from multiple airports at once, so
              you get more options without repeating the same search over and
              over.
            </p>
          </div>

          <div className="my-16 grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-lg font-semibold">Save your airports</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Add your home airport and nearby airports once.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-lg font-semibold">Run one search</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Navora checks every saved airport for the same destination.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-lg font-semibold">Compare better options</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Review flights from every airport without opening multiple tabs.
              </p>
            </div>
          </div>

          <div className="mx-auto w-full max-w-xl text-center">
            <p className="mb-6 text-slate-300">
              Here at Navora, we aim to make your travel experience as seamless
              as possible.
            </p>

            <button
              type="button"
              onClick={() => setStep("account")}
              className="w-full rounded-xl bg-blue-600 px-6 py-4 text-lg font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:bg-blue-500"
            >
              Get Started
            </button>
          </div>
        </div>
      </section>
    );
  }
  // ---------- Account Choice Page ----------
  if (step === "account") {
    const hasSavedProfile =
      profile.firstName.trim() !== "" && origins.length > 0;

    return (
      <section className="min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-black text-white">
        <Navbar />

        <div className="mx-auto max-w-xl px-6 py-16">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h1 className="text-3xl font-bold">Welcome to Navora</h1>

            <p className="mt-3 text-slate-300">
              Create a new profile or continue with a profile saved on this
              device.
            </p>

            <div className="mt-8 flex flex-col gap-4">
              <button
                type="button"
                onClick={() => {
                  setProfile({
                    firstName: "",
                    lastName: "",
                    birthday: "",
                    address: "",
                  });
                  setHomeAirport("");
                  setOrigins([]);
                  setDestination("");
                  setDepart("");
                  setResults(null);
                  setErrors({});
                  setStep("profile");
                }}
                className="w-full rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-500"
              >
                Create New Profile
              </button>

              {hasSavedProfile && (
                <button
                  type="button"
                  onClick={() => setStep("search")}
                  className="w-full rounded-xl bg-white/10 px-6 py-3 font-semibold text-white hover:bg-white/20"
                >
                  Continue with {profile.firstName}
                </button>
              )}

              <button
                type="button"
                disabled
                className="w-full cursor-not-allowed rounded-xl border border-white/10 px-6 py-3 font-semibold text-white opacity-50"
              >
                Log In, Coming Later
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }
  // ---------- Profile Page ----------
  if (step === "profile") {
    const isEditingProfile = origins.length > 0;
    return (
      <section className="min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-black text-white">
        <Navbar />
        <div className="mx-auto max-w-2xl px-6 py-16">
          <h1 className="text-4xl font-bold">
            {isEditingProfile ? "Edit Your Profile" : "Create Your Profile"}
          </h1>

          <p className="mt-2 text-sm opacity-80">
            {isEditingProfile
              ? "Update your personal information or manage your saved airports."
              : "Enter your information so Navora can set up your saved airports."}
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

            {/* ---------- Saved Airports Section ---------- */}
            <div className="mt-2 rounded-xl border border-blue-400/20 bg-blue-500/10 p-5">
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
              onClick={() => setStep(isEditingProfile ? "search" : "airports")}
              disabled={
                !profile.firstName.trim() ||
                !profile.lastName.trim() ||
                !profile.birthday ||
                !profile.address.trim()
              }
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded"
            >
              {isEditingProfile ? "Save Changes" : "Continue to Airports"}
            </button>
          </form>
        </div>
      </section>
    );
  }
  // ---------- Airport Setup Page ----------
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
  // ---------- Flight Search Page ----------
  if (step === "search") {
    return (
      <section className="min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-black text-white">
        <Navbar />
        <div className="mx-auto max-w-2xl px-6 py-10">
          <h1 className="text-4xl font-bold">Search Flights</h1>

          <p className="mt-3 text-slate-300">
            Search all your saved airports with one destination.
          </p>
          <form
            onSubmit={onSubmit}
            className="mt-8 w-full max-w-xl bg-white/5 rounded-2xl p-6 shadow-lg ring-1 ring-white/10 flex flex-col gap-4"
          >
            {/* ---------- Trip Type Controls ---------- */}
            <div>
              <p className="mb-2 text-sm font-medium">Trip Type</p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTripType("round-trip")}
                  className={`rounded-lg px-4 py-2 font-semibold ${
                    tripType === "round-trip"
                      ? "bg-blue-600 text-white"
                      : "bg-white/10 text-slate-300 hover:bg-white/20"
                  }`}
                >
                  Round Trip
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTripType("one-way");
                    setReturnDate("");
                  }}
                  className={`rounded-lg px-4 py-2 font-semibold ${
                    tripType === "one-way"
                      ? "bg-blue-600 text-white"
                      : "bg-white/10 text-slate-300 hover:bg-white/20"
                  }`}
                >
                  One Way
                </button>
              </div>
            </div>
            <div className="rounded-xl border border-blue-400/20 bg-blue-500/10 p-5">
              <p className="text-sm font-medium text-blue-200">
                Searching from
              </p>

              <p className="mt-2 text-lg font-semibold">
                {origins.length > 0
                  ? origins.join(", ")
                  : "No airports saved yet"}
              </p>

              {origins.length === 0 && (
                <div className="mt-3">
                  <p className="text-sm text-slate-300">
                    Add your home airport and nearby airports from your profile.
                  </p>

                  {/* ---------- Airport Setup Shortcut ---------- */}
                  <button
                    type="button"
                    onClick={() => setStep("profile")}
                    className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                  >
                    Set Up Airports
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block mb-1 text-sm">Destination Airport</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. LAX"
                disabled={origins.length === 0}
                className="w-full p-2 rounded bg-white text-black disabled:opacity-50 disabled:cursor-not-allowed"
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
                disabled={origins.length === 0}
                className="w-full p-2 rounded bg-white text-black disabled:opacity-50 disabled:cursor-not-allowed"
              />

              {errors.depart && (
                <p className="mt-1 text-sm text-red-400">{errors.depart}</p>
              )}
            </div>

            {/* ---------- Return Date Field ---------- */}
            {tripType === "round-trip" && (
              <div>
                <label className="block mb-1 text-sm">Return date</label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  disabled={origins.length === 0}
                  min={depart || undefined}
                  className="w-full p-2 rounded bg-white text-black disabled:opacity-50 disabled:cursor-not-allowed"
                />

                {errors.returnDate && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.returnDate}
                  </p>
                )}
              </div>
            )}

            {/* ---------- Passenger and Cabin Details ---------- */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm">Passengers</label>
                <select
                  value={passengers}
                  onChange={(e) => setPassengers(Number(e.target.value))}
                  disabled={origins.length === 0}
                  className="w-full p-2 rounded bg-white text-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value={1}>1 Passenger</option>
                  <option value={2}>2 Passengers</option>
                  <option value={3}>3 Passengers</option>
                  <option value={4}>4 Passengers</option>
                  <option value={5}>5 Passengers</option>
                  <option value={6}>6 Passengers</option>
                  <option value={7}>7 Passengers</option>
                  <option value={8}>8 Passengers</option>
                  <option value={9}>9 Passengers</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm">Cabin Class</label>
                <select
                  value={cabinClass}
                  onChange={(e) => setCabinClass(e.target.value)}
                  disabled={origins.length === 0}
                  className="w-full p-2 rounded bg-white text-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="economy">Economy</option>
                  <option value="premium-economy">Premium Economy</option>
                  <option value="business">Business</option>
                  <option value="first">First Class</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={
                origins.length === 0 ||
                !destination.trim() ||
                !depart ||
                (tripType === "round-trip" && !returnDate)
              }
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
                <span className="font-bold">Trip Type:</span>{" "}
                {results.tripType === "one-way" ? "One Way" : "Round Trip"}
              </p>

              <p className="text-sm">
                <span className="font-bold">Departure:</span>{" "}
                {results.depart || "(none)"}
              </p>

              {results.tripType === "round-trip" && (
                <p className="text-sm">
                  <span className="font-bold">Return:</span>{" "}
                  {results.returnDate || "(none)"}
                </p>
              )}

              <p className="text-sm">
                <span className="font-bold">Passengers:</span>{" "}
                {results.passengers || 1}
              </p>

              <p className="text-sm">
                <span className="font-bold">Cabin Class:</span>{" "}
                {(results.cabinClass || "economy")
                  .replace("-", " ")
                  .replace(/\b\w/g, (letter) => letter.toUpperCase())}
              </p>
            </div>
          )}

          {/* ---------- Temporary Flight Results ---------- */}
          {flightOptions.length > 0 && (
            <div className="mt-6 w-full max-w-xl">
              {/* ---------- Flight Results Header and Sorting ---------- */}
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Flight Options</h2>

                  <p className="text-sm text-slate-300">
                    {flightOptions.length} results
                  </p>
                </div>

                <div className="mt-3">
                  <label className="mb-1 block text-sm text-slate-300">
                    Sort By
                  </label>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full rounded-lg bg-white p-2 text-black"
                  >
                    <option value="price">Lowest Price</option>
                    <option value="departure">Earliest Departure</option>
                    <option value="duration">Shortest Duration</option>
                  </select>
                </div>
              </div>

              {/* ---------- Sorted Flight Cards ---------- */}
              <div className="space-y-4">
                {[...flightOptions]
                  .sort((a, b) => {
                    if (sortBy === "price") {
                      return a.price - b.price;
                    }

                    if (sortBy === "departure") {
                      return (
                        new Date(`1970-01-01 ${a.departureTime}`) -
                        new Date(`1970-01-01 ${b.departureTime}`)
                      );
                    }

                    if (sortBy === "duration") {
                      const getMinutes = (duration) => {
                        const hours = Number(
                          duration.match(/(\d+)h/)?.[1] || 0,
                        );

                        const minutes = Number(
                          duration.match(/(\d+)m/)?.[1] || 0,
                        );

                        return hours * 60 + minutes;
                      };

                      return getMinutes(a.duration) - getMinutes(b.duration);
                    }

                    return 0;
                  })
                  .map((flight) => (
                    <div
                      key={flight.id}
                      className="rounded-2xl border border-white/10 bg-white/5 p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold">{flight.airline}</p>

                          <p className="mt-1 text-sm text-slate-300">
                            {flight.origin} to {flight.destination}
                          </p>
                        </div>

                        <p className="text-xl font-bold">${flight.price}</p>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-400">
                            Departure
                          </p>

                          <p className="mt-1 font-semibold">
                            {flight.departureTime}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-400">
                            Arrival
                          </p>

                          <p className="mt-1 font-semibold">
                            {flight.arrivalTime}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
                        <span>{flight.duration}</span>
                        <span>{flight.stops}</span>
                      </div>

                      <button
                        type="button"
                        className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500"
                      >
                        View Flight
                      </button>
                    </div>
                  ))}
              </div>
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
                        <span className="font-bold">Trip Type:</span>{" "}
                        {item.tripType === "one-way" ? "One Way" : "Round Trip"}
                      </div>

                      <div className="text-sm">
                        <span className="font-bold">Departure:</span>{" "}
                        {item.depart || "(none)"}
                      </div>

                      {item.tripType === "round-trip" && (
                        <div className="text-sm">
                          <span className="font-bold">Return:</span>{" "}
                          {item.returnDate || "(none)"}
                        </div>
                      )}

                      <div className="text-sm">
                        <span className="font-bold">Passengers:</span>{" "}
                        {item.passengers || 1}
                      </div>

                      <div className="text-sm">
                        <span className="font-bold">Cabin Class:</span>{" "}
                        {(item.cabinClass || "economy")
                          .replace("-", " ")
                          .replace(/\b\w/g, (letter) => letter.toUpperCase())}
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
