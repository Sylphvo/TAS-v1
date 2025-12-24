// ======= Helpers =======
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
const asZoom = () =>
    clamp(10, 1, 22);
function openUrl(u) {
    window.open(u, "_blank", "noopener,noreferrer");
}
function buildUrlWithData(geo, zoom) {
    const { lat, lon } = getCenter(geo);
    const dataStr = encodeURIComponent(JSON.stringify(geo));
    return `https://geojson.io/#data=data:application/json,${dataStr}&map=${zoom}/${lat.toFixed(
        5
    )}/${lon.toFixed(5)}`;
}
// Lấy tâm từ GeoJSON (Feature | FeatureCollection)
function getCenter(geo) {
    try {
        if (geo.type === "Feature")
            return bboxCenterAny(geo.geometry.coordinates);
        if (geo.type === "FeatureCollection") {
            const all = [];
            for (const f of geo.features || [])
                collectPairs(f.geometry?.coordinates, all);
            if (!all.length) return { lat: 0, lon: 0 };
            let minX = Infinity,
                minY = Infinity,
                maxX = -Infinity,
                maxY = -Infinity;
            for (const [x, y] of all) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
            return { lat: (minY + maxY) / 2, lon: (minX + maxX) / 2 };
        }
        // Geometry đơn lẻ
        if (geo.coordinates) return bboxCenterAny(geo.coordinates);
    } catch { }
    return { lat: 0, lon: 0 };
}
// Tính bbox center cho mọi kiểu GeoJSON coordinates
function bboxCenterAny(coords) {
    const pts = collectPairs(coords);
    if (!pts.length) return { lat: 0, lon: 0 };
    let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
    for (const [x, y] of pts) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
    }
    return { lat: (minY + maxY) / 2, lon: (minX + maxX) / 2 };
}
// Thu thập mọi cặp [lng,lat] mà không "flat" thành số rời
function collectPairs(a, out = []) {
    if (
        Array.isArray(a) &&
        typeof a[0] === "number" &&
        typeof a[1] === "number"
    ) {
        out.push([a[0], a[1]]);
        return out;
    }
    if (Array.isArray(a)) for (const v of a) collectPairs(v, out);
    return out;
}
