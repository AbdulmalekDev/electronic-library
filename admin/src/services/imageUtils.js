export const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.png";
    if (imagePath.startsWith("http")) return imagePath;

    const baseUrl = process.env.REACT_APP_API_URL?.replace("/api", "") || "http://localhost:5001";
    const cleanPath = imagePath.replace(/\\/g, "/");
    const finalPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;

    return `${baseUrl}${finalPath}`;
};
