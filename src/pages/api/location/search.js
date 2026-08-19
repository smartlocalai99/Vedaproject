const NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search";
const ADDRESS_PARTS = [
  "house_number",
  "road",
  "neighbourhood",
  "suburb",
  "village",
  "town",
  "city",
  "municipality",
  "county",
  "state",
  "postcode",
];

const normaliseForComparison = (value = "") =>
  value.toLowerCase().replace(/[^a-z0-9]/g, "");

const uniqueAddressParts = (parts) => {
  const seen = new Set();

  return parts.filter((part) => {
    const key = normaliseForComparison(part);

    if (!key || seen.has(key)) return false;

    seen.add(key);
    return true;
  });
};

const formatAddress = (location) => {
  const address = location?.address || {};
  const parts = ADDRESS_PARTS.map((key) => address[key]).filter(Boolean);
  const primaryName =
    location?.namedetails?.name ||
    location?.name ||
    location?.display_name?.split(",")[0]?.trim() ||
    "";

  if (
    primaryName &&
    !parts.some(
      (part) =>
        normaliseForComparison(part) === normaliseForComparison(primaryName)
    )
  ) {
    parts.unshift(primaryName);
  }

  return uniqueAddressParts(parts).join(", ") || location?.display_name || "";
};

const queryVariants = (query) => {
  const normalised = query.replace(/\s+/g, " ").trim();
  const withoutPunctuation = normalised
    .replace(/[.,/#!$%^&*;:{}=_`~()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const terms = withoutPunctuation.split(" ").filter((term) => term.length >= 2);
  const meaningfulTail = terms.length > 2 ? terms.slice(-3).join(" ") : "";

  return [...new Set([query, normalised, withoutPunctuation, meaningfulTail])].filter(
    Boolean
  );
};

const scoreLocation = (location, query) => {
  const formattedAddress = formatAddress(location);
  const searchableAddress = `${formattedAddress} ${location.display_name || ""}`.toLowerCase();
  const terms = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((term) => term.length >= 2);
  const matchingTerms = terms.filter((term) => searchableAddress.includes(term)).length;
  const addressPartCount = ADDRESS_PARTS.filter((key) => location.address?.[key]).length;
  const isAndhraPradesh = /andhra pradesh/i.test(location.address?.state || "");

  return matchingTerms * 100 + addressPartCount * 10 + (isAndhraPradesh ? 25 : 0);
};

const isUsefulResult = (locations, query) =>
  locations.some((location) => scoreLocation(location, query) >= 130);

async function searchNominatim(query) {
  const params = new URLSearchParams({
    format: "jsonv2",
    addressdetails: "1",
    namedetails: "1",
    limit: "8",
    countrycodes: "in",
    q: query,
  });
  const response = await fetch(`${NOMINATIM_SEARCH_URL}?${params}`, {
    headers: {
      Accept: "application/json",
      "User-Agent": "Veda Vendor Registration Location Search",
    },
  });
  const contentType = response.headers.get("content-type") || "";

  if (!response.ok || !contentType.includes("application/json")) {
    throw new Error("Location search returned an invalid response.");
  }

  const data = await response.json();
  return Array.isArray(data) ? data.filter((location) => location?.place_id) : [];
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({
      results: [],
      error: "Method not allowed.",
    });
  }

  const query = typeof req.query.q === "string" ? req.query.q.trim() : "";

  if (!query) {
    return res.status(200).json({ results: [] });
  }

  try {
    const variants = queryVariants(query);
    let locations = await searchNominatim(variants[0]);

    if (!isUsefulResult(locations, query)) {
      for (const variant of variants.slice(1)) {
        const fallbackResults = await searchNominatim(variant);
        locations = [...locations, ...fallbackResults];

        if (isUsefulResult(locations, query)) break;
      }
    }

    const uniqueLocations = new Map();

    locations.forEach((location) => {
      const formattedAddress = formatAddress(location);

      if (!formattedAddress) return;

      const key = normaliseForComparison(formattedAddress);
      const result = {
        place_id: String(location.place_id),
        display_name: location.display_name || formattedAddress,
        formatted_address: formattedAddress,
        lat: location.lat || "",
        lon: location.lon || "",
        score: scoreLocation(location, query),
      };
      const existing = uniqueLocations.get(key);

      if (!existing || result.score > existing.score) {
        uniqueLocations.set(key, result);
      }
    });

    const results = [...uniqueLocations.values()]
      .sort((first, second) => second.score - first.score)
      .slice(0, 8)
      .map(({ score, ...location }) => location);

    return res.status(200).json({ results });
  } catch (error) {
    console.error("NOMINATIM LOCATION SEARCH ERROR:", error);
    return res.status(502).json({
      results: [],
      error: "Could not search locations. Please try again.",
    });
  }
}
