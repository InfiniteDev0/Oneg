// Next.js API route to proxy requests to newsdata.io and avoid CORS issues
export default async function handler(req, res) {
  const { category = "health,science" } = req.query;
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;

  const url = `https://newsdata.io/api/1/latest?apikey=${apiKey}&category=${encodeURIComponent(category)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: "Failed to fetch news" });
    }
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
