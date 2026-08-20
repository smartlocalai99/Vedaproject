const PHOTON_REVERSE_URL = "https://photon.komoot.io/reverse";

const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const uniqueParts = (parts) =>
  parts.filter(
    (part, index) =>
      part &&
      parts.findIndex(
        (candidate) =>
          String(candidate).trim().toLowerCase() ===
          String(part).trim().toLowerCase()
      ) === index
  );

const formatAddress = (properties = {}) =>
  uniqueParts([
    properties.name,
    [properties.housenumber, properties.street].filter(Boolean).join(" "),
    properties.locality,
    properties.district,
    properties.city || properties.town || properties.village,
    properties.county,
    properties.state,
    properties.postcode,
    properties.country,
  ]).join(", ");

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const latitude = Number(req.query.lat);
  const longitude = Number(req.query.lon);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return res.status(400).json({
      error: "A valid latitude and longitude are required.",
    });
  }

  try {
    const params = new URLSearchParams({
      lat: String(latitude),
      lon: String(longitude),
      lang: "en",
    });
    let response;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      response = await fetch(`${PHOTON_REVERSE_URL}?${params}`, {
        headers: {
          Accept: "application/json",
          "Accept-Language": "en",
          "User-Agent": "VedaVendorRegistration/1.0",
        },
      });

      if (response.ok || response.status < 500 || attempt === 2) {
        break;
      }

      await wait((attempt + 1) * 750);
    }

    const contentType = response.headers.get("content-type") || "";

    if (!response.ok || !contentType.includes("application/json")) {
      throw new Error(
        `Reverse geocoding service is temporarily unavailable (status ${response.status || "unknown"}). Please try again.`
      );
    }

    const data = await response.json();
    const properties = data?.features?.[0]?.properties;
    const formattedAddress = formatAddress(properties);

    if (!formattedAddress) {
      return res.status(404).json({
        error: "No address was found for these coordinates.",
      });
    }

    return res.status(200).json({ formatted_address: formattedAddress });
  } catch (error) {
    console.error("PHOTON REVERSE LOCATION ERROR:", error);
    return res.status(502).json({
      error: "Could not look up the current location address.",
    });
  }
}
